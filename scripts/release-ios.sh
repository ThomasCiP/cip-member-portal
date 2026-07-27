#!/usr/bin/env bash
# Build a signed iOS release and upload it to TestFlight.
#
# Auth uses an App Store Connect API key (.p8) rather than an Apple ID password,
# so no interactive sign-in is needed and it works unattended. Create one at
#   App Store Connect → Users and Access → Integrations → App Store Connect API
# and export these before running (or put them in ~/.cip-mobile-signing/appstore.env):
#
#   ASC_KEY_ID=XXXXXXXXXX          # 10-char Key ID
#   ASC_ISSUER_ID=xxxxxxxx-....    # UUID, shown above the key list
#   ASC_KEY_PATH=~/.cip-mobile-signing/AuthKey_XXXXXXXXXX.p8
#   ASC_TEAM_ID=XXXXXXXXXX         # 10-char Team ID (developer.apple.com → Membership)
#
# Usage: npm run release:ios
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="$HOME/.cip-mobile-signing/appstore.env"
# shellcheck disable=SC1090
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

for v in ASC_KEY_ID ASC_ISSUER_ID ASC_KEY_PATH ASC_TEAM_ID; do
  if [ -z "${!v:-}" ]; then
    echo "✗ $v is not set. See the header of $0 or MOBILE.md → 'iOS release'." >&2
    exit 1
  fi
done
ASC_KEY_PATH="${ASC_KEY_PATH/#\~/$HOME}"
[ -f "$ASC_KEY_PATH" ] || { echo "✗ API key not found at $ASC_KEY_PATH" >&2; exit 1; }

export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer

# Keep build artefacts out of iCloud-synced folders — Xcode's SQLite build.db
# throws "disk I/O error" there. (Repo is in ~/Developer now, but $TMPDIR is
# still the safe choice and keeps the working tree clean.)
BUILD_DIR="${TMPDIR:-/tmp}/cip-ios-release"
ARCHIVE="$BUILD_DIR/App.xcarchive"
EXPORT_DIR="$BUILD_DIR/export"
rm -rf "$BUILD_DIR" && mkdir -p "$BUILD_DIR"

echo "→ Building web bundle…"
npm run build
npx cap sync ios

# Manual signing against the certificate + profile created by
# `npm run setup:ios-signing`. Automatic signing can't be used here: from the
# command line it tries to mint an *iOS App Development* profile, and Apple
# won't issue one to a team with no registered devices.
PROFILE_NAME="CiP Network App Store"
KEYCHAIN="$HOME/.cip-mobile-signing/cip-signing.keychain-db"
if [ ! -f "$KEYCHAIN" ]; then
  echo "✗ Signing keychain missing. Run: npm run setup:ios-signing" >&2
  exit 1
fi
# shellcheck disable=SC1091
source "$HOME/.cip-mobile-signing/keychain.env"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN"

echo "→ Archiving…"
# Capacitor 8 uses Swift Package Manager, so there is no .xcworkspace — the
# .xcodeproj is the build unit.
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  -derivedDataPath "$BUILD_DIR/DerivedData" \
  OTHER_CODE_SIGN_FLAGS="--keychain $KEYCHAIN" \
  archive
# NB: the signing settings (CODE_SIGN_STYLE/IDENTITY, PROVISIONING_PROFILE_SPECIFIER,
# DEVELOPMENT_TEAM) live on the App target's Release config in project.pbxproj, not
# here. Passing them on the command line applies them to *every* target, including
# the Capacitor Swift packages, which fail with "does not support provisioning
# profiles".

cat > "$BUILD_DIR/ExportOptions.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>teamID</key><string>$ASC_TEAM_ID</string>
  <key>uploadSymbols</key><true/>
  <key>destination</key><string>upload</string>
</dict>
</plist>
EOF

echo "→ Exporting + uploading to TestFlight…"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportOptionsPlist "$BUILD_DIR/ExportOptions.plist" \
  -exportPath "$EXPORT_DIR" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$ASC_KEY_PATH" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"

echo "✓ Uploaded. Processing takes ~5-15 min before the build shows in TestFlight."
