import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/images", { recursive: true });
mkdirSync("public/icons", { recursive: true });

const banner = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="80" y="300" font-family="Arial, sans-serif" font-size="92" font-weight="800" fill="#ffffff">My Pokédex</text>
  <text x="82" y="372" font-family="Arial, sans-serif" font-size="40" fill="#fde68a">Stats · Types · Weaknesses · Evolutions</text>
</svg>`;

async function run() {
  const pikachu = await sharp("public/images/surprised-pikachu-hd.png")
    .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(Buffer.from(banner))
    .composite([{ input: pikachu, top: 150, left: 800 }])
    .png()
    .toFile("public/images/og-default.png");

  // Icon set (square, red background to match the brand). 512 → apple-touch +
  // manifest, 192 → manifest, 32/16 → browser favicons.
  const red = { r: 185, g: 28, b: 28, alpha: 1 };
  const icon = (size, file) =>
    sharp("public/images/surprised-pikachu-hd.png")
      .resize(size, size, { fit: "contain", background: red })
      .png()
      .toFile(file);

  await Promise.all([
    icon(512, "public/icons/icon-512.png"),
    icon(192, "public/icons/icon-192.png"),
    icon(32, "public/icons/favicon-32.png"),
    icon(16, "public/icons/favicon-16.png"),
  ]);

  console.log("Wrote og-default.png and icons (512/192/32/16)");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
