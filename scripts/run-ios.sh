#!/usr/bin/env bash
#
# Build the web app, sync it into the iOS project, then build/install/launch it
# on an iPhone simulator.
#
# Why this exists instead of a plain `cap run ios`:
# this project lives in ~/Documents, which is synced by iCloud "Desktop &
# Documents". Xcode's build database (build.db, a SQLite file) fails with
# "disk I/O error" when it lives in an iCloud-synced folder. `cap run ios`
# forces DerivedData to ./ios/DerivedData (inside iCloud) and so fails. This
# script keeps DerivedData in $TMPDIR (never synced), which fixes it.
#
# Usage: ./scripts/run-ios.sh ["iPhone 17"]   # optional simulator name
set -euo pipefail

export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
SIM_NAME="${1:-iPhone 17}"
BUNDLE_ID="com.christiansinpolitics.memberportal"
DD="${TMPDIR:-/tmp}/cip-ios-derived"   # build cache OUTSIDE iCloud

echo "→ Building web assets + syncing iOS…"
npm run build
npx cap sync ios

echo "→ Resolving simulator \"$SIM_NAME\"…"
SIM_UDID=$(xcrun simctl list devices available | grep -m1 "$SIM_NAME (" | grep -oE '[0-9A-Fa-f-]{36}')
if [ -z "$SIM_UDID" ]; then
  echo "✗ Simulator \"$SIM_NAME\" not found. Available iPhones:"
  xcrun simctl list devices available | grep -i iphone
  exit 1
fi

echo "→ Building app (DerivedData: $DD)…"
( cd ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Debug \
    -sdk iphonesimulator -destination "id=$SIM_UDID" -derivedDataPath "$DD" build )

APP="$DD/Build/Products/Debug-iphonesimulator/App.app"
echo "→ Booting simulator + installing…"
xcrun simctl boot "$SIM_UDID" 2>/dev/null || true
open -a Simulator
xcrun simctl install "$SIM_UDID" "$APP"
xcrun simctl launch "$SIM_UDID" "$BUNDLE_ID"
echo "✓ Launched $BUNDLE_ID on $SIM_NAME"
