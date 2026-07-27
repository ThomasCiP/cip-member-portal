import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Browser } from "@capacitor/browser";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
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

/**
 * Pick an image and return it as a File, ready to hand to the existing
 * supabase.storage upload code. On native it opens the OS prompt (Take Photo /
 * Choose from Library) via @capacitor/camera; on web it falls back to a normal
 * file picker. Returns null if the user cancels or denies permission.
 *
 * Replaces the `<input type="file" accept="image/*">` + button/label pattern.
 * Upload handlers accept either this File or the old change-event, so both the
 * native and web paths work unchanged downstream.
 */
export async function pickImageFile(): Promise<File | null> {
  if (isNative) {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // user chooses camera or photo library
        promptLabelHeader: "Add a photo",
        promptLabelPhoto: "Choose from Library",
        promptLabelPicture: "Take Photo",
      });
      if (!photo?.webPath) return null;
      const res = await fetch(photo.webPath);
      const blob = await res.blob();
      const format = photo.format || "jpeg";
      return new File([blob], `photo.${format}`, { type: blob.type || `image/${format}` });
    } catch {
      // User cancelled the prompt or denied permission.
      return null;
    }
  }

  // Web: mirror the old hidden <input type="file"> behaviour.
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}

/** File types accepted as post attachments (matches the post-documents bucket). */
export const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv," +
  "application/pdf,application/msword,text/plain,text/csv," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
  "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

/**
 * Pick a document (PDF, Word, Excel, PowerPoint, text/CSV) to attach to a post.
 * A file input is the right tool on every platform here — both iOS WKWebView and
 * the Android WebView surface the native Files picker for it, so no extra plugin
 * is needed. Returns null if the user cancels.
 */
export function pickDocumentFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = DOCUMENT_ACCEPT;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}
