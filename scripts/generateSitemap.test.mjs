import { test } from "node:test";
import assert from "node:assert/strict";
import { typeSlugs, buildUrls } from "./generateSitemap.mjs";

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
