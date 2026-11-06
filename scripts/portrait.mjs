// Builds the optimized portrait assets (three .webp sizes + the social share image) from one photo.
// Used by `npm run images` and by the admin dashboard's photo upload.
//
// Photos with transparency are used as-is. Otherwise the photo is assumed to be shot on a plain light
// backdrop: the backdrop is flood-filled from the image edges to cut the person out.
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

/** Source photo, in order of preference. */
export const PHOTO_CANDIDATES = ['photo.png', 'photo.jpg'];
export const findPhoto = (root = '.') => PHOTO_CANDIDATES.map((p) => `${root}/${p}`).find((p) => existsSync(p));

// A pixel counts as backdrop when it is this bright and this unsaturated.
const MIN_BRIGHT = 212;
const MAX_SPREAD = 28;

function floodBackdrop(rgb, width, height) {
  const isBackdrop = (i) => {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    return Math.min(r, g, b) >= MIN_BRIGHT && Math.max(r, g, b) - Math.min(r, g, b) <= MAX_SPREAD;
  };
  const bg = new Uint8Array(width * height);
  const stack = [];
  const seed = (x, y) => {
    const i = y * width + x;
    if (!bg[i] && isBackdrop(i)) { bg[i] = 1; stack.push(i); }
  };
  // Seed from the top, left and right edges (a portrait usually runs off the bottom edge).
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
  return bg;
}

/** Crop box around the subject: 4:5, anchored to the bottom, with a little headroom. */
function autoCrop(fg, width, height) {
  let minX = width, maxX = 0, minY = height;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (fg(y * width + x)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
      }
  if (minX > maxX) return { left: 0, top: 0, width, height };
  const top = Math.max(0, Math.round(minY - (height - minY) * 0.05));
  const h = height - top;
  const w = Math.min(width, Math.max(maxX - minX + 1, Math.round(h * 0.8)));
  const cx = (minX + maxX) / 2;
  const left = Math.min(width - w, Math.max(0, Math.round(cx - w / 2)));
  return { left, top, width: w, height: h };
}

/**
 * @param {object} o
 * @param {string} o.src           source photo path
 * @param {'auto'|{left:number,top:number,width:number,height:number}} o.crop
 * @param {string} o.outDir        e.g. public/assets
 * @param {string} o.title         big word on the share image (first name)
 * @param {string} o.subtitle      small line on the share image
 * @returns {Promise<{left:number,top:number,width:number,height:number}>} the crop that was used
 */
export async function buildPortraits({ src, crop = 'auto', outDir = 'public/assets', title = '', subtitle = '' }) {
  mkdirSync(outDir, { recursive: true });
  const base = sharp(src).rotate();
  const meta = await base.metadata();
  const fullW = meta.autoOrient?.width ?? meta.width;
  const fullH = meta.autoOrient?.height ?? meta.height;

  // Work out the mask on the full image so auto-crop can find the subject.
  const { data: rgbaFull } = await sharp(src).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hasAlpha = meta.hasAlpha;
  let isFg;
  if (hasAlpha) {
    isFg = (i) => rgbaFull[i * 4 + 3] > 24;
  } else {
    const rgb = Buffer.alloc(fullW * fullH * 3);
    for (let i = 0; i < fullW * fullH; i++) {
      rgb[i * 3] = rgbaFull[i * 4];
      rgb[i * 3 + 1] = rgbaFull[i * 4 + 1];
      rgb[i * 3 + 2] = rgbaFull[i * 4 + 2];
    }
    const bg = floodBackdrop(rgb, fullW, fullH);
    isFg = (i) => !bg[i];
  }

  const box = crop === 'auto' || !crop ? autoCrop(isFg, fullW, fullH) : {
    left: Math.max(0, Math.min(fullW - 1, Math.round(crop.left))),
    top: Math.max(0, Math.min(fullH - 1, Math.round(crop.top))),
    width: Math.round(crop.width),
    height: Math.round(crop.height),
  };
  box.width = Math.max(1, Math.min(box.width, fullW - box.left));
  box.height = Math.max(1, Math.min(box.height, fullH - box.top));

  // Build the cropped RGBA cutout.
  const { left, top, width, height } = box;
  const mask = Buffer.alloc(width * height);
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const si = (y + top) * fullW + (x + left);
      const di = y * width + x;
      mask[di] = isFg(si) ? 255 : 0;
      rgba[di * 4] = rgbaFull[si * 4];
      rgba[di * 4 + 1] = rgbaFull[si * 4 + 1];
      rgba[di * 4 + 2] = rgbaFull[si * 4 + 2];
    }
  // Soften the edge, then pull it in ~1px so no fringe from the backdrop remains.
  const alpha = await sharp(mask, { raw: { width, height, channels: 1 } }).blur(2.5).extractChannel(0).raw().toBuffer();
  for (let i = 0; i < width * height; i++) {
    const a = hasAlpha ? Math.min(rgbaFull[((((i / width) | 0) + top) * fullW + (i % width) + left) * 4 + 3], 255) : Math.max(0, Math.min(255, (alpha[i] - 150) * 2.4));
    rgba[i * 4 + 3] = a;
  }
  const cutout = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();

  for (const w of [1100, 720, 420]) {
    await sharp(cutout).resize({ width: w }).webp({ quality: 86, alphaQuality: 90 }).toFile(`${outDir}/portrait-${w}.webp`);
  }

  // Social share image (1200x630) on a dark backdrop
  const esc = (s) => String(s).replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
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
          <text x="72" y="300" font-family="Impact, 'Arial Narrow', sans-serif" font-size="128" fill="#f4f1ec" letter-spacing="4">${esc(title.toUpperCase())}</text>
          <text x="78" y="352" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="26" fill="#ff3d5a" letter-spacing="16">THE SERIES</text>
          <text x="78" y="420" font-family="Helvetica, Arial, sans-serif" font-weight="600" font-size="18" fill="#a7a6ad" letter-spacing="5">${esc(subtitle.toUpperCase())}</text>
        </svg>`),
      },
    ])
    .jpeg({ quality: 85 })
    .toFile(`${outDir}/og-image.jpg`);

  return box;
}
