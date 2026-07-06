import { describe, it, expect } from "vitest";
import { resolveTypeLabels } from "./typeLabels";
const raw = [
  { name: "grass", names: [{ language: { name: "fr" }, name: "Plante" }] },
  { name: "fire", names: [{ language: { name: "en" }, name: "Fire" }] }, // no fr → needs override
];
describe("resolveTypeLabels", () => {
  it("uses PokéAPI fr, falls back to overrides", () => {
    const labels = resolveTypeLabels(raw, { typeLabels: { fire: { label: "Feu" } } } as any);
    expect(labels).toEqual({ grass: "Plante", fire: "Feu" });
  });
  it("throws when a type has neither fr nor override", () => {
    expect(() => resolveTypeLabels(raw, { typeLabels: {} } as any)).toThrow();
  });
});
