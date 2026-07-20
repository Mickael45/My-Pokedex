// constants/FrTypeLabels.test.ts
import { describe, it, expect } from "vitest";
import { FR_TYPE_LABELS } from "./FrTypeLabels";

const TYPE_SLUGS = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

describe("FR_TYPE_LABELS", () => {
  it("has a non-empty French label for each of the 18 type slugs", () => {
    for (const slug of TYPE_SLUGS) {
      expect(FR_TYPE_LABELS[slug]).toBeTruthy();
    }
  });
});
