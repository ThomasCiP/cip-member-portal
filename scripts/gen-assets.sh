#!/usr/bin/env bash
# Regenerate every app icon / splash size for iOS + Android from assets/*.png.
#
# Source of truth: assets/source/*.svg -> assets/*.png (see scripts/gen-assets.mjs),
# then capacitor-assets fans those out into the native projects.
set -euo pipefail
cd "$(dirname "$0")/.."

GROUND_DARK='#2b1a12'
SPLASH_BG='#3a231a'   # keep in sync with plugins.SplashScreen.backgroundColor

node scripts/gen-assets.mjs

npx capacitor-assets generate \
  --iconBackgroundColor "$GROUND_DARK" \
  --iconBackgroundColorDark "$GROUND_DARK" \
  --splashBackgroundColor "$SPLASH_BG" \
  --splashBackgroundColorDark "$GROUND_DARK"

# --- post-fix: Android adaptive icon background ------------------------------
# capacitor-assets emits `<background>` as a bitmap inset by 16.7%, which can
# expose transparent corners when the launcher parallaxes/zooms the layers.
# A flat colour filling the whole 108dp canvas is safer. This rewrite must run
# AFTER `capacitor-assets generate`, which overwrites these two files each time.
RES=android/app/src/main/res

cat > "$RES/values/ic_launcher_background.xml" <<EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">$GROUND_DARK</color>
</resources>
EOF

for f in ic_launcher ic_launcher_round; do
  cat > "$RES/mipmap-anydpi-v26/$f.xml" <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground>
        <inset android:drawable="@mipmap/ic_launcher_foreground" android:inset="16.7%" />
    </foreground>
</adaptive-icon>
EOF
done

echo "✓ assets regenerated (adaptive-icon background pinned to $GROUND_DARK)"
