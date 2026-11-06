// Builds optimized portrait assets from photo.jpg in the project root.
// The photo is shot on a plain light backdrop: the backdrop is flood-filled from the image edges
// to make a transparent cutout, so no separate background-removed file is needed.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/assets';
const SRC = 'photo.jpg';
// Crop box (in source pixels) framing head to waist. Adjust if you swap the photo.
const CROP = { left: 900, top: 120, width: 1620, height: 2024 };
// A pixel counts as backdrop when it is this bright and this unsaturated.
const MIN_BRIGHT = 212;
const MAX_SPREAD = 28;

mkdirSync(OUT, { recursive: true });

const { data: rgb, info } = await sharp(SRC).rotate().extract(CROP).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

const isBackdrop = (i) => {
  const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
  return Math.min(r, g, b) >= MIN_BRIGHT && Math.max(r, g, b) - Math.min(r, g, b) <= MAX_SPREAD;
};

// Flood fill from the top, left and right edges (the subject runs off the bottom edge).
const bg = new Uint8Array(width * height);
const stack = [];
const seed = (x, y) => {
  const i = y * width + x;
  if (!bg[i] && isBackdrop(i)) { bg[i] = 1; stack.push(i); }
};
for (let x = 0; x < width; x++) seed(x, 0);
for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y); }
while (stack.length) {
  const i = stack.pop();
  const x = i % width, y = (i / width) | 0;
  if (x > 0) seed(x - 1, y);
  if (x < width - 1) seed(x + 1, y);
  if (y > 0) seed(x, y - 1);
  if (y < height - 1) seed(x, y + 1);
}

const mask = Buffer.alloc(width * height);
for (let i = 0; i < mask.length; i++) mask[i] = bg[i] ? 0 : 255;
// Soften the edge, then pull it in ~1px so no white fringe from the backdrop remains.
const alpha = await sharp(mask, { raw: { width, height, channels: 1 } }).blur(2.5).extractChannel(0).raw().toBuffer();
for (let i = 0; i < alpha.length; i++) alpha[i] = Math.max(0, Math.min(255, (alpha[i] - 150) * 2.4));

const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  rgba[i * 4] = rgb[i * 3];
  rgba[i * 4 + 1] = rgb[i * 3 + 1];
  rgba[i * 4 + 2] = rgb[i * 3 + 2];
  rgba[i * 4 + 3] = alpha[i];
}
const cutout = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();

for (const w of [1100, 720, 420]) {
  await sharp(cutout).resize({ width: w }).webp({ quality: 86, alphaQuality: 90 }).toFile(`${OUT}/portrait-${w}.webp`);
}

// Social share image (1200x630) on a dark backdrop
const portrait = await sharp(cutout).resize({ height: 600 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#07070a' } })
  .composite([
    {
      input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="g" cx="78%" cy="45%" r="45%"><stop offset="0" stop-color="#e5132b" stop-opacity="0.45"/><stop offset="1" stop-color="#e5132b" stop-opacity="0"/></radialGradient></defs>
        <rect width="1200" height="630" fill="url(#g)"/>
      </svg>`),
    },
    { input: portrait, gravity: 'southeast' },
    {
      input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <text x="72" y="300" font-family="Impact, 'Arial Narrow', sans-serif" font-size="128" fill="#f4f1ec" letter-spacing="4">HIMANSHU</text>
        <text x="78" y="352" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="26" fill="#ff3d5a" letter-spacing="16">THE SERIES</text>
        <text x="78" y="420" font-family="Helvetica, Arial, sans-serif" font-weight="600" font-size="18" fill="#a7a6ad" letter-spacing="5">AI / ML ENGINEER • GENERATIVE AI • PYTHON</text>
      </svg>`),
    },
  ])
  .jpeg({ quality: 85 })
  .toFile(`${OUT}/og-image.jpg`);
console.log('images built');
