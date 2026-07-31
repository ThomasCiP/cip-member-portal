import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.christiansinpolitics.memberportal',
  // Only used when (re)generating the native projects. The label users actually
  // see comes from ios/App/App/Info.plist CFBundleDisplayName and
  // android/.../values/strings.xml app_name — keep all three in sync.
  appName: 'CiP Network',
  // We ship the bundled Vite build (dist/) inside the app rather than pointing
  // at a live URL, so the app works offline-first and passes store review.
  webDir: 'dist',
  // With Keyboard resize:'native' the WebView frame ends above the keyboard,
  // so the native window shows through the keyboard's translucency. Keep that
  // backdrop white so the keyboard keeps its normal light look instead of
  // picking up a dark tint with visible rounded panel edges (TestFlight
  // feedback after build 7).
  backgroundColor: '#ffffff',
  ios: {
    // Show web content behind the status bar / under the notch; the app adds
    // its own safe-area padding in CSS.
    contentInset: 'never',
  },
  plugins: {
    Keyboard: {
      // Resize the WebView frame when the keyboard opens instead of letting
      // WKWebView pan the page. Without this, focusing the message composer
      // shot the whole chat off the top of the screen (fixed-position elements
      // pan with the page, so no CSS can hold them) — TestFlight feedback.
      resize: 'native' as any,
      // The app is light-themed; keep the system keyboard in its standard
      // light appearance rather than letting it adapt to the backdrop.
      style: 'LIGHT' as any,
    },
    SplashScreen: {
      // initNativeApp() hides the splash as soon as the web layer mounts. Keep
      // auto-hide on with a ceiling as a safety net so the splash can never get
      // stuck if that call throws before hiding.
      launchAutoHide: true,
      launchShowDuration: 3000,
      // Must match the flat ground of assets/splash.png so there is no seam
      // where the splash image doesn't cover the screen.
      backgroundColor: '#3a231a',
    },
  },
};

export default config;
