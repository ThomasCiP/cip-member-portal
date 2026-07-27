#!/usr/bin/env bash
# Build a signed Android App Bundle (.aab) for Play Console upload.
#
# Signing config comes from ~/.cip-mobile-signing/keystore.properties (or the
# CIP_KEYSTORE_* env vars) — see android/app/build.gradle and MOBILE.md.
#
# Usage: npm run release:android
set -euo pipefail
cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"

echo "→ Building web bundle…"
npm run build
npx cap sync android

echo "→ Building signed release bundle…"
(cd android && ./gradlew bundleRelease)

AAB=android/app/build/outputs/bundle/release/app-release.aab
[ -f "$AAB" ] || { echo "✗ No AAB produced at $AAB" >&2; exit 1; }

# An unsigned bundle uploads fine but Play rejects it at review time — catch it here.
if ! "$JAVA_HOME/bin/jarsigner" -verify "$AAB" >/dev/null 2>&1; then
  echo "✗ $AAB is NOT signed. Check ~/.cip-mobile-signing/keystore.properties." >&2
  exit 1
fi

echo "✓ Signed AAB: $AAB ($(du -h "$AAB" | cut -f1))"
echo "  Upload at: Play Console → Testing → Internal testing → Create new release"
