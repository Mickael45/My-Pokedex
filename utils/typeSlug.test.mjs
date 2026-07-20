import { test } from "node:test";
import assert from "node:assert/strict";

const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];
const toTypeSlug = (types) => [...types].map((t) => t.toLowerCase()).sort().join("-");
const parseTypeSlug = (slug) => {
  const parts = slug.split("-");
  return parts.length >= 1 && parts.length <= 2 && parts.every((p) => TYPES.includes(p)) ? [...parts].sort() : [];
};
const allTypeSlugs = () => {
  const pairs = [];
  for (let i = 0; i < TYPES.length; i++) for (let j = i + 1; j < TYPES.length; j++) pairs.push(toTypeSlug([TYPES[i], TYPES[j]]));
  return [...TYPES, ...pairs];
};

test("slug is alphabetical", () => assert.equal(toTypeSlug(["water", "fire"]), "fire-water"));
test("parse rejects unknown types", () => assert.deepEqual(parseTypeSlug("fire-banana"), []));
test("parse rejects 3 types", () => assert.deepEqual(parseTypeSlug("fire-water-grass"), []));
test("parse accepts single + pair", () => {
  assert.deepEqual(parseTypeSlug("fire"), ["fire"]);
  assert.deepEqual(parseTypeSlug("water-fire"), ["fire", "water"]);
});
test("171 slugs, unique", () => {
  const s = allTypeSlugs();
  assert.equal(s.length, 171);
  assert.equal(new Set(s).size, 171);
});
