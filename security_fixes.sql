-- ============================================================================
-- CiP Member Portal — Security hardening migration
-- Addresses review findings C1, C2, C4, H1, H2, H3, M3, K1 (see review).
-- Verified against live DB fgfxdutafqdhnmznpsdj. Apply in Supabase SQL editor.
--
-- NOT included here (needs coordinated app changes — do separately):
--   C3: lock down profiles SELECT via a safe-columns view (member cards read select('*')).
--   M5: enable leaked-password protection (Auth settings toggle, not SQL).
-- ============================================================================

-- Bypass-RLS admin check. SECURITY DEFINER so it does not recurse when used
-- inside policies ON the profiles table.
create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists(select 1 from public.profiles where id = uid and is_admin = true);
$$;
revoke execute on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

-- Grant the real admin (thomas@christiansinpolitics.com) BEFORE the escalation
-- trigger exists, so the bootstrap update is not blocked by it.
update public.profiles set is_admin = true, role = 'admin'
where id = '84f2f49d-6cb8-4000-af69-101364312e31';

-- C1: prevent non-admins from changing privilege columns on their own row.
-- Null auth.uid() (service role / SQL editor) is allowed so admins can be
-- granted out-of-band; existing admins may promote/demote others.
create or replace function public.prevent_privilege_escalation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (new.is_admin is distinct from old.is_admin or new.role is distinct from old.role) then
    if auth.uid() is not null and not public.is_admin(auth.uid()) then
      raise exception 'Not authorized to modify privilege fields';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_prevent_privilege_escalation on public.profiles;
create trigger trg_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_privilege_escalation();
-- Trigger functions run via the trigger, never via RPC; remove API exposure.
revoke execute on function public.prevent_privilege_escalation() from public, anon, authenticated;

-- C2 / K1: admin override so a real admin can suspend/delete members and groups
-- (today those admin actions silently update 0 rows).
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update all groups" on public.groups;
create policy "Admins can update all groups" on public.groups
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete all groups" on public.groups;
create policy "Admins can delete all groups" on public.groups
  for delete to authenticated
  using (public.is_admin(auth.uid()));

-- H1: scope group_images writes to the uploader (owner), matching the working
-- avatars UPDATE/DELETE pattern. Files are named "<uid>-<rand>.ext" so folder
-- scoping does not apply; the auto-populated owner column is the right key.
drop policy if exists "Users can update their group images" on storage.objects;
create policy "Users can update their group images" on storage.objects
  for update to authenticated
  using (bucket_id = 'group_images' and auth.uid() = owner)
  with check (bucket_id = 'group_images' and auth.uid() = owner);

drop policy if exists "Users can delete their group images" on storage.objects;
create policy "Users can delete their group images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'group_images' and auth.uid() = owner);

-- H2: harden delete_current_user (currently callable by anon, mutable search_path)
revoke execute on function public.delete_current_user() from anon, public;
grant execute on function public.delete_current_user() to authenticated;
alter function public.delete_current_user() set search_path = '';

-- H3: let members leave groups and unregister from events (no DELETE policy today)
drop policy if exists "Users can leave groups" on public.group_members;
create policy "Users can leave groups" on public.group_members
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can unregister from events" on public.event_attendees;
create policy "Users can unregister from events" on public.event_attendees
  for delete to authenticated using (auth.uid() = user_id);

-- H3: let admins update/delete events
drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events" on public.events
  for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events" on public.events
  for delete to authenticated using (public.is_admin(auth.uid()));

-- M3: add WITH CHECK to admin FOR ALL policies (were USING-only)
drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements" on public.announcements
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "Admins can manage resources" on public.resources;
create policy "Admins can manage resources" on public.resources
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "Admins can manage affiliated_orgs" on public.affiliated_orgs;
create policy "Admins can manage affiliated_orgs" on public.affiliated_orgs
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- C4: restrict member feed reads to signed-in users (was public/anon-readable)
drop policy if exists "Public read access for global_posts" on public.global_posts;
create policy "Authenticated can read global_posts" on public.global_posts
  for select to authenticated using (true);
