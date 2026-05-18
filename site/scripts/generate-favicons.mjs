// Generate favicon variants from owl-icon.png using sharp.
//
// Source image: /Users/cmlee/Workspace/myengoo/owl-icon.png (177x163 RGBA PNG)
// We pad to square (177x177) on a transparent background (centered), then
// downscale to standard favicon sizes.
//
// Sizes generated:
//   16, 32, 48 — used inside multi-resolution favicon.ico (and as standalone PNGs)
//   96         — extra resolution for desktop browser tabs / shortcuts
//   180        — Apple touch icon (iOS Safari home-screen)
//   192        — Android Chrome / PWA manifest
//
// Output is written to /tmp/favicons-out/. The deploy step copies the files
// into site/public/ and app/public/.

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = '/Users/cmlee/Workspace/myengoo/owl-icon.png';
const OUT_DIR = '/tmp/favicons-out';
mkdirSync(OUT_DIR, { recursive: true });

const meta = await sharp(SRC).metadata();
console.log(`source: ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha}`);

// Pad to square (max dimension) on transparent background, centered.
const side = Math.max(meta.width, meta.height);
const padded = await sharp(SRC)
  .extend({
    top: Math.floor((side - meta.height) / 2),
    bottom: Math.ceil((side - meta.height) / 2),
    left: Math.floor((side - meta.width) / 2),
    right: Math.ceil((side - meta.width) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
console.log(`padded: ${side}x${side}`);

const sizes = [16, 32, 48, 96, 180, 192];
for (const size of sizes) {
  const out = join(OUT_DIR, `favicon-${size}x${size}.png`);
  await sharp(padded)
    .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`wrote ${out}`);
}

// Apple touch icon alias (same as 180x180).
await sharp(padded)
  .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
  .png({ compressionLevel: 9 })
  .toFile(join(OUT_DIR, 'apple-touch-icon.png'));
console.log('wrote apple-touch-icon.png (180x180)');

console.log('done.');
