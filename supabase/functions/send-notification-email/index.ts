// Supabase Edge Function: send-notification-email
// Invoked (async, fire-and-forget) by the `trg_queue_notification_email` trigger
// on public.notifications via pg_net, with body { notification_id }.
//
// It re-reads the notification with the service role, checks the recipient's
// notification_preferences (per-type + master email_enabled toggle), throttles
// direct-message emails, resolves the recipient's auth email, and sends via
// Resend. It NEVER throws — a failed email must not affect the in-app bell.
//
// Config (shared secret + Resend key + from address + app URL) is read from
// Vault via the service-role-only public.notify_config() RPC. Deploy with
// verify_jwt = false (the DB trigger has no end-user JWT); the shared secret in
// the `x-notify-secret` header is what authorizes the call.

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-notify-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// notification.type -> notification_preferences key. Types not listed here are
// in-app only (e.g. content_reported / moderation alerts).
const PREF_KEY: Record<string, string> = {
  direct_message: "direct_messages",
  group_post: "group_activity",
  connection_invite: "connection_requests",
  connection_accepted: "connection_requests",
  announcement: "announcements",
  mention: "mentions",
};

const DM_THROTTLE_MINUTES = 15;

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function renderHtml(title: string, message: string, appUrl: string | null) {
  const cta = appUrl
    ? `<a href="${esc(appUrl)}" style="display:inline-block;margin-top:20px;background:#0b2545;color:#fff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-weight:600;font-size:14px">Open Christians in Politics</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dcd6c8">
      <tr><td style="background:#0b2545;padding:20px 28px;color:#c9a227;font-weight:700;font-size:16px">Christians in Politics</td></tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 10px;font-size:20px;color:#0b2545">${esc(title)}</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#374151">${esc(message)}</p>
        ${cta}
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #eee;color:#9ca3af;font-size:12px">
        You're receiving this because you have email notifications on. Manage them in your profile menu &rarr; Notifications.
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cfg } = await admin.rpc("notify_config");
    const sharedSecret = cfg?.shared_secret as string | undefined;

    // Auth: the DB trigger proves itself with the shared secret header.
    if (!sharedSecret || req.headers.get("x-notify-secret") !== sharedSecret) {
      return json({ ok: false, error: "unauthorized" }, 401);
    }

    const { notification_id } = await req.json();
    if (!notification_id) return json({ ok: false, error: "missing notification_id" }, 400);

    const { data: n } = await admin
      .from("notifications")
      .select("id, user_id, type, title, message, data, email_sent_at")
      .eq("id", notification_id)
      .maybeSingle();

    if (!n) return json({ ok: true, skip: "not_found" });
    if (n.email_sent_at) return json({ ok: true, skip: "already_sent" });

    // 'welcome' is transactional (sent once at signup) and bypasses preference
    // gating — a brand-new account has no meaningful prefs yet (feedback #20).
    const isTransactional = n.type === "welcome";

    // Only certain types email at all.
    const prefKey = PREF_KEY[n.type as string];
    if (!prefKey && !isTransactional) return json({ ok: true, skip: "type_in_app_only" });

    if (!isTransactional) {
      // Preference gating (opt-out model: missing key => enabled).
      const { data: prof } = await admin
        .from("profiles")
        .select("notification_preferences")
        .eq("id", n.user_id)
        .maybeSingle();
      const prefs = (prof?.notification_preferences ?? {}) as Record<string, boolean>;
      if (prefs.email_enabled === false) return json({ ok: true, skip: "email_disabled" });
      if (prefs[prefKey] === false) return json({ ok: true, skip: `pref:${prefKey}` });
    }

    // Direct-message throttle: at most one email per sender per window.
    if (n.type === "direct_message") {
      const peerId = (n.data as Record<string, unknown>)?.peer_id;
      if (peerId) {
        const since = new Date(Date.now() - DM_THROTTLE_MINUTES * 60_000).toISOString();
        const { data: recent } = await admin
          .from("notifications")
          .select("id")
          .eq("user_id", n.user_id)
          .eq("type", "direct_message")
          .eq("data->>peer_id", peerId)
          .gt("email_sent_at", since)
          .limit(1);
        if (recent && recent.length > 0) return json({ ok: true, skip: "throttled" });
      }
    }

    // Recipient email = the address they signed up with.
    const { data: userRes } = await admin.auth.admin.getUserById(n.user_id);
    const email = userRes?.user?.email;
    if (!email) return json({ ok: true, skip: "no_email" });

    // Config comes from function env secrets first (e.g. RESEND_API_KEY), then Vault.
    const resendKey = Deno.env.get("RESEND_API_KEY") ?? Deno.env.get("Resend API Key")
      ?? Deno.env.get("RESEND_KEY") ?? Deno.env.get("RESEND") ?? Deno.env.get("RESEND_TOKEN")
      ?? (cfg?.resend_api_key as string | undefined);
    const fromEmail = Deno.env.get("RESEND_FROM") ?? Deno.env.get("NOTIFY_FROM_EMAIL") ?? (cfg?.from_email as string | undefined);
    const appUrl = Deno.env.get("APP_BASE_URL") ?? (cfg?.app_base_url as string | undefined) ?? null;

    // No provider configured yet -> no-op cleanly (bell/notification unaffected).
    if (!resendKey || !fromEmail) {
      return json({ ok: true, skip: "no_provider", hasKey: !!resendKey, hasFrom: !!fromEmail });
    }

    const html = renderHtml(n.title || "New notification", n.message || "", appUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: n.title || "New notification from Christians in Politics",
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      await admin.from("notifications").update({ email_error: `resend ${res.status}: ${errText}`.slice(0, 500) }).eq("id", n.id);
      return json({ ok: false, error: "send_failed", status: res.status });
    }

    await admin.from("notifications").update({ email_sent_at: new Date().toISOString(), email_error: null }).eq("id", n.id);
    return json({ ok: true, sent: true });
  } catch (e) {
    // Never surface email failures.
    return json({ ok: false, error: String(e) });
  }
});
