import { describe, it, expect } from "vitest";
import { frFormatList, frMatchupIntro } from "./frMatchupIntro";

describe("frFormatList", () => {
  it("returns empty string for empty list", () => {
    expect(frFormatList([])).toBe("");
  });
  it("returns the single item unchanged", () => {
    expect(frFormatList(["Feu"])).toBe("Feu");
  });
  it("joins two items with 'et'", () => {
    expect(frFormatList(["Feu", "Eau"])).toBe("Feu et Eau");
  });
  it("joins three items with commas and 'et'", () => {
    expect(frFormatList(["Feu", "Eau", "Plante"])).toBe("Feu, Eau et Plante");
  });
});

const identityLabel = (t: string) => t;
const frLabel = (t: string) =>
  (({ fire: "Feu", water: "Eau", grass: "Plante", ground: "Sol", rock: "Roche" }) as Record<string, string>)[t] ?? t;

describe("frMatchupIntro", () => {
  it("builds the French title from the label", () => {
    const { title } = frMatchupIntro(
      "Feu",
      { weakTo: [], resists: [], immuneTo: [], strongAgainst: [] },
      identityLabel
    );
    expect(title).toBe("Feu — Faiblesses & Résistances");
  });

  it("applies the French type labels and connectors in all three sentences", () => {
    const { paragraph } = frMatchupIntro(
      "Feu",
      {
        weakTo: ["water", "ground", "rock"],
        resists: ["grass"],
        immuneTo: [],
        strongAgainst: ["grass"],
      },
      frLabel
    );
    expect(paragraph).toBe(
      "Les Pokémon Feu subissent des dégâts super efficaces de la part des types Eau, Sol et Roche. Ils résistent à Plante. En attaque, leur meilleure couverture est contre Plante."
    );
  });

  it("combines resistances and immunities with 'et'", () => {
    const { paragraph } = frMatchupIntro(
      "Sol",
      {
        weakTo: ["water"],
        resists: ["rock"],
        immuneTo: ["electric"],
        strongAgainst: ["fire"],
      },
      (t) => t
    );
    expect(paragraph).toContain("Ils résistent à rock et sont immunisés contre electric.");
  });

  it("uses the no-weakness branch when there are no weaknesses", () => {
    const { paragraph } = frMatchupIntro(
      "Feu",
      { weakTo: [], resists: ["grass"], immuneTo: [], strongAgainst: ["grass"] },
      frLabel
    );
    expect(paragraph).toContain("Les Pokémon Feu n'ont pas de faiblesse de type commune.");
  });

  it("uses the no-coverage branch when there is no super-effective coverage", () => {
    const { paragraph } = frMatchupIntro(
      "Feu",
      { weakTo: ["water"], resists: [], immuneTo: [], strongAgainst: [] },
      frLabel
    );
    expect(paragraph).toContain("En attaque, ils n'ont pas de couverture super efficace.");
  });

  it("omits the guard sentence entirely when there are no resistances or immunities", () => {
    const { paragraph } = frMatchupIntro(
      "Feu",
      { weakTo: ["water"], resists: [], immuneTo: [], strongAgainst: [] },
      frLabel
    );
    expect(paragraph).toBe(
      "Les Pokémon Feu subissent des dégâts super efficaces de la part des types Eau. En attaque, ils n'ont pas de couverture super efficace."
    );
  });
});
