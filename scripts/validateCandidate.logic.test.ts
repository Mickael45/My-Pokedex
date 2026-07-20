import { describe, it, expect } from "vitest";
import { classifyValidation, OK, HOLD, HARD_FAIL } from "./validateCandidate.logic";

const base = {
  currentCount: 1025,
  lastKnown: 1025,
  snapshotEntries: 4921,
  frGapCount: 0,
  missingImageCount: 0,
  nullFieldRate: 0,
};

describe("classifyValidation", () => {
  it("passes when everything is present and counts hold", () => {
    expect(classifyValidation(base).code).toBe(OK);
  });

  it("hard-fails an empty candidate (fetch broke)", () => {
    expect(classifyValidation({ ...base, currentCount: 0, snapshotEntries: 0 }).code).toBe(HARD_FAIL);
  });

  it("hard-fails when required fields are null above the threshold", () => {
    expect(classifyValidation({ ...base, nullFieldRate: 0.2 }).code).toBe(HARD_FAIL);
  });

  it("HOLDs (serve last-good) when the dex count shrank — never a real event", () => {
    const r = classifyValidation({ ...base, currentCount: 1000, lastKnown: 1025 });
    expect(r.code).toBe(HOLD);
    expect(r.reasons.join(" ")).toMatch(/shrank|last-good/i);
  });

  it("does NOT hold when the dex grows (a real new-game drop, any size)", () => {
    expect(classifyValidation({ ...base, currentCount: 1400, lastKnown: 1025 }).code).toBe(OK);
  });

  it("HOLDs when new species await FR translation", () => {
    const r = classifyValidation({ ...base, frGapCount: 3 });
    expect(r.code).toBe(HOLD);
    expect(r.reasons.join(" ")).toMatch(/french|fr|translation/i);
  });

  it("HOLDs when species are missing images", () => {
    expect(classifyValidation({ ...base, missingImageCount: 2 }).code).toBe(HOLD);
  });

  it("first run (no last-known count) does not trip the shrink guard", () => {
    expect(classifyValidation({ ...base, lastKnown: null }).code).toBe(OK);
  });

  it("a hard failure takes precedence over a hold", () => {
    expect(classifyValidation({ ...base, snapshotEntries: 0, currentCount: 0, frGapCount: 9 }).code).toBe(HARD_FAIL);
  });
});
