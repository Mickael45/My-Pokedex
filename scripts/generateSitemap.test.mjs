import { test } from "node:test";
import assert from "node:assert/strict";
import { typeSlugs, buildUrls, buildSitemap, LASTMOD } from "./generateSitemap.mjs";

test("171 type slugs", () => assert.equal(typeSlugs().length, 171));
test("pairs alphabetical + unique", () => {
  const s = typeSlugs();
  assert.ok(s.includes("fire-water"));
  assert.ok(!s.includes("water-fire"));
  assert.equal(new Set(s).size, s.length);
});
test("total urls = 2 + 1025 + 171", () => assert.equal(buildUrls().length, 1198));
test("includes home, type hub, a detail page, a type page", () => {
  const urls = buildUrls();
  ["/", "/type-interactions", "/details/1", "/details/1025", "/type-interactions/fire"].forEach((u) =>
    assert.ok(urls.includes(u), `missing ${u}`)
  );
});
test("lastmod is a stable fixed date, not today-on-every-build", () => {
  // A constant — bumped only when page content changes — so rebuilds don't churn
  // lastmod and erode crawler trust (Google treats today-on-every-build as noise).
  assert.match(LASTMOD, /^\d{4}-\d{2}-\d{2}$/);
  // The generated XML must be byte-identical across calls (no `new Date()` inside).
  assert.equal(buildSitemap(), buildSitemap());
  assert.ok(buildSitemap().includes(`<lastmod>${LASTMOD}</lastmod>`));
});
