import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORIGIN = "https://www.my-pokedex.com";
const MAX_POKEMON_ID = 1025;
// Mirror of constants/Types.ts — Pokémon's 18 types are fixed.
const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];

const toSlug = (types) => [...types].sort().join("-");

export const typeSlugs = () => {
  const pairs = [];
  for (let i = 0; i < TYPES.length; i++) {
    for (let j = i + 1; j < TYPES.length; j++) {
      pairs.push(toSlug([TYPES[i], TYPES[j]]));
    }
  }
  return [...TYPES, ...pairs];
};

export const buildUrls = () => {
  const urls = ["/", "/type-interactions"];
  for (let id = 1; id <= MAX_POKEMON_ID; id++) urls.push(`/details/${id}`);
  typeSlugs().forEach((slug) => urls.push(`/type-interactions/${slug}`));
  return urls;
};

export const buildSitemap = (lastmod) => {
  const body = buildUrls()
    .map((path) => `  <url>\n    <loc>${ORIGIN}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

// Write only when executed directly, so the test can import the helpers safely.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
  writeFileSync(out, buildSitemap(lastmod));
  console.log(`Wrote ${buildUrls().length} URLs to public/sitemap.xml`);
}
