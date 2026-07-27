# CiP Member Portal — Mobile App (Capacitor)

This app now ships as a native **iOS + Android** app using [Capacitor](https://capacitorjs.com),
wrapping the existing Vite/React build. Same codebase runs on web and mobile.

---

## What's already done (Phase 1 — code)

- Capacitor 8 installed (`@capacitor/core`, `cli`, `ios`, `android`, `app`, `status-bar`,
  `splash-screen`, `browser`, `assets`).
- `capacitor.config.ts` — appId `com.christiansinpolitics.memberportal`, appName
  "CiP Member Portal", `webDir: dist`, brand splash colour.
- Native `ios/` and `android/` projects generated. (iOS uses Swift Package Manager,
  so **CocoaPods is not required**.)
- `src/lib/native/index.ts` — `initNativeApp()` (status bar, splash hide, Android
  back button, auth deep-link handling) + `openExternal()`. All guarded by
  `Capacitor.isNativePlatform()` so the web build is unchanged.
- Safe-area handling: member header + auth screens pad for the notch / home
  indicator (`src/styles/safe-area.css`, `MemberShell` header, `PublicScreens`).
- Event-registration external link routed through the native in-app browser.
- npm scripts: `mobile:sync`, `mobile:ios`, `mobile:android`.

Verified: `npm run build` succeeds and the web app renders identically on desktop
and mobile viewports (all native calls are no-ops in the browser).

---

## What YOU need to do

### 1. Install the native build tools (one-time)

| Tool | For | How |
|------|-----|-----|
| **Xcode** (+ Command Line Tools) | iOS builds | Mac App Store, then `xcode-select --install` |
| **Android Studio** | Android builds + emulator | https://developer.android.com/studio — install the SDK + an emulator image on first launch; set `ANDROID_HOME` |
| **JDK 17** | Android/Gradle | Bundled with recent Android Studio |

> CocoaPods is **not** needed (Capacitor 8 uses Swift Package Manager for iOS).

### 2. Run the app locally

**iOS — verified working** (Xcode 26.1.1, iOS 26.1 simulator). The repo now lives
at **`~/Developer/cip-member-portal`** (moved out of iCloud — see note below), so
the **standard Capacitor commands work**:

```bash
npx cap run ios --target "iPhone 17"   # build + launch on a simulator
npm run mobile:ios                      # or open in Xcode and press ▶
```

There's also a convenience wrapper that resolves the simulator by name:

```bash
npm run mobile:run:ios              # default iPhone 17
npm run mobile:run:ios "iPhone 16e" # any installed simulator by name
```

> ⚠️ **Why the repo was moved out of `~/Documents`.** `~/Documents` is synced by
> iCloud "Desktop & Documents". Xcode's build database (`build.db`, SQLite) throws
> **`disk I/O error` / `** BUILD FAILED **`** when it sits in an iCloud-synced
> folder, so builds there failed. Moving the repo to `~/Developer/` fixed it
> permanently (and stops iCloud syncing `node_modules`/build output). **Keep code
> projects out of iCloud-synced folders.**

**Android — verified working** (Android Studio, SDK android-36, `cip_pixel` AVD =
Pixel 7 / Google APIs arm64). One command boots the emulator (if needed), builds,
and launches:

```bash
npm run mobile:run:android   # boots cip_pixel emulator + builds + launches
npm run mobile:android       # or open in Android Studio and press ▶
```

The Android env is set inside `scripts/run-android.sh` (no need to configure your
shell): `ANDROID_HOME=~/Library/Android/sdk`, `JAVA_HOME` = Android Studio's
bundled JDK 21. `android/local.properties` points Gradle at the SDK. Command-line
SDK tools (`sdkmanager`/`avdmanager`) were installed under
`~/Library/Android/sdk/cmdline-tools/latest`.

Smoke-test: sign in, feed, Network, Events (+ registration link), Messages
(realtime), Settings, sign out. Confirm nothing is clipped by the notch or home
indicator (fine-tune `src/styles/safe-area.css` on-device if needed).

### 3. App icon + splash ✅ DONE (verified on both simulators 2026-07-27)

The mark is a **lit candle** — the "i" from the CiP wordmark, redrawn taller and
narrower so it still reads as a candle at 40px — in gold `#d89f55` and warm
off-white `#f2e7dc` on a dark brown ground (`#4a2d20` → `#2b1a12`). The wide
wordmark in `public/logo.png` can't be used as an icon.

Everything is generated from code, so there is no binary design file to lose:

```bash
npm run mobile:assets     # redraw masters + fan out every size, both platforms
```

- `scripts/gen-assets.mjs` draws the SVG masters → `assets/source/*.svg` and
  `assets/*.png` (the 1024 icon, Android adaptive fg/bg, 2732 splashes).
- `scripts/gen-assets.sh` then runs `capacitor-assets generate` and **re-patches
  the Android adaptive icon**: capacitor-assets emits `<background>` as a bitmap
  inset by 16.7%, which can expose transparent corners when the launcher
  parallaxes the layers, so the script rewrites it to a flat colour filling the
  whole 108dp canvas. That rewrite must run *after* generate, which overwrites
  `mipmap-anydpi-v26/*.xml` every time.

Two constraints worth remembering if you change the art:

- The master `assets/icon-only.png` must be **opaque** — the App Store rejects
  icons with an alpha channel.
- Don't pre-shrink `assets/icon-foreground.png` into the Android safe zone;
  capacitor-assets already insets that layer by 16.7%, so shrinking first
  double-applies it and leaves the candle tiny.

**Display name.** The home-screen label is **"CiP Network"**, not "CiP Member
Portal" — the longer name got condensed to "CiPMemberPortal" on iOS and truncated
to "CiP Member…" on Android. It's set in three places that must stay in sync:
`capacitor.config.ts` `appName`, `ios/App/App/Info.plist` `CFBundleDisplayName`,
and `android/.../values/strings.xml` `app_name`. The **store listing** name is
separate and can stay longer.

### 4. Auth deep links (so email links reopen the app)

Email confirmation / password reset links currently point at
`https://network.christiansinpolitics.com`. To make them reopen the app instead of
the phone browser:

1. Host **`.well-known/apple-app-site-association`** (iOS Universal Links) and
   **`.well-known/assetlinks.json`** (Android App Links) on that domain (Vercel).
2. Enable the Associated Domains capability (iOS) / intent filters (Android) — see
   Capacitor's [deep links guide](https://capacitorjs.com/docs/guides/deep-links).
3. Add the app's Universal Link to the Supabase Auth **Redirect URLs** allow-list.

The token-handling code already exists in `src/lib/native/index.ts`
(`handleAuthDeepLink`) — this step just wires the OS to open the app.

---

## Phase 2 — Store builds

Version is **1.0.0 / build 1** (`package.json`, `MARKETING_VERSION` +
`CURRENT_PROJECT_VERSION` in the Xcode project, `versionName` + `versionCode` in
`android/app/build.gradle`). Bump `versionCode` / `CURRENT_PROJECT_VERSION` on
**every** upload — both stores reject a build number they've already seen.

### Android release signing ✅ DONE

The upload keystore and its password live **outside the repo**, in
`~/.cip-mobile-signing/` (mode 700):

| File | What |
|------|------|
| `cip-upload-key.jks` | RSA 4096, alias `cip-upload`, valid to 2053 |
| `keystore.properties` | `storeFile` / `storePassword` / `keyAlias` / `keyPassword` |

They're deliberately **not** in the working tree — `.env` with live keys is
already tracked in this repo, so `.gitignore` alone wasn't worth trusting.
`android/app/build.gradle` reads that file (falling back to `CIP_KEYSTORE_FILE`
/ `CIP_KEYSTORE_PASSWORD` / `CIP_KEY_ALIAS` / `CIP_KEY_PASSWORD` env vars for
CI), and `bundleRelease` fails loudly rather than emitting an unsigned bundle.

> ⚠️ **Back up `~/.cip-mobile-signing/` to a password manager now.** Losing it
> isn't fatal — with Play App Signing enabled Google can reset the upload key —
> but it's a support round-trip you don't want mid-release.

Upload-key fingerprint (Play → App integrity, and for `assetlinks.json` later):

```
SHA-256  1A:BF:95:16:90:FE:CB:03:CA:55:FA:9E:DC:F7:7D:64:3C:A2:51:45:59:A7:03:E8:8F:AA:66:38:E3:5F:7B:26
SHA-1    B4:B1:F0:B1:C2:03:CE:CF:C1:0A:D7:88:09:F4:2D:0A:A2:06:ED:83
```

Build it:

```bash
npm run release:android    # → android/app/build/outputs/bundle/release/app-release.aab
```

Then Play Console → **Testing → Internal testing → Create new release** → upload
the `.aab`.

### iOS release

Auth uses an **App Store Connect API key**, not an Apple ID password, so the
build is unattended and repeatable. Create one at App Store Connect → *Users and
Access → Integrations → App Store Connect API*.

> ⚠️ **The key's role must be `Admin`, not `App Manager`.** A key's role is
> independent of your own account role, and it can't be changed after creation.
> App Manager can read everything and upload builds, but **cannot write to
> Certificates, Identifiers & Profiles** — so registering the bundle ID and
> minting the distribution certificate/profile both fail with
> `403 FORBIDDEN_ERROR`, and `-allowProvisioningUpdates` can't recover.

Put the `.p8` in `~/.cip-mobile-signing/` and write
`~/.cip-mobile-signing/appstore.env` (mode 600):

```sh
ASC_KEY_ID=XXXXXXXXXX
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ASC_KEY_PATH=~/.cip-mobile-signing/AuthKey_XXXXXXXXXX.p8
ASC_TEAM_ID=XXXXXXXXXX
```

```bash
npm run release:ios        # archive → export → upload to TestFlight
```

### Why signing is manual, not automatic

Xcode's automatic signing **does not work for command-line archives on this
account**, and the failure is not obvious:

1. `xcodebuild archive` with `CODE_SIGN_STYLE = Automatic` asks Apple for an
   *iOS App Development* provisioning profile — not a distribution one.
2. Apple refuses to issue a development profile to a team with **zero registered
   devices**: *"Your team has no devices from which to generate a provisioning
   profile."* CiP has no devices registered.
3. Pinning `CODE_SIGN_IDENTITY = "Apple Distribution"` doesn't help — automatic
   signing rejects a manually specified identity as a conflict.

So `npm run setup:ios-signing` mints the distribution certificate and an
`IOS_APP_STORE` profile directly through the API, and the archive uses manual
signing. This is also what CI wants: reproducible, no dependence on local Xcode
state, no need to register a device just to build.

Run it once (and again yearly, when the certificate expires):

```bash
npm run setup:ios-signing
```

It stores the certificate's private key in `~/.cip-mobile-signing/` and imports
it into a **dedicated keychain** (`cip-signing.keychain-db`) rather than
`login.keychain`, with `set-key-partition-list` applied so `codesign` never
raises an interactive "allow access?" prompt.

Two traps worth knowing if you touch the signing settings:

- They must live on the **App target's Release config** in `project.pbxproj`,
  not on the `xcodebuild` command line. Command-line build settings apply to
  *every* target, and the Capacitor Swift packages fail with *"does not support
  provisioning profiles"*.
- The Capacitor template ships `CODE_SIGN_IDENTITY = "iPhone Developer"` at the
  **project** level, which forces development signing and breaks archiving. It's
  been removed; don't let `cap` regenerate it back in.

The App Store Connect **app record** must be created by hand the first time; the
API has no endpoint for creating a new app. App Store Connect → Apps → (+):

| Field | Value |
|-------|-------|
| Platform | iOS |
| Bundle ID | `com.christiansinpolitics.memberportal` |
| Name | store listing name, max 30 chars — *not* the home-screen label |
| Primary Language | English (Australia) |
| SKU | any internal id, e.g. `cip-network-ios` |

### Poking at the API directly

`scripts/asc-api.mjs` signs an ES256 JWT with the same key and does raw calls —
useful for checking what a key is actually allowed to do:

```bash
node scripts/asc-api.mjs GET  '/v1/bundleIds?limit=200'
node scripts/asc-api.mjs POST /v1/bundleIds '{"data":{"type":"bundleIds","attributes":{"identifier":"com.christiansinpolitics.memberportal","name":"CiP Network","platform":"IOS"}}}'
```

### Export compliance

`ITSAppUsesNonExemptEncryption` is set to `false` in `ios/App/App/Info.plist`, so
App Store Connect won't ask on every build. The app's only cryptography is
HTTPS/TLS to Supabase and Vercel through the OS networking stack, which is exempt.
**Revisit this if the app ever ships its own encryption** — end-to-end encrypted
messaging being the obvious future trigger.

### Still to do before public review

- Store listing: name, description, screenshots (see `../Mobile Rendering Photos/`).
- **Privacy policy URL** (required by both stores).
- Data disclosure forms — Apple App Privacy + Google Data safety. Declare
  account/email, user content/images, and messages.

---

## Phase 3 — Native camera & photo picker ✅ DONE (verified on iOS sim 2026-07-18)

`@capacitor/camera` installed. `pickImageFile()` in `src/lib/native/index.ts`
opens the native "Take Photo / Choose from Library" prompt on device (via
`Camera.getPhoto`, `source: Prompt`) and falls back to a web file input in the
browser. All **9** upload sites (6 in `MemberScreens.tsx`, 3 in `AdminScreens.tsx`)
now call it; each button hands the returned `File` to the existing upload handler
as a synthetic `{ target: { files: [file] } }` event, so **the Supabase Storage
upload handlers were not modified**. iOS permission strings added to
`ios/App/App/Info.plist` (`NSCameraUsageDescription`,
`NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`); Android
needs no extra manifest entries (plugin uses the system picker). Verified
end-to-end: the native prompt + iOS Photo Library permission dialog appear with
the custom copy.

## Phase 4 — Push notifications (later, biggest lift)

`@capacitor/push-notifications` + an APNs key (Apple) + a Firebase project / FCM
(Android). Store device tokens in a new `push_tokens` table and extend the existing
`supabase/functions/send-notification-email` Edge Function to also send push,
honouring the existing notification preferences.

---

## Day-to-day workflow

After **any** web change, mobile users only get it after a rebuild + resync:

```bash
npm run mobile:sync        # vite build && cap sync
# then re-run from Xcode / Android Studio, or ship a new store build
```

| Script | Does |
|--------|------|
| `npm run mobile:run:ios` / `:android` | build + install + launch on sim/emulator |
| `npm run mobile:assets` | regenerate every icon + splash size |
| `npm run release:ios` | archive + upload to TestFlight |
| `npm run release:android` | signed `.aab` for Play Console |

(Later, consider Capacitor Live Updates / Capgo for OTA UI updates without a store
review.)

## Notes

- `ios/` and `android/` are committed; their generated `Pods`/build dirs are
  git-ignored by Capacitor's own `.gitignore` files.
- The Supabase URL + anon key are bundled into the app JS — expected and safe
  (RLS protects data). Never bundle the service-role key.
