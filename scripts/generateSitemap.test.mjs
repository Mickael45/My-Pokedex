import { test } from "node:test";
import assert from "node:assert/strict";
import { typeSlugs, buildUrls, buildSitemap, countFrUrls, LASTMOD } from "./generateSitemap.mjs";

// A tiny, deterministic FR fixture — the pure assembly takes the slug data as
// arguments, so it is unit-testable WITHOUT the build-time PokéAPI fetch (that
// lives in the generator's main()).
const idToFrSlug = { 1: "bulbizarre", 4: "salameche", 1025: "pris-la-vermine" };
const frTypeSlugs = typeSlugs().map((s) => `fr-${s}`); // index-aligned stand-ins

test("171 type slugs", () => assert.equal(typeSlugs().length, 171));
test("pairs alphabetical + unique", () => {
  const s = typeSlugs();
  assert.ok(s.includes("fire-water"));
  assert.ok(!s.includes("water-fire"));
  assert.equal(new Set(s).size, s.length);
});
test("total EN urls = 6 static + 1025 + 171", () => assert.equal(buildUrls().length, 1202));
test("includes home, type hub, legal pages, a detail page, a type page", () => {
  const urls = buildUrls();
  [
    "/", "/type-interactions", "/about", "/privacy", "/contact", "/terms",
    "/details/1", "/details/1025", "/type-interactions/fire",
  ].forEach((u) => assert.ok(urls.includes(u), `missing ${u}`));
});

test("lastmod is a stable fixed date, not today-on-every-build", () => {
  // A constant — bumped only when page content changes — so rebuilds don't churn
  // lastmod and erode crawler trust (Google treats today-on-every-build as noise).
  assert.match(LASTMOD, /^\d{4}-\d{2}-\d{2}$/);
  // The generated XML must be byte-identical across calls (no `new Date()` inside).
  assert.equal(
    buildSitemap({ idToFrSlug, frTypeSlugs }),
    buildSitemap({ idToFrSlug, frTypeSlugs })
  );
  assert.ok(buildSitemap({ idToFrSlug, frTypeSlugs }).includes(`<lastmod>${LASTMOD}</lastmod>`));
});

test("urlset declares the sitemap + xhtml namespaces", () => {
  const xml = buildSitemap({ idToFrSlug, frTypeSlugs });
  assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
  assert.ok(xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
});

test("emits FR URLs: /fr, /fr/type-interactions, /fr/pokemon/{slug}, /fr/type-interactions/{frSlug}", () => {
  const xml = buildSitemap({ idToFrSlug, frTypeSlugs });
  [
    "<loc>https://www.my-pokedex.com/fr</loc>",
    "<loc>https://www.my-pokedex.com/fr/type-interactions</loc>",
    "<loc>https://www.my-pokedex.com/fr/pokemon/bulbizarre</loc>",
    "<loc>https://www.my-pokedex.com/fr/pokemon/pris-la-vermine</loc>",
    "<loc>https://www.my-pokedex.com/fr/type-interactions/fr-fire</loc>",
  ].forEach((frag) => assert.ok(xml.includes(frag), `missing ${frag}`));
});

test("FR URL count = 2 static + mapped ids + fr type slugs", () => {
  assert.equal(countFrUrls(idToFrSlug, frTypeSlugs), 2 + 3 + 171);
});

test("reciprocal hreflang trio on both sides of a paired page", () => {
  const xml = buildSitemap({ idToFrSlug, frTypeSlugs });
  const en = 'href="https://www.my-pokedex.com/details/1"';
  const fr = 'href="https://www.my-pokedex.com/fr/pokemon/bulbizarre"';
  // en + x-default → EN, fr → FR (each appears on BOTH the EN and FR <url>).
  assert.equal((xml.match(new RegExp(`hreflang="en" ${en.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`, "g")) || []).length, 2);
  assert.equal((xml.match(new RegExp(`hreflang="x-default" ${en.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`, "g")) || []).length, 2);
  assert.equal((xml.match(new RegExp(`hreflang="fr" ${fr.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`, "g")) || []).length, 2);
});

test("home <-> /fr are a reciprocal pair", () => {
  const xml = buildSitemap({ idToFrSlug, frTypeSlugs });
  assert.ok(xml.includes('<xhtml:link rel="alternate" hreflang="fr" href="https://www.my-pokedex.com/fr"/>'));
  assert.ok(xml.includes('<xhtml:link rel="alternate" hreflang="en" href="https://www.my-pokedex.com/"/>'));
});

test("EN-only legal pages carry no alternates", () => {
  const xml = buildSitemap({ idToFrSlug, frTypeSlugs });
  // Grab the <url> block for /privacy and assert it has no xhtml:link child.
  const block = xml.split("<url>").find((b) => b.includes("<loc>https://www.my-pokedex.com/privacy</loc>"));
  assert.ok(block, "no /privacy url block");
  assert.ok(!block.includes("xhtml:link"), "/privacy should have no hreflang alternates");
});

test("mismatched FR/EN type-slug lengths throw (index alignment guard)", () => {
  assert.throws(() => buildSitemap({ idToFrSlug, frTypeSlugs: ["only-one"] }), /align by index/);
});
