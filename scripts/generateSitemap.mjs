import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORIGIN = "https://www.my-pokedex.com";
const MAX_POKEMON_ID = 1025;
// Mirror of constants/Types.ts — Pokémon's 18 types are fixed. Order MUST match
// Object.values(constants/Types.ts), because typeSlugs() (EN) and allFrTypeSlugs()
// (FR) both iterate the types in that order, so the two lists align by index and
// index i of one is the reciprocal of index i of the other.
const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];

// Stable last-modified date for every URL. Bump this ONLY when page content
// actually changes (new Pokémon, data, or layout). It is a constant — not
// `new Date()` — so rebuilding/redeploying does not stamp today's date on every
// unchanged URL, which Google's John Mueller calls out as a lazy signal that
// erodes lastmod trust and wastes crawl budget.
export const LASTMOD = "2026-07-07";

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

// Static routes with a fixed EN↔FR counterpart: home, the type hub, and the four
// legal/trust pages (pages/{about,privacy,contact,terms}.tsx + their /fr mirrors).
// Every one is emitted on BOTH sides with reciprocal hreflang.
const STATIC_PAIRS = [
  { en: "/", fr: "/fr" },
  { en: "/type-interactions", fr: "/fr/type-interactions" },
  { en: "/about", fr: "/fr/about" },
  { en: "/privacy", fr: "/fr/privacy" },
  { en: "/contact", fr: "/fr/contact" },
  { en: "/terms", fr: "/fr/terms" },
];

// The EN paths, kept for the URL-count test and any EN-only consumer. FR paths
// are assembled from the fetched slug maps inside buildSitemap().
export const buildUrls = () => {
  const urls = STATIC_PAIRS.map((pair) => pair.en);
  for (let id = 1; id <= MAX_POKEMON_ID; id++) urls.push(`/details/${id}`);
  typeSlugs().forEach((slug) => urls.push(`/type-interactions/${slug}`));
  return urls;
};

const abs = (path) => `${ORIGIN}${path}`;

// One <xhtml:link> alternate line.
const altLine = (hreflang, path) =>
  `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${abs(path)}"/>`;

// Render a single <url>. When `alt` ({ en, fr }) is given, the page carries the
// reciprocal trio: en + x-default → the English URL, fr → the French URL. EN-only
// pages pass alt=null and get no alternates.
const renderUrl = (path, lastmod, alt) => {
  const lines = [`  <url>`, `    <loc>${abs(path)}</loc>`, `    <lastmod>${lastmod}</lastmod>`];
  if (alt) {
    lines.push(altLine("en", alt.en), altLine("fr", alt.fr), altLine("x-default", alt.en));
  }
  lines.push(`  </url>`);
  return lines.join("\n");
};

// PURE, testable assembly. Given the last-modified date, the id→frSlug map
// (from buildFrSlugMaps().idToSlug) and the FR type slugs (from allFrTypeSlugs(),
// index-aligned with typeSlugs()), it emits every EN and FR <url> with reciprocal
// hreflang alternates. No network here — main() does the fetching.
export const buildSitemap = ({ lastmod = LASTMOD, idToFrSlug = {}, frTypeSlugs = [] } = {}) => {
  const enTypeSlugs = typeSlugs();
  if (frTypeSlugs.length && frTypeSlugs.length !== enTypeSlugs.length) {
    throw new Error(
      `FR type slug count (${frTypeSlugs.length}) != EN (${enTypeSlugs.length}); they must align by index.`
    );
  }

  const blocks = [];

  // --- English URLs (each static page carries its reciprocal FR alternate) ---
  for (const pair of STATIC_PAIRS) {
    blocks.push(renderUrl(pair.en, lastmod, { en: pair.en, fr: pair.fr }));
  }
  for (let id = 1; id <= MAX_POKEMON_ID; id++) {
    const frSlug = idToFrSlug[id];
    const alt = frSlug ? { en: `/details/${id}`, fr: `/fr/pokemon/${frSlug}` } : null;
    blocks.push(renderUrl(`/details/${id}`, lastmod, alt));
  }
  enTypeSlugs.forEach((enSlug, i) => {
    const frSlug = frTypeSlugs[i];
    const alt = frSlug
      ? { en: `/type-interactions/${enSlug}`, fr: `/fr/type-interactions/${frSlug}` }
      : null;
    blocks.push(renderUrl(`/type-interactions/${enSlug}`, lastmod, alt));
  });

  // --- French URLs (each carries the reciprocal of its EN pair) ---
  for (const pair of STATIC_PAIRS) {
    blocks.push(renderUrl(pair.fr, lastmod, { en: pair.en, fr: pair.fr }));
  }
  for (let id = 1; id <= MAX_POKEMON_ID; id++) {
    const frSlug = idToFrSlug[id];
    if (!frSlug) continue;
    blocks.push(renderUrl(`/fr/pokemon/${frSlug}`, lastmod, { en: `/details/${id}`, fr: `/fr/pokemon/${frSlug}` }));
  }
  enTypeSlugs.forEach((enSlug, i) => {
    const frSlug = frTypeSlugs[i];
    if (!frSlug) return;
    blocks.push(
      renderUrl(`/fr/type-interactions/${frSlug}`, lastmod, {
        en: `/type-interactions/${enSlug}`,
        fr: `/fr/type-interactions/${frSlug}`,
      })
    );
  });

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${blocks.join("\n")}\n` +
    `</urlset>\n`
  );
};

// Count of FR URLs a given assembly emits — used for the run log. The FR side now
// mirrors all static pairs (home, type hub, 4 legal pages) plus per-entity pages.
export const countFrUrls = (idToFrSlug, frTypeSlugs) =>
  STATIC_PAIRS.length + Object.keys(idToFrSlug).length + frTypeSlugs.length;

// The generator's impure entry point: fetch the FR slug maps (a build-time
// ~1025-species PokéAPI fetch), then write the assembled XML. TS helpers are
// imported dynamically so this .mjs still loads under plain `node` (e.g. the
// node:test file) without a TS loader — only tsx-run main() resolves them.
const main = async () => {
  const { buildFrSlugMaps } = await import("../services/fetchPokemons/fetchPokemonsFr.ts");
  const { allFrTypeSlugs } = await import("../utils/frTypeSlug.ts");

  const { idToSlug } = await buildFrSlugMaps();
  const frTypeSlugs = allFrTypeSlugs();

  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
  writeFileSync(out, buildSitemap({ idToFrSlug: idToSlug, frTypeSlugs }));

  const enCount = buildUrls().length;
  const frCount = countFrUrls(idToSlug, frTypeSlugs);
  console.log(
    `Wrote ${enCount + frCount} URLs to public/sitemap.xml (${enCount} EN + ${frCount} FR, hreflang-annotated).`
  );
};

// Run only when executed directly, so the test can import the helpers safely.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
