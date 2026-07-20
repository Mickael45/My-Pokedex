import { describe, it, expect } from "vitest";
import {
  extractPokemonNameFr,
  extractPokemonDescriptionFr,
  extractPokemonCategoryFr,
} from "./extractorsFr";

const species = {
  names: [
    { language: { name: "en" }, name: "Bulbasaur" },
    { language: { name: "fr" }, name: "Bulbizarre" },
  ],
  genera: [
    { language: { name: "en" }, genus: "Seed Pokémon" },
    { language: { name: "fr" }, genus: "Pokémon Graine" },
  ],
  flavor_text_entries: [
    { language: { name: "en" }, version: { name: "red" }, flavor_text: "A strange seed." },
    { language: { name: "fr" }, version: { name: "black" }, flavor_text: "Vieille\fentrée." },
    { language: { name: "fr" }, version: { name: "scarlet" }, flavor_text: "Nouvelle\nentrée FR." },
  ],
} as const;

describe("extractPokemonNameFr", () => {
  it("returns the fr name", () => {
    expect(extractPokemonNameFr(species)).toBe("Bulbizarre");
  });
  it("returns null when no fr name exists", () => {
    expect(extractPokemonNameFr({ ...species, names: [{ language: { name: "en" }, name: "X" }] })).toBeNull();
  });
});

describe("extractPokemonCategoryFr", () => {
  it("returns the fr genus with the 'Pokémon' word stripped and trimmed", () => {
    expect(extractPokemonCategoryFr(species)).toBe("Graine");
  });
  it("returns null when no fr genus exists", () => {
    expect(extractPokemonCategoryFr({ ...species, genera: [{ language: { name: "en" }, genus: "Seed Pokémon" }] })).toBeNull();
  });
});

describe("extractPokemonDescriptionFr", () => {
  it("picks the most recent fr version and normalizes whitespace/formfeeds", () => {
    // scarlet outranks black in VERSION_RECENCY
    expect(extractPokemonDescriptionFr(species)).toBe("Nouvelle entrée FR.");
  });
  it("falls back to the last fr entry when the version is unknown to the ranking", () => {
    const s = {
      ...species,
      flavor_text_entries: [
        { language: { name: "fr" }, version: { name: "made-up-a" }, flavor_text: "Un." },
        { language: { name: "fr" }, version: { name: "made-up-b" }, flavor_text: "Deux." },
      ],
    };
    expect(extractPokemonDescriptionFr(s)).toBe("Deux.");
  });
  it("returns null when no fr flavor text exists", () => {
    expect(extractPokemonDescriptionFr({ ...species, flavor_text_entries: [{ language: { name: "en" }, version: { name: "red" }, flavor_text: "x" }] })).toBeNull();
  });
});
