// `npm run images` — rebuilds the portrait assets from photo.png / photo.jpg in the project root.
// The crop comes from settings.photoCrop in src/data/content.json ('auto' or {left, top, width, height}).
import { readFileSync } from 'node:fs';
import { buildPortraits, findPhoto } from './portrait.mjs';

const content = JSON.parse(readFileSync('src/data/content.json', 'utf8'));
const src = findPhoto();
if (!src) {
  console.error('No photo.png or photo.jpg in the project root.');
  process.exit(1);
}
const box = await buildPortraits({
  src,
  crop: content.settings?.photoCrop ?? 'auto',
  title: content.profile.firstName,
  subtitle: content.profile.tagline.join(' • '),
});
console.log('images built from', src, 'crop', box);
