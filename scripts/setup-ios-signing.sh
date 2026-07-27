#!/usr/bin/env bash
# One-time (well, yearly) setup of iOS App Store distribution signing.
#
# Why this exists instead of Xcode's automatic signing: automatic signing insists
# on creating an *iOS App Development* profile when archiving from the command
# line, and Apple refuses to issue a development profile to a team with zero
# registered devices. Rather than register a phone just to satisfy that, we mint
# the distribution certificate and App Store profile directly through the App
# Store Connect API and archive with manual signing — which is what CI wants
# anyway, since it's reproducible and doesn't depend on any local Xcode state.
#
# Creates, if missing:
#   • an Apple Distribution certificate (Apple caps these — reuses an existing one)
#   • a dedicated keychain holding its private key, so nothing touches login.keychain
#   • an IOS_APP_STORE provisioning profile for the app's bundle id
#
# Usage: npm run setup:ios-signing
set -euo pipefail
cd "$(dirname "$0")/.."

DIR="$HOME/.cip-mobile-signing"
BUNDLE_ID="com.christiansinpolitics.memberportal"
PROFILE_NAME="CiP Network App Store"
KEYCHAIN="$DIR/cip-signing.keychain-db"
API="node scripts/asc-api.mjs"

source "$DIR/appstore.env"

# --- 1. Distribution certificate -------------------------------------------
CERT_ID=$($API GET '/v1/certificates?limit=200' \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const j=JSON.parse(s.slice(s.indexOf("{")));
      const c=(j.data||[]).find(x=>x.attributes.certificateType==="DISTRIBUTION");
      process.stdout.write(c?c.id:"");})')

if [ -n "$CERT_ID" ]; then
  echo "→ Reusing distribution certificate $CERT_ID"
  if [ ! -f "$DIR/dist-cert.key" ]; then
    echo "✗ Certificate $CERT_ID exists on the account but its private key isn't in $DIR." >&2
    echo "  Revoke it in the developer portal and re-run, or import the original .p12." >&2
    exit 1
  fi
else
  echo "→ Creating distribution certificate…"
  openssl req -new -newkey rsa:2048 -nodes \
    -keyout "$DIR/dist-cert.key" -out "$DIR/dist-cert.csr" \
    -subj "/CN=CiP Network Distribution/O=CHRISTIANS IN POLITICS AUSTRALIA LTD/C=AU" 2>/dev/null
  chmod 600 "$DIR/dist-cert.key"

  CSR=$(tr -d '\n' < "$DIR/dist-cert.csr")
  RESP=$($API POST /v1/certificates \
    "{\"data\":{\"type\":\"certificates\",\"attributes\":{\"certificateType\":\"DISTRIBUTION\",\"csrContent\":\"$CSR\"}}}")
  echo "$RESP" | grep -q '^HTTP 201' || { echo "$RESP" >&2; exit 1; }
  CERT_ID=$(echo "$RESP" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      process.stdout.write(JSON.parse(s.slice(s.indexOf("{"))).data.id)})')
fi

# Fetch the certificate content and rebuild a .p12 from it + our private key.
$API GET "/v1/certificates/$CERT_ID" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      process.stdout.write(JSON.parse(s.slice(s.indexOf("{"))).data.attributes.certificateContent)})' \
  | base64 -d > "$DIR/dist-cert.cer"
openssl x509 -inform DER -in "$DIR/dist-cert.cer" -out "$DIR/dist-cert.pem" 2>/dev/null

# Apple's intermediate is needed for the chain to validate during codesign.
curl -fsS https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer -o "$DIR/wwdr.cer"
openssl x509 -inform DER -in "$DIR/wwdr.cer" -out "$DIR/wwdr.pem" 2>/dev/null

P12_PW=$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)
openssl pkcs12 -export -legacy \
  -inkey "$DIR/dist-cert.key" -in "$DIR/dist-cert.pem" -certfile "$DIR/wwdr.pem" \
  -out "$DIR/dist-cert.p12" -passout "pass:$P12_PW" 2>/dev/null
chmod 600 "$DIR/dist-cert.p12"

# --- 2. Dedicated keychain --------------------------------------------------
# Keeps the signing key out of login.keychain so codesign never prompts.
KC_PW=$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)
security delete-keychain "$KEYCHAIN" 2>/dev/null || true
security create-keychain -p "$KC_PW" "$KEYCHAIN"
security set-keychain-settings -lut 21600 "$KEYCHAIN"
security unlock-keychain -p "$KC_PW" "$KEYCHAIN"
security import "$DIR/dist-cert.p12" -k "$KEYCHAIN" -P "$P12_PW" \
  -T /usr/bin/codesign -T /usr/bin/security -A >/dev/null
security import "$DIR/wwdr.pem" -k "$KEYCHAIN" -T /usr/bin/codesign >/dev/null 2>&1 || true
# Without this, codesign hits an interactive "allow access?" prompt.
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KC_PW" "$KEYCHAIN" >/dev/null
security list-keychains -d user -s "$KEYCHAIN" $(security list-keychains -d user | tr -d '" ')
echo "KEYCHAIN_PASSWORD=$KC_PW" > "$DIR/keychain.env"
chmod 600 "$DIR/keychain.env"

echo "→ Identities in signing keychain:"
security find-identity -v -p codesigning "$KEYCHAIN" | sed 's/^/   /'

# --- 3. App Store provisioning profile --------------------------------------
# Note: no backslashes before the brackets — inside double quotes the shell keeps
# them literally, which Apple rejects as a malformed filter.
BUNDLE_UUID=$($API GET "/v1/bundleIds?limit=200" \
  | TARGET="$BUNDLE_ID" node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const j=JSON.parse(s.slice(s.indexOf("{")));
      const b=(j.data||[]).find(x=>x.attributes.identifier===process.env.TARGET);
      if(!b){console.error("bundle id not registered: "+process.env.TARGET);process.exit(1)}
      process.stdout.write(b.id)})')

# Profiles are pinned to a certificate, so a stale one must go when the cert changes.
OLD=$($API GET '/v1/profiles?limit=200' \
  | TARGET="$PROFILE_NAME" node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const j=JSON.parse(s.slice(s.indexOf("{")));
      const p=(j.data||[]).find(x=>x.attributes.name===process.env.TARGET);
      process.stdout.write(p?p.id:"")})')
[ -n "$OLD" ] && $API DELETE "/v1/profiles/$OLD" >/dev/null 2>&1 && echo "→ Removed stale profile"

echo "→ Creating App Store provisioning profile…"
RESP=$($API POST /v1/profiles "{\"data\":{\"type\":\"profiles\",\"attributes\":{
  \"name\":\"$PROFILE_NAME\",\"profileType\":\"IOS_APP_STORE\"},\"relationships\":{
  \"bundleId\":{\"data\":{\"type\":\"bundleIds\",\"id\":\"$BUNDLE_UUID\"}},
  \"certificates\":{\"data\":[{\"type\":\"certificates\",\"id\":\"$CERT_ID\"}]}}}}")
echo "$RESP" | grep -q '^HTTP 201' || { echo "$RESP" >&2; exit 1; }

mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles"
echo "$RESP" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    const a=JSON.parse(s.slice(s.indexOf("{"))).data.attributes;
    process.stdout.write(a.profileContent)})' \
  | base64 -d > "$HOME/Library/MobileDevice/Provisioning Profiles/${PROFILE_NAME// /_}.mobileprovision"

echo "✓ Signing ready. Profile: \"$PROFILE_NAME\", cert: $CERT_ID"
