#!/usr/bin/env bash
#
# Build the web app and run it on an Android emulator. Sets the Android env
# inline so you don't have to configure your shell profile.
#
# Usage: ./scripts/run-android.sh [avd_name]   # default AVD: cip_pixel
set -euo pipefail

export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

AVD="${1:-cip_pixel}"

# Boot the emulator if none is already running.
if ! adb devices | grep -q "emulator-.*device"; then
  echo "→ Booting emulator \"$AVD\"…"
  emulator -avd "$AVD" -no-snapshot-load >/dev/null 2>&1 &
  adb wait-for-device
  echo "→ Waiting for Android to finish booting…"
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 3; done
fi

TARGET=$(adb devices | grep "emulator-.*device" | head -1 | awk '{print $1}')
echo "→ Building web + deploying to $TARGET…"
npm run build
npx cap run android --target "$TARGET"
echo "✓ CiP app launched on $TARGET"
