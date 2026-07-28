// Build App Store / Play Store listing screenshots from raw app captures.
//
//   node scripts/store-screenshots.mjs [--out DIR] [--size WxH]
//
// Why compose rather than just resize: the source captures are 1206x2052 (the
// status bar was cropped off), an aspect of 0.588 against the 6.5" slot's 0.462.
// Padding that to size leaves ~10% dead bar top and bottom, and stretching it
// would visibly squeeze the text. Setting each capture on a branded canvas with
// a headline turns that mismatch into a deliberate layout — and captioned
// screenshots sell the app better than bare ones anyway.
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = '/Users/thomasmynott/Documents/CiP Platform/Mobile Rendering Photos';

// Ordered as they'll appear in the listing — the first one carries the most
// weight, so lead with the feed rather than a form.
const SHOTS = [
  // The lead screenshot carries the brand triad rather than a feature caption —
  // the app name and subtitle already say what the app is. Set one value per
  // line: the "·" separators don't survive wrapping at this size, and breaking
  // mid-phrase ("Relational · Celebrating / Disagreement · Faithful,") reads
  // badly. Three clean lines keep every word and the rhythm.
  { file: 'IMG_1308.jpg', lines: ['Relational', 'Celebrating Disagreement', 'Faithful, Not Fearful'] },
  { file: 'IMG_1307.jpg', lines: ['Groups for your party,', 'electorate or tradition'] },
  { file: 'IMG_1306.jpg', lines: ['Follow the ministries', 'shaping public life'] },
  // Caption avoids repeating "Create an event", which is already the modal's
  // own heading inside the capture.
  { file: 'IMG_1305.jpg', lines: ['Host gatherings', 'in minutes'] },
  { file: 'IMG_1309.jpg', lines: ['You control', 'what you share'] },
];

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); if (i === -1) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const OUT = resolve(ROOT, flag('--out', 'store-screenshots'));
const [W, H] = flag('--size', '1284x2778').split('x').map(Number);

// Brand palette — matches the app icon so the listing reads as one piece.
const GOLD = '#d89f55';
const CREAM = '#f2e7dc';
const TOP = '#4a2d20';
const BOT = '#2b1a12';

const MARGIN = 72;
const BOX_W = W - MARGIN * 2;         // widest a capture may be
const BOX_H = 1940;                   // tallest a capture may be
const BOX_Y = 640;                    // top of the capture
const RADIUS = 44;

mkdirSync(OUT, { recursive: true });

const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stop-color="${TOP}"/>
         <stop offset="100%" stop-color="${BOT}"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
   </svg>`
);

for (const [i, shot] of SHOTS.entries()) {
  const src = join(SRC, shot.file);
  if (!existsSync(src)) { console.error(`✗ missing: ${src}`); process.exit(1); }

  const { width: sw, height: sh } = await sharp(src).metadata();
  // Fit inside the box, preserving aspect — captures differ in width (the modal
  // one is 1109 wide, the rest 1206), so a fixed scale would misalign them.
  const scale = Math.min(BOX_W / sw, BOX_H / sh);
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);
  const x = Math.round((W - w) / 2);

  const rounded = await sharp(src)
    .resize(w, h)
    .composite([{
      input: Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`),
      blend: 'dest-in',
    }])
    .png()
    .toBuffer();

  // Soft drop shadow: a blurred black rounded rect sitting just behind.
  const shadow = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{
      input: Buffer.from(
        `<svg width="${W}" height="${H}"><rect x="${x}" y="${BOX_Y + 18}" width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}" fill="rgba(0,0,0,0.55)"/></svg>`
      ),
    }])
    .blur(34)
    .png()
    .toBuffer();

  // Lift the block for longer captions so a 3-line one doesn't crowd the phone.
  const LINE_H = 108;
  const startY = 268 - (shot.lines.length - 2) * 40;
  const ruleY = startY + shot.lines.length * LINE_H - 30;

  const caption = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <g font-family="Helvetica Neue, Helvetica, Arial" font-weight="700" fill="${CREAM}"
          font-size="86" text-anchor="middle" letter-spacing="-1">
         ${shot.lines.map((l, n) => `<text x="${W / 2}" y="${startY + n * LINE_H}">${l}</text>`).join('')}
       </g>
       <rect x="${W / 2 - 60}" y="${ruleY}" width="120" height="7" rx="3.5" fill="${GOLD}"/>
     </svg>`
  );

  const out = join(OUT, `${String(i + 1).padStart(2, '0')}-${shot.file.replace(/\.jpe?g$/i, '')}-${W}x${H}.png`);
  await sharp(background)
    .composite([
      { input: shadow, top: 0, left: 0 },
      { input: rounded, top: BOX_Y, left: x },
      { input: caption, top: 0, left: 0 },
    ])
    .png()
    .toFile(out);

  console.log(`${shot.file}  ${sw}x${sh} → ${W}x${H}   "${shot.lines.join(' ')}"`);
}

console.log(`\n✓ ${SHOTS.length} screenshots → ${OUT}/`);
