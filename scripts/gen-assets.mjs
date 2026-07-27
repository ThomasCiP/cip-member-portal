// Draws the CiP app mark and writes the master source images into assets/.
// Run via `npm run mobile:assets` (scripts/gen-assets.sh), which then fans these
// out into ios/ and android/ with capacitor-assets.
//
// The mark: a lit candle — taken from the "i" of the CiP wordmark (public/logo.svg)
// but redrawn taller and narrower so it still reads as a candle at 40px.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'assets');
const SRC = resolve(OUT, 'source');
mkdirSync(SRC, { recursive: true });

const GOLD = '#d89f55'; // flame — from the wordmark
const WAX = '#f2e7dc'; // candle body
const GROUND_TOP = '#4a2d20';
const GROUND_BOT = '#2b1a12'; // keep in sync with scripts/gen-assets.sh
const SPLASH_BG = '#3a231a'; // keep in sync with capacitor.config.ts

const CANDLE = `
  <path d="M 512,152 C 592,300 598,398 512,398 C 426,398 432,300 512,152 Z" fill="${GOLD}"/>
  <rect x="427" y="418" width="170" height="34" rx="9" fill="${WAX}"/>
  <rect x="457" y="452" width="110" height="382" fill="${WAX}"/>
  <rect x="409" y="834" width="210" height="46" rx="11" fill="${WAX}"/>`;

const DEFS = `<defs>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="${GOLD}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${GROUND_TOP}"/>
      <stop offset="100%" stop-color="${GROUND_BOT}"/>
    </linearGradient>
  </defs>`;

const GLOW = `<ellipse cx="512" cy="290" rx="230" ry="260" fill="url(#halo)"/>`;
const MARK = (scale = 1, cx = 512, cy = 512) =>
  `<g transform="translate(${cx} ${cy}) scale(${scale}) translate(-512 -512)">${GLOW}${CANDLE}</g>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}${body}</svg>`;

async function write(name, s, w = 1024, h = 1024) {
  writeFileSync(`${SRC}/${name}.svg`, s);
  await sharp(Buffer.from(s)).resize(w, h).png().toFile(`${OUT}/${name}.png`);
}

// Master icon — must be opaque; the App Store rejects icons with an alpha channel.
await write('icon-only', svg(1024, 1024, `<rect width="1024" height="1024" fill="url(#dark)"/>${MARK(1)}`));

// Android adaptive layers. capacitor-assets insets the foreground by 16.7% (mapping
// it onto the 72dp visible area of the 108dp canvas), so don't pre-shrink it here.
await write('icon-foreground', svg(1024, 1024, MARK(1)));
await write('icon-background', svg(1024, 1024, `<rect width="1024" height="1024" fill="url(#dark)"/>`));

// Splash — flat ground (not the gradient) so there's no visible seam where the
// image stops and SplashScreen.backgroundColor takes over.
const splash = (bg) =>
  svg(2732, 2732, `<rect width="2732" height="2732" fill="${bg}"/>${MARK(1, 1366, 1366)}`);
await write('splash', splash(SPLASH_BG), 2732, 2732);
await write('splash-dark', splash(GROUND_BOT), 2732, 2732);

console.log(`✓ master assets -> ${OUT}`);
