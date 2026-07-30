import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../supabase";

/**
 * Push notifications (#10/#11). Native only — the web build never touches the
 * plugin. Flow:
 *  - enablePush() runs the OS permission prompt (when still undecided) and
 *    registers for a device token; the token is upserted into push_tokens.
 *  - On every app start, ensurePushRegistration() silently re-registers when
 *    permission was already granted, because APNs/FCM tokens can rotate.
 *  - Delivery is done server-side by the send-push edge function, fanned out
 *    from a trigger on the notifications table.
 */

export const pushSupported = Capacitor.isNativePlatform();

export type PushPermission = "granted" | "denied" | "prompt" | "unsupported";

// The token this device registered during this install, so sign-out can remove
// exactly this row (other devices keep their tokens).
const TOKEN_KEY = "cip:push-token";

function normalize(receive: string): PushPermission {
  if (receive === "granted") return "granted";
  if (receive === "denied") return "denied";
  return "prompt";
}

export async function getPushPermission(): Promise<PushPermission> {
  if (!pushSupported) return "unsupported";
  try {
    const s = await PushNotifications.checkPermissions();
    return normalize(s.receive);
  } catch {
    return "unsupported";
  }
}

let listenersArmed = false;
function armListeners() {
  if (listenersArmed) return;
  listenersArmed = true;

  PushNotifications.addListener("registration", async ({ value: token }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      localStorage.setItem(TOKEN_KEY, token);
      await supabase.from("push_tokens").upsert({
        token,
        user_id: user.id,
        platform: Capacitor.getPlatform() === "ios" ? "ios" : "android",
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Failed to store push token", e);
    }
  });

  PushNotifications.addListener("registrationError", (e) => {
    // Expected on simulators / when the entitlement is missing — never fatal.
    console.warn("Push registration error", e);
  });

  // Tapping a push lands the member on Alerts (App.tsx listens for this).
  PushNotifications.addListener("pushNotificationActionPerformed", () => {
    window.dispatchEvent(new CustomEvent("cip:open-notifications"));
  });
}

/**
 * Ask for permission (OS prompt if still undecided) and register. Returns the
 * resulting permission state; "denied" is a normal outcome, not an error.
 */
export async function enablePush(): Promise<PushPermission> {
  if (!pushSupported) return "unsupported";
  try {
    armListeners();
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive !== "granted" && perm.receive !== "denied") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") return "denied";
    await PushNotifications.register();
    return "granted";
  } catch (e) {
    console.warn("enablePush failed", e);
    return "unsupported";
  }
}

/**
 * Called on app start / sign-in: if the user already granted permission,
 * re-register silently so a rotated token is captured. Never prompts.
 */
export async function ensurePushRegistration() {
  if (!pushSupported) return;
  try {
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== "granted") return;
    armListeners();
    await PushNotifications.register();
  } catch {
    /* no push on this platform/build */
  }
}

/** Sign-out: remove this device's token so the next user doesn't get pushes. */
export async function removePushToken() {
  if (!pushSupported) return;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await supabase.from("push_tokens").delete().eq("token", token);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* token cleanup is best-effort */
  }
}

/**
 * Sign out everywhere in the app goes through this: the push token row must be
 * deleted while the session still exists (RLS), so cleanup runs first.
 */
export async function signOutCleanly() {
  await removePushToken();
  await supabase.auth.signOut();
}

/** Clear delivered notifications from the tray when the member opens Alerts. */
export async function clearDeliveredPush() {
  if (!pushSupported) return;
  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch {
    /* not available */
  }
}
