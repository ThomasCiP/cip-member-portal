-- ============================================================================
-- CiP Member Portal — Email notifications feature. Applied to fgfxdutafqdhnmznpsdj.
--
-- Pipeline: message/group_post/announcement insert -> SECURITY DEFINER trigger
-- inserts notification row(s) -> AFTER INSERT trigger on notifications ->
-- pg_net async POST {notification_id} to the send-notification-email edge
-- function -> checks prefs + throttle -> Resend -> marks email_sent_at.
--
-- Pairs with supabase/functions/send-notification-email/index.ts (deploy with
-- verify_jwt=false). Config lives in Vault, read by the edge fn via notify_config().
-- ============================================================================

create extension if not exists pg_net;

alter table public.notifications
  add column if not exists data jsonb not null default '{}'::jsonb,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_error text;

-- Vault config. notify_resend_api_key / notify_from_email / notify_app_base_url
-- are created later (once Resend is set up) via vault.create_secret; until then
-- the edge function no-ops cleanly (skip: no_provider).
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'notify_shared_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'notify_shared_secret', 'Shared secret for send-notification-email');
  end if;
  if not exists (select 1 from vault.secrets where name = 'notify_email_url') then
    perform vault.create_secret('https://fgfxdutafqdhnmznpsdj.functions.supabase.co/send-notification-email', 'notify_email_url', 'send-notification-email URL');
  end if;
  if not exists (select 1 from vault.secrets where name = 'notify_anon_key') then
    perform vault.create_secret('<ANON_KEY>', 'notify_anon_key', 'Anon key for edge fn gateway auth');
  end if;
end $$;

-- Service-role-only config accessor for the edge function.
create or replace function public.notify_config()
returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'shared_secret',  (select decrypted_secret from vault.decrypted_secrets where name = 'notify_shared_secret'),
    'resend_api_key', (select decrypted_secret from vault.decrypted_secrets where name = 'notify_resend_api_key'),
    'from_email',     (select decrypted_secret from vault.decrypted_secrets where name = 'notify_from_email'),
    'app_base_url',   (select decrypted_secret from vault.decrypted_secrets where name = 'notify_app_base_url')
  );
$$;
revoke all on function public.notify_config() from public, anon, authenticated;
grant execute on function public.notify_config() to service_role;

-- Direct message -> one notification for the receiver (bell shows every message).
create or replace function public.notify_direct_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare sender_name text;
begin
  select nullif(trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')), '')
    into sender_name from public.profiles where id = new.sender_id;
  insert into public.notifications (user_id, type, title, message, data)
  values (new.receiver_id, 'direct_message', 'New message',
          coalesce(sender_name, 'A member') || ' sent you a message.',
          jsonb_build_object('peer_id', new.sender_id, 'message_id', new.id));
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_notify_direct_message on public.messages;
create trigger trg_notify_direct_message after insert on public.messages
  for each row execute function public.notify_direct_message();

-- Group post -> fan out to members except the author.
create or replace function public.notify_group_post()
returns trigger language plpgsql security definer set search_path = public as $$
declare gname text; author text;
begin
  select name into gname from public.groups where id = new.group_id;
  select nullif(trim(coalesce(first_name,'') || ' ' || coalesce(last_name,'')), '')
    into author from public.profiles where id = new.user_id;
  insert into public.notifications (user_id, type, title, message, data)
  select gm.user_id, 'group_post',
         coalesce(gname, 'Group') || ': new post',
         coalesce(author, 'A member') || ' posted in ' || coalesce(gname, 'a group') || '.',
         jsonb_build_object('group_id', new.group_id, 'post_id', new.id)
  from public.group_members gm
  where gm.group_id = new.group_id and gm.user_id <> new.user_id;
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_notify_group_post on public.group_posts;
create trigger trg_notify_group_post after insert on public.group_posts
  for each row execute function public.notify_group_post();

-- Announcement published -> fan out to active members.
create or replace function public.notify_announcement_published()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'Published' and (tg_op = 'INSERT' or old.status is distinct from 'Published') then
    insert into public.notifications (user_id, type, title, message, data)
    select p.id, 'announcement', coalesce(new.title, 'New announcement'),
           coalesce(new.title, 'A new announcement was posted.'),
           jsonb_build_object('announcement_id', new.id)
    from public.profiles p
    where p.deleted_at is null and p.suspended_at is null;
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_notify_announcement_published on public.announcements;
create trigger trg_notify_announcement_published after insert or update on public.announcements
  for each row execute function public.notify_announcement_published();

-- Any new notification -> async POST to the edge function.
create or replace function public.queue_notification_email()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_secret text; v_url text; v_key text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_shared_secret';
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'notify_email_url';
  select decrypted_secret into v_key    from vault.decrypted_secrets where name = 'notify_anon_key';
  if v_url is null or v_secret is null then return new; end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || coalesce(v_key,''),'x-notify-secret', v_secret),
    body := jsonb_build_object('notification_id', new.id));
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_queue_notification_email on public.notifications;
create trigger trg_queue_notification_email after insert on public.notifications
  for each row execute function public.queue_notification_email();

-- Trigger functions run via the trigger, never via RPC; remove API exposure.
revoke execute on function public.notify_direct_message() from public, anon, authenticated;
revoke execute on function public.notify_group_post() from public, anon, authenticated;
revoke execute on function public.notify_announcement_published() from public, anon, authenticated;
revoke execute on function public.queue_notification_email() from public, anon, authenticated;

-- ============================================================================
-- ONE-TIME SETUP once Resend is ready (run after verifying a sending domain):
--   select vault.create_secret('re_xxx...',                         'notify_resend_api_key');
--   select vault.create_secret('CiP <notifications@christiansinpolitics.com>', 'notify_from_email');
--   select vault.create_secret('https://<deployed-app-url>',        'notify_app_base_url');
-- (or vault.update_secret(id, new_value) if they already exist)
-- ============================================================================
