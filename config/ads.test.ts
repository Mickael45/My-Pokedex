import { describe, it, expect } from "vitest";
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS } from "./ads";

describe("ads config", () => {
  it("ships with ads disabled", () => {
    expect(ADS_ENABLED).toBe(false);
  });

  it("uses the correct publisher id", () => {
    expect(ADSENSE_CLIENT).toBe("ca-pub-3950888851778991");
  });

  it("reserves a positive height for every slot and has no live slot ids yet", () => {
    const names = Object.keys(AD_SLOTS);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(AD_SLOTS[name as keyof typeof AD_SLOTS].height).toBeGreaterThan(0);
      expect(AD_SLOTS[name as keyof typeof AD_SLOTS].slot).toBe("");
    }
  });
});
