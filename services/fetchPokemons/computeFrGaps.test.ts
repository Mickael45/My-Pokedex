// services/fetchPokemons/computeFrGaps.test.ts
import { describe, it, expect } from "vitest";
import { computeFrGaps } from "./fetchFrData";

const dataset = {
  species: [
    {
      id: 1,
      names: [{ language: { name: "fr" }, name: "Bulbizarre" }, { language: { name: "en" }, name: "Bulbasaur" }],
      genera: [{ language: { name: "fr" }, genus: "Pokémon Graine" }, { language: { name: "en" }, genus: "Seed Pokémon" }],
      flavor_text_entries: [{ language: { name: "en" }, version: { name: "red" }, flavor_text: "A strange seed." }], // no fr → gap
    },
  ],
  types: [{ name: "grass", names: [{ language: { name: "fr" }, name: "Plante" }] }], // ok
  abilities: [{ name: "overgrow", names: [{ language: { name: "en" }, name: "Overgrow" }] }], // no fr → gap
};

describe("computeFrGaps", () => {
  it("flags missing fr flavor text with the English reference", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps).toContainEqual({ entityType: "flavorText", id: "1", field: "text", englishRef: "A strange seed." });
  });
  it("flags a missing fr ability name with the English reference", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps).toContainEqual({ entityType: "abilities", id: "overgrow", field: "name", englishRef: "Overgrow" });
  });
  it("does NOT flag fields the API covers", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps.find((g) => g.entityType === "names")).toBeUndefined();
    expect(gaps.find((g) => g.entityType === "typeLabels")).toBeUndefined();
  });
  it("does NOT flag a gap already filled in overrides", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: { "1": { text: "Rempli." } }, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps.find((g) => g.entityType === "flavorText")).toBeUndefined();
  });
});
