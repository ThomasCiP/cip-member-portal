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
  ios: {
    // Show web content behind the status bar / under the notch; the app adds
    // its own safe-area padding in CSS.
    contentInset: 'never',
  },
  plugins: {
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
