import { describe, it, expect } from "vitest";
import { mapWithConcurrency } from "./mapWithConcurrency";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("mapWithConcurrency", () => {
  it("preserves input order despite shuffled per-item delays", async () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7];
    // Later items resolve sooner, so order can only be preserved by index, not by
    // completion time.
    const results = await mapWithConcurrency(
      items,
      async (item) => {
        await wait((items.length - item) * 5);
        return item * 10;
      },
      3
    );

    expect(results).toEqual(items.map((i) => i * 10));
  });

  it("never exceeds `limit` concurrent in-flight calls", async () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const limit = 7;
    let inFlight = 0;
    let maxInFlight = 0;

    await mapWithConcurrency(
      items,
      async () => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await wait(3);
        inFlight--;
      },
      limit
    );

    expect(maxInFlight).toBeLessThanOrEqual(limit);
    // Sanity: with 50 items it should actually reach the cap.
    expect(maxInFlight).toBe(limit);
  });

  it("returns all results", async () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    const results = await mapWithConcurrency(items, async (item) => item + 1, 5);
    expect(results).toHaveLength(20);
    expect(results).toEqual(items.map((i) => i + 1));
  });

  it("works when limit >= items.length", async () => {
    const items = [1, 2, 3];
    let maxInFlight = 0;
    let inFlight = 0;
    const results = await mapWithConcurrency(
      items,
      async (item) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await wait(2);
        inFlight--;
        return item * 2;
      },
      100
    );
    expect(results).toEqual([2, 4, 6]);
    expect(maxInFlight).toBeLessThanOrEqual(items.length);
  });

  it("works with limit = 1 (fully serial, order preserved)", async () => {
    const items = [3, 1, 2];
    let inFlight = 0;
    let maxInFlight = 0;
    const results = await mapWithConcurrency(
      items,
      async (item) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await wait(2);
        inFlight--;
        return item;
      },
      1
    );
    expect(results).toEqual([3, 1, 2]);
    expect(maxInFlight).toBe(1);
  });

  it("propagates a rejection", async () => {
    const items = [1, 2, 3, 4];
    await expect(
      mapWithConcurrency(
        items,
        async (item) => {
          if (item === 3) throw new Error("boom");
          await wait(1);
          return item;
        },
        2
      )
    ).rejects.toThrow("boom");
  });

  it("handles an empty input", async () => {
    const results = await mapWithConcurrency<number, number>([], async (item) => item, 5);
    expect(results).toEqual([]);
  });
});
