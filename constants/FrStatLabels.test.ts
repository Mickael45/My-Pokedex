// constants/FrStatLabels.test.ts
import { describe, it, expect } from "vitest";
import { FR_STAT_LABELS } from "./FrStatLabels";

describe("FR_STAT_LABELS", () => {
  it("covers every English stat label emitted by extractStatsFromPokemon", () => {
    for (const key of ["Hp", "Attack", "Defense", "Speed", "Spe. Att.", "Spe. Def."]) {
      expect(FR_STAT_LABELS[key]).toBeTruthy();
    }
  });
});
