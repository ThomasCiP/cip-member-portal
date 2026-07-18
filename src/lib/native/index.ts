import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Browser } from "@capacitor/browser";
import { supabase } from "../supabase";

/**
 * True when running inside the native iOS/Android shell (Capacitor), false in a
 * normal browser. Every native call below is guarded by this so the same build
 * runs unchanged on the web.
 */
export const isNative = Capacitor.isNativePlatform();

/**
 * Establish a Supabase session from an auth deep link (email confirmation or
 * password reset). On native, these links open the app via a Universal Link /
 * App Link instead of the phone browser, so we recover the tokens here — this
 * mirrors the web hash-recovery logic in AuthContext.tsx / supabase.ts.
 */
async function handleAuthDeepLink(url: string) {
  try {
    const parsed = new URL(url);
    // Supabase auth links carry the session in the URL fragment
    // (#access_token=...&refresh_token=...&type=recovery). Password resets also
    // add ?reset=true to the query.
    const fragment = parsed.hash.replace(/^#/, "");
    const params = new URLSearchParams(fragment || parsed.search.replace(/^\?/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const isRecovery =
      params.get("type") === "recovery" || parsed.searchParams.get("reset") === "true";

    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
    }
    if (isRecovery) {
      // App.tsx listens for this and routes to the set-new-password screen,
      // matching the existing `cip:*` custom-event pattern already in the app.
      window.dispatchEvent(new CustomEvent("cip:password-recovery"));
    }
  } catch (e) {
    console.error("Failed to handle auth deep link", url, e);
  }
}

/**
 * One-time native setup, called from main.tsx. No-ops on the web.
 */
export async function initNativeApp() {
  if (!isNative) return;

  // Dark status-bar icons over the light app background.
  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    /* status bar not available on this platform */
  }

  // Android hardware back button: go back a screen if the in-app history has
  // one, otherwise leave the app. The web History integration in App.tsx
  // (useHistoryScreen) handles the actual screen transition on popstate.
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });

  // Auth deep links while the app is already open.
  App.addListener("appUrlOpen", ({ url }) => {
    void handleAuthDeepLink(url);
  });

  // If the app was cold-launched from a deep link, handle that initial URL too.
  try {
    const launch = await App.getLaunchUrl();
    if (launch?.url) await handleAuthDeepLink(launch.url);
  } catch {
    /* no launch url */
  }

  // Web layer is mounted — reveal the app (splash is set to not auto-hide).
  try {
    await SplashScreen.hide();
  } catch {
    /* no splash screen */
  }
}

/**
 * Open a URL outside the app. Uses the native in-app browser on device (nicer
 * than kicking the user out to Safari/Chrome) and a normal new tab on the web.
 * Use this instead of `window.open(url, "_blank")`.
 */
export async function openExternal(url: string) {
  if (isNative) {
    await Browser.open({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
