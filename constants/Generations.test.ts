// constants/Generations.test.ts
import { describe, it, expect } from "vitest";
import { generationFromId, frGenerationOrdinal } from "./Generations";

describe("generationFromId", () => {
  it("maps the lower and upper bound of each National-Dex range", () => {
    const cases: Array<[number, number]> = [
      [1, 1],
      [151, 1],
      [152, 2],
      [251, 2],
      [252, 3],
      [386, 3],
      [387, 4],
      [493, 4],
      [494, 5],
      [649, 5],
      [650, 6],
      [721, 6],
      [722, 7],
      [809, 7],
      [810, 8],
      [905, 8],
      [906, 9],
      [1025, 9],
    ];
    for (const [id, gen] of cases) {
      expect(generationFromId(id)).toBe(gen);
    }
  });

  it("flips generation exactly at the 151/152 boundary", () => {
    expect(generationFromId(151)).toBe(1);
    expect(generationFromId(152)).toBe(2);
  });

  it("flips generation exactly at the 905/906 boundary", () => {
    expect(generationFromId(905)).toBe(8);
    expect(generationFromId(906)).toBe(9);
  });
});

describe("frGenerationOrdinal", () => {
  it("uses the feminine 1re for generation 1", () => {
    expect(frGenerationOrdinal(1)).toBe("1re");
  });

  it("uses Ne for generations 2 through 9", () => {
    expect(frGenerationOrdinal(2)).toBe("2e");
    expect(frGenerationOrdinal(3)).toBe("3e");
    expect(frGenerationOrdinal(9)).toBe("9e");
  });
});
