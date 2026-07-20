// utils/fr/geoIntro.test.ts
import { describe, it, expect } from "vitest";
import { geoIntroFr } from "./geoIntro";

describe("geoIntroFr", () => {
  it("builds a mono-type opening sentence", () => {
    expect(
      geoIntroFr({ frName: "Pikachu", enName: "Pikachu", frTypes: ["Électrik"], gen: 1 }),
    ).toBe("Pikachu (anglais : Pikachu) est un Pokémon de type Électrik de la 1re génération.");
  });

  it("joins dual types with a slash", () => {
    expect(
      geoIntroFr({ frName: "Bulbizarre", enName: "Bulbasaur", frTypes: ["Plante", "Poison"], gen: 1 }),
    ).toBe("Bulbizarre (anglais : Bulbasaur) est un Pokémon de type Plante/Poison de la 1re génération.");
  });

  it("surfaces the English name via the (anglais : …) clause", () => {
    const sentence = geoIntroFr({
      frName: "Roucool",
      enName: "Pidgey",
      frTypes: ["Normal", "Vol"],
      gen: 1,
    });
    expect(sentence).toContain("Pidgey");
    expect(sentence).toContain("(anglais : Pidgey)");
  });

  it("capitalizes a lowercase English name in the (anglais : …) clause", () => {
    expect(
      geoIntroFr({ frName: "Bulbizarre", enName: "bulbasaur", frTypes: ["Plante", "Poison"], gen: 1 }),
    ).toBe("Bulbizarre (anglais : Bulbasaur) est un Pokémon de type Plante/Poison de la 1re génération.");
  });

  it("uses the ordinal for later generations", () => {
    expect(
      geoIntroFr({ frName: "Toxizap", enName: "Toxel", frTypes: ["Électrik", "Poison"], gen: 8 }),
    ).toBe("Toxizap (anglais : Toxel) est un Pokémon de type Électrik/Poison de la 8e génération.");
  });
});
