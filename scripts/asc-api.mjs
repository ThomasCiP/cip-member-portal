// Minimal App Store Connect API client — signs an ES256 JWT with the .p8 key.
//
// Config comes from ~/.cip-mobile-signing/appstore.env (same file release-ios.sh
// reads). Nothing here prints the private key.
//
//   node scripts/asc-api.mjs GET  /v1/bundleIds
//   node scripts/asc-api.mjs POST /v1/bundleIds '{"data":{...}}'
import { createSign } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const ENV_FILE = join(homedir(), '.cip-mobile-signing', 'appstore.env');
const env = { ...process.env };
if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const KEY_ID = env.ASC_KEY_ID;
const ISSUER_ID = env.ASC_ISSUER_ID;
const KEY_PATH = (env.ASC_KEY_PATH || '').replace(/^~/, homedir());
if (!KEY_ID || !ISSUER_ID || !KEY_PATH) {
  console.error(`Missing ASC_KEY_ID / ASC_ISSUER_ID / ASC_KEY_PATH (looked in ${ENV_FILE})`);
  process.exit(1);
}

const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' });
  const payload = b64({ iss: ISSUER_ID, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' });
  const signer = createSign('SHA256');
  signer.update(`${header}.${payload}`);
  // JWT requires the raw r||s form, not the DER encoding Node emits by default.
  const sig = signer.sign(
    { key: readFileSync(KEY_PATH, 'utf8'), dsaEncoding: 'ieee-p1363' }
  );
  return `${header}.${payload}.${sig.toString('base64url')}`;
}

const [method = 'GET', path = '/v1/apps', body] = process.argv.slice(2);
const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
  method,
  headers: {
    Authorization: `Bearer ${token()}`,
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  },
  ...(body ? { body } : {}),
});

const text = await res.text();
console.log(`HTTP ${res.status}`);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text);
}
process.exit(res.ok ? 0 : 1);
