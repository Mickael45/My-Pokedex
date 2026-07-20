import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeStubs, STUB_PREFIX } from "./scaffoldFrStubs.mjs";

test("mergeStubs inserts a stub carrying the English reference for each gap", () => {
  const overrides = { flavorText: {}, abilities: {} };
  const gaps = [
    { entityType: "flavorText", id: "906", field: "text", englishRef: "Some English entry." },
    { entityType: "abilities", id: "mycelium-might", field: "name", englishRef: "Mycelium Might" },
  ];
  const { merged, addedCount } = mergeStubs(overrides, gaps);
  assert.equal(addedCount, 2);
  assert.equal(merged.flavorText["906"].text, `${STUB_PREFIX}Some English entry.`);
  assert.equal(merged.abilities["mycelium-might"].name, `${STUB_PREFIX}Mycelium Might`);
});

test("mergeStubs does not overwrite an already-filled value", () => {
  const overrides = { flavorText: { "906": { text: "Déjà traduit." } } };
  const gaps = [{ entityType: "flavorText", id: "906", field: "text", englishRef: "English." }];
  const { merged, addedCount } = mergeStubs(overrides, gaps);
  assert.equal(addedCount, 0);
  assert.equal(merged.flavorText["906"].text, "Déjà traduit.");
});
