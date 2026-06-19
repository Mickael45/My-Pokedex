// Generates the full favicon / app-icon set from public/surprised-pikachu.png.
// Run on demand (not in prebuild — the source is static): `node scripts/generateIcons.mjs`.
// Covers the 2026 minimal set (Evil Martians "How to Favicon"): favicon.ico
// (16/32/48), favicon-16/32 PNGs, apple-touch-icon 180 (opaque), and manifest
// icons 192 + 512 + a separate 512 maskable. Pixel art is scaled nearest-neighbour
// to stay crisp and on-brand.
import sharp from "sharp";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = readFileSync(join(ROOT, "public", "surprised-pikachu.png"));
const ICONS = join(ROOT, "public", "icons");
const WHITE = { r: 255, g: 255, b: 255 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// Transparent square PNG, pikachu centred (for favicons + manifest "any").
const png = (size) =>
  sharp(SRC)
    .resize(size, size, { fit: "contain", background: CLEAR, kernel: "nearest" })
    .png()
    .toBuffer();

// Opaque square PNG on white with optional safe-zone padding (apple-touch must be
// opaque; maskable needs full-bleed bg + the icon kept inside the safe zone).
const opaque = (size, padRatio = 0) => {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  return sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: WHITE, kernel: "nearest" })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: WHITE })
    .flatten({ background: WHITE })
    .png()
    .toBuffer();
};

// Pack PNG buffers into a multi-size .ico (PNG-compressed entries — supported by
// all current browsers and Google's /favicon.ico fetch).
const buildIco = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach(({ size, buf }, i) => {
    const e = 16 * i;
    dir.writeUInt8(size >= 256 ? 0 : size, e + 0);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(buf.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
};

const main = async () => {
  const f16 = await png(16);
  const f32 = await png(32);
  const f48 = await png(48);

  writeFileSync(join(ICONS, "favicon-16.png"), f16);
  writeFileSync(join(ICONS, "favicon-32.png"), f32);
  writeFileSync(join(ICONS, "icon-192.png"), await png(192));
  writeFileSync(join(ICONS, "icon-512.png"), await png(512));
  writeFileSync(join(ICONS, "icon-512-maskable.png"), await opaque(512, 0.12));
  writeFileSync(join(ICONS, "apple-touch-icon.png"), await opaque(180));
  writeFileSync(
    join(ROOT, "public", "favicon.ico"),
    buildIco([
      { size: 16, buf: f16 },
      { size: 32, buf: f32 },
      { size: 48, buf: f48 },
    ])
  );

  console.log("Generated favicon.ico + favicon-16/32, icon-192/512, icon-512-maskable, apple-touch-icon");
};

main();
