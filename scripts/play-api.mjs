// Minimal Google Play Developer API client — authenticates with the service
// account key in ~/.cip-mobile-signing/play-service-account.json (RS256 JWT
// -> OAuth token) and calls the androidpublisher v3 API.
//
//   node scripts/play-api.mjs GET  /applications/<pkg>/edits   (etc.)
// Special commands:
//   node scripts/play-api.mjs check            — verify auth + app access
//   node scripts/play-api.mjs upload <aab> <track> — full release flow
import { createSign } from 'crypto';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const KEY = JSON.parse(readFileSync(join(homedir(), '.cip-mobile-signing', 'play-service-account.json'), 'utf8'));
const PKG = 'com.christiansinpolitics.memberportal';
const BASE = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: 'RS256', typ: 'JWT' });
  const claims = b64({
    iss: KEY.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  });
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${signer.sign(KEY.private_key).toString('base64url')}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('token failure: ' + JSON.stringify(j));
  return j.access_token;
}

async function api(tok, method, path, body, raw) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${tok}`,
      ...(raw ? { 'Content-Type': 'application/octet-stream' } : body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(raw ? { body: raw } : body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
  return { status: res.status, body: j };
}

const [cmd, a1, a2] = process.argv.slice(2);

if (cmd === 'check') {
  const tok = await token();
  console.log('auth: OK (token acquired)');
  const r = await api(tok, 'POST', `/applications/${PKG}/edits`, {});
  if (r.status === 200) {
    console.log('app access: OK — edit created', r.body.id);
    await api(tok, 'DELETE', `/applications/${PKG}/edits/${r.body.id}`);
  } else {
    console.log('app access FAILED:', r.status, JSON.stringify(r.body).slice(0, 400));
  }
} else if (cmd === 'upload') {
  const [aabPath, track = 'internal'] = [a1, a2];
  const tok = await token();
  const edit = await api(tok, 'POST', `/applications/${PKG}/edits`, {});
  if (edit.status !== 200) { console.error('edit failed:', JSON.stringify(edit.body).slice(0, 400)); process.exit(1); }
  const editId = edit.body.id;
  console.log('edit:', editId);

  const aab = readFileSync(aabPath);
  const up = await fetch(`https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${PKG}/edits/${editId}/bundles?uploadType=media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/octet-stream' },
    body: aab,
  });
  const upj = await up.json();
  if (!upj.versionCode) { console.error('bundle upload failed:', JSON.stringify(upj).slice(0, 500)); process.exit(1); }
  console.log('bundle uploaded, versionCode:', upj.versionCode);

  const tr = await api(tok, 'PUT', `/applications/${PKG}/edits/${editId}/tracks/${track}`, {
    track, releases: [{ name: `1.0 (${upj.versionCode})`, versionCodes: [String(upj.versionCode)], status: 'completed' }],
  });
  if (tr.status !== 200) { console.error('track update failed:', JSON.stringify(tr.body).slice(0, 500)); process.exit(1); }
  console.log('track set:', track);

  const commit = await api(tok, 'POST', `/applications/${PKG}/edits/${editId}:commit`, {});
  if (commit.status !== 200) { console.error('commit failed:', JSON.stringify(commit.body).slice(0, 600)); process.exit(1); }
  console.log('COMMITTED — release live on track:', track);
} else if (cmd === 'listing') {
  // Push store listing text + images (en-GB, the app's default language).
  const tok = await token();
  const edit = await api(tok, 'POST', `/applications/${PKG}/edits`, {});
  if (edit.status !== 200) { console.error('edit failed:', JSON.stringify(edit.body).slice(0, 300)); process.exit(1); }
  const editId = edit.body.id;

  const shortDesc = 'The private member network of Christians in Politics Australia.';
  const fullDesc = readFileSync('store/play-full-description.txt', 'utf8').trim();
  const lst = await api(tok, 'PUT', `/applications/${PKG}/edits/${editId}/listings/en-GB`, {
    language: 'en-GB', title: 'CiP Network', shortDescription: shortDesc, fullDescription: fullDesc,
  });
  if (lst.status !== 200) { console.error('listing failed:', JSON.stringify(lst.body).slice(0, 400)); process.exit(1); }
  console.log('listing text: OK');

  const uploads = [
    ['icon', ['store/play-assets/icon-512.png']],
    ['featureGraphic', ['store/play-assets/feature-graphic.png']],
    ['phoneScreenshots', [
      'store/play-assets/01-IMG_1308-1284x2778-play.png',
      'store/play-assets/02-IMG_1307-1284x2778-play.png',
      'store/play-assets/03-IMG_1306-1284x2778-play.png',
      'store/play-assets/04-IMG_1305-1284x2778-play.png',
      'store/play-assets/05-IMG_1309-1284x2778-play.png',
    ]],
  ];
  for (const [type, files] of uploads) {
    await api(tok, 'DELETE', `/applications/${PKG}/edits/${editId}/listings/en-GB/${type}`);
    for (const f of files) {
      const res = await fetch(`https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${PKG}/edits/${editId}/listings/en-GB/${type}?uploadType=media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'image/png' },
        body: readFileSync(f),
      });
      const j = await res.json();
      if (!j.image) { console.error(`${type} upload failed for ${f}:`, JSON.stringify(j).slice(0, 300)); process.exit(1); }
      console.log(`${type}: uploaded ${f.split('/').pop()}`);
    }
  }

  const commit = await api(tok, 'POST', `/applications/${PKG}/edits/${editId}:commit`, {});
  if (commit.status !== 200) { console.error('commit failed:', JSON.stringify(commit.body).slice(0, 500)); process.exit(1); }
  console.log('LISTING COMMITTED');
} else {
  console.log('usage: check | upload <aab> [track] | listing');
}
