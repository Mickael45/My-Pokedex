import { describe, it, expect } from "vitest";
import { UI_STRINGS } from "./uiStrings";

describe("UI_STRINGS", () => {
  it("defines identical key sets for en and fr", () => {
    expect(Object.keys(UI_STRINGS.fr).sort()).toEqual(Object.keys(UI_STRINGS.en).sort());
  });
  it("has no empty french values", () => {
    for (const [k, v] of Object.entries(UI_STRINGS.fr)) expect(v, k).toBeTruthy();
  });
});
