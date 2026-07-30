// Supabase Edge Function: send-push (#10/#11)
// Invoked (async, fire-and-forget) by the `trg_queue_notification_push` trigger
// on public.notifications via pg_net, with body { notification_id } — the same
// pattern as send-notification-email.
//
// It re-reads the notification with the service role, looks up the recipient's
// device tokens in push_tokens, and delivers an APNs alert to each iOS device
// with the icon badge set to the recipient's unread count. Dead tokens
// (Unregistered / BadDeviceToken / ExpiredToken) are pruned. Android tokens are
// stored but skipped until an FCM project exists. It NEVER throws — a failed
// push must not affect the in-app bell.
//
// Config (shared secret + APNs key material) is read from Vault via the
// service-role-only public.push_config() RPC. Deploy with verify_jwt = false
// (the DB trigger has no end-user JWT); the shared secret in the
// `x-notify-secret` header is what authorizes the call.

import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const APNS_HOST = "https://api.push.apple.com";

// Notification rows carry (title, message); fall back per type if blank.
const TYPE_TITLES: Record<string, string> = {
  direct_message: "New message",
  connection_invite: "New connection request",
  connection_accepted: "Connection accepted",
  mention: "You were mentioned",
  group_mention: "Your group was mentioned",
  group_post: "New group activity",
  announcement: "Announcement",
};

// --- APNs provider JWT (ES256), cached for ~50 minutes ----------------------
let cachedJwt: { token: string; iat: number } | null = null;

function b64url(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function apnsJwt(keyPem: string, keyId: string, teamId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && now - cachedJwt.iat < 3000) return cachedJwt.token;

  const pkcs8 = Uint8Array.from(
    atob(keyPem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8", pkcs8, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  );
  const signingInput = `${b64url(JSON.stringify({ alg: "ES256", kid: keyId }))}.${
    b64url(JSON.stringify({ iss: teamId, iat: now }))}`;
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(signingInput),
  );
  const token = `${signingInput}.${b64url(new Uint8Array(sig))}`;
  cachedJwt = { token, iat: now };
  return token;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: config } = await admin.rpc("push_config");
    if (!config?.shared_secret) return json({ error: "config unavailable" }, 500);
    if (req.headers.get("x-notify-secret") !== config.shared_secret) {
      return json({ error: "unauthorized" }, 401);
    }
    if (!config.apns_key || !config.apns_key_id || !config.apns_team_id) {
      return json({ skipped: "apns not configured" });
    }

    const { notification_id } = await req.json().catch(() => ({}));
    if (!notification_id) return json({ error: "notification_id required" }, 400);

    const { data: n } = await admin
      .from("notifications")
      .select("id, user_id, type, title, message, read")
      .eq("id", notification_id)
      .maybeSingle();
    if (!n) return json({ skipped: "notification not found" });

    const { data: tokens } = await admin
      .from("push_tokens")
      .select("token, platform")
      .eq("user_id", n.user_id);
    const ios = (tokens || []).filter((t) => t.platform === "ios");
    if (!ios.length) return json({ skipped: "no ios tokens" });

    const { count: unread } = await admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", n.user_id)
      .eq("read", false);

    const title = (n.title || "").trim() || TYPE_TITLES[n.type] || "Christians in Politics";
    const body = (n.message || "").trim().slice(0, 500) || "You have a new notification.";
    const jwt = await apnsJwt(config.apns_key, config.apns_key_id, config.apns_team_id);
    const payload = JSON.stringify({
      aps: { alert: { title, body }, badge: unread ?? 1, sound: "default" },
      notificationId: n.id,
      type: n.type,
    });

    const results: Record<string, string> = {};
    for (const t of ios) {
      try {
        const res = await fetch(`${APNS_HOST}/3/device/${t.token}`, {
          method: "POST",
          headers: {
            "authorization": `bearer ${jwt}`,
            "apns-topic": config.apns_topic || "com.christiansinpolitics.memberportal",
            "apns-push-type": "alert",
            "apns-priority": "10",
          },
          body: payload,
        });
        if (res.ok) {
          results[t.token.slice(0, 8)] = "sent";
        } else {
          const reason = (await res.json().catch(() => ({})))?.reason || `http ${res.status}`;
          results[t.token.slice(0, 8)] = reason;
          if (["Unregistered", "BadDeviceToken", "ExpiredToken", "DeviceTokenNotForTopic"].includes(reason)) {
            await admin.from("push_tokens").delete().eq("token", t.token);
          }
        }
      } catch (e) {
        results[t.token.slice(0, 8)] = `error: ${e instanceof Error ? e.message : e}`;
      }
    }

    return json({ ok: true, results });
  } catch (e) {
    // Never fail loudly — push is best-effort.
    console.error("send-push error", e);
    return json({ ok: false });
  }
});
