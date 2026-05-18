// Build a multi-resolution favicon.ico that embeds PNG payloads.
//
// Modern Windows Vista+ and all major browsers support PNG-encoded entries
// inside ICO files, which produces a much smaller file than the legacy
// uncompressed BMP encoding (and avoids `png-to-ico`'s habit of silently
// upscaling to 256x256).
//
// We use the already-resized PNG variants from /tmp/favicons-out/ and embed
// the 16/32/48 sizes — the canonical favicon.ico set.

import { readFileSync, writeFileSync } from 'node:fs';

const SIZES = [16, 32, 48];
const SRC_DIR = '/tmp/favicons-out';
const OUT = '/tmp/favicons-out/favicon.ico';

const entries = SIZES.map((size) => {
  const png = readFileSync(`${SRC_DIR}/favicon-${size}x${size}.png`);
  return { size, png };
});

// ICONDIR: reserved (2) + type (2) + count (2) = 6 bytes
// ICONDIRENTRY: width (1) + height (1) + colorCount (1) + reserved (1)
//             + planes (2) + bitCount (2) + bytesInRes (4) + imageOffset (4) = 16 bytes
const DIR_HEADER_SIZE = 6;
const ENTRY_SIZE = 16;
const headerBytes = DIR_HEADER_SIZE + ENTRY_SIZE * entries.length;

const header = Buffer.alloc(headerBytes);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = ICO
header.writeUInt16LE(entries.length, 4); // count

let cursor = headerBytes;
for (let i = 0; i < entries.length; i++) {
  const { size, png } = entries[i];
  const off = DIR_HEADER_SIZE + i * ENTRY_SIZE;
  // width/height: 0 means 256; for our sizes (16/32/48) write as-is
  header.writeUInt8(size === 256 ? 0 : size, off + 0);
  header.writeUInt8(size === 256 ? 0 : size, off + 1);
  header.writeUInt8(0, off + 2); // colorCount (0 for >= 256 colors)
  header.writeUInt8(0, off + 3); // reserved
  header.writeUInt16LE(1, off + 4); // planes
  header.writeUInt16LE(32, off + 6); // bitCount
  header.writeUInt32LE(png.length, off + 8); // bytesInRes
  header.writeUInt32LE(cursor, off + 12); // imageOffset
  cursor += png.length;
}

const out = Buffer.concat([header, ...entries.map((e) => e.png)]);
writeFileSync(OUT, out);

console.log(
  `wrote ${OUT} (${out.length} bytes; ${entries.length} entries: ${entries
    .map((e) => `${e.size}x${e.size}`)
    .join(', ')})`,
);
