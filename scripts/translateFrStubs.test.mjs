import { test } from "node:test";
import assert from "node:assert/strict";
import { collectStubs, applyTranslation } from "./translateFrStubs.mjs";
import { STUB_PREFIX } from "./scaffoldFrStubs.mjs";

test("collectStubs finds only __STUB__ values and strips the prefix", () => {
  const overrides = {
    flavorText: {
      "906": { text: `${STUB_PREFIX}Some English entry.` },
      "907": { text: "Déjà traduit." }, // already translated → ignored
    },
    abilities: {
      "mycelium-might": { name: `${STUB_PREFIX}Mycelium Might` },
    },
  };
  const stubs = collectStubs(overrides);
  assert.equal(stubs.length, 2);
  assert.deepEqual(stubs, [
    {
      entityType: "abilities",
      id: "mycelium-might",
      field: "name",
      englishRef: "Mycelium Might",
    },
    {
      entityType: "flavorText",
      id: "906",
      field: "text",
      englishRef: "Some English entry.",
    },
  ]);
});

test("collectStubs ignores non-string and empty trees", () => {
  const overrides = {
    flavorText: { "1": { text: 42, other: null } },
    misc: null,
  };
  assert.deepEqual(collectStubs(overrides), []);
  assert.deepEqual(collectStubs({}), []);
});

test("collectStubs orders numeric ids numerically, not lexically", () => {
  const overrides = {
    flavorText: {
      "10": { text: `${STUB_PREFIX}ten` },
      "2": { text: `${STUB_PREFIX}two` },
      "9": { text: `${STUB_PREFIX}nine` },
    },
  };
  assert.deepEqual(
    collectStubs(overrides).map((s) => s.id),
    ["2", "9", "10"],
  );
});

test("applyTranslation sets the value without the prefix", () => {
  const overrides = {
    flavorText: { "906": { text: `${STUB_PREFIX}Some English entry.` } },
  };
  const stub = { entityType: "flavorText", id: "906", field: "text" };
  const next = applyTranslation(overrides, stub, "Une entrée française.");
  assert.equal(next.flavorText["906"].text, "Une entrée française.");
  assert.ok(!next.flavorText["906"].text.startsWith(STUB_PREFIX));
});

test("applyTranslation does not mutate the input overrides", () => {
  const original = `${STUB_PREFIX}Some English entry.`;
  const overrides = { flavorText: { "906": { text: original } } };
  const stub = { entityType: "flavorText", id: "906", field: "text" };
  const next = applyTranslation(overrides, stub, "Traduit.");
  assert.equal(overrides.flavorText["906"].text, original); // unchanged
  assert.notEqual(next, overrides);
  assert.notEqual(next.flavorText, overrides.flavorText);
});

test("applyTranslation leaves sibling entries untouched", () => {
  const overrides = {
    flavorText: {
      "906": { text: `${STUB_PREFIX}A` },
      "907": { text: "Intact." },
    },
    abilities: { "x": { name: `${STUB_PREFIX}B` } },
  };
  const next = applyTranslation(
    overrides,
    { entityType: "flavorText", id: "906", field: "text" },
    "Traduit.",
  );
  assert.equal(next.flavorText["907"].text, "Intact.");
  assert.equal(next.abilities["x"].name, `${STUB_PREFIX}B`);
});
