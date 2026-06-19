import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORIGIN = "https://www.my-pokedex.com";
const MAX_POKEMON_ID = 1025;
// Mirror of constants/Types.ts — Pokémon's 18 types are fixed.
const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];

// Stable last-modified date for every URL. Bump this ONLY when page content
// actually changes (new Pokémon, data, or layout). It is a constant — not
// `new Date()` — so rebuilding/redeploying does not stamp today's date on 1,198
// unchanged URLs, which Google's John Mueller calls out as a lazy signal that
// erodes lastmod trust and wastes crawl budget.
export const LASTMOD = "2026-06-18";

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

// Static routes that aren't data-generated: home, the type hub, and the
// legal/trust pages (pages/{about,privacy,contact,terms}.tsx).
const STATIC_PAGES = ["/", "/type-interactions", "/about", "/privacy", "/contact", "/terms"];

export const buildUrls = () => {
  const urls = [...STATIC_PAGES];
  for (let id = 1; id <= MAX_POKEMON_ID; id++) urls.push(`/details/${id}`);
  typeSlugs().forEach((slug) => urls.push(`/type-interactions/${slug}`));
  return urls;
};

export const buildSitemap = (lastmod = LASTMOD) => {
  const body = buildUrls()
    .map((path) => `  <url>\n    <loc>${ORIGIN}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

// Write only when executed directly, so the test can import the helpers safely.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
  writeFileSync(out, buildSitemap());
  console.log(`Wrote ${buildUrls().length} URLs to public/sitemap.xml`);
}
