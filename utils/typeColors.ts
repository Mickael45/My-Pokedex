import pokemonTypesColor from "../constants/TypesColor.json";

type HexMap = Record<string, string>;

const PALETTE = pokemonTypesColor as HexMap;
const FALLBACK = "#888888";

/** The raw, vivid type colour (used for rings, glows and accents). */
export const getTypeColor = (type: string): string => PALETTE[type] ?? FALLBACK;

const toRgb = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};

const toHex = (rgb: number[]): string =>
  `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

const channelLuminance = (v: number): number => {
  const x = v / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};

const luminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);

// Contrast of white (#fff, luminance 1) against the given colour.
const contrastOnWhite = (rgb: [number, number, number]): number => 1.05 / (luminance(rgb) + 0.05);

const mixTowardBlack = (rgb: [number, number, number], t: number): [number, number, number] =>
  rgb.map((v) => v * (1 - t)) as [number, number, number];

// Aim a hair above the 4.5:1 AA floor so rounding never drops a type below it.
const AA_TARGET = 4.6;

const chipColorCache: Record<string, string> = {};

/**
 * A deep, AA-safe fill for a type chip: the vivid type colour darkened only as
 * much as needed for white text/icons to clear WCAG AA (≥ 4.5:1). Already-dark
 * types barely change; bright types (electric, grass, …) deepen into jewel tones.
 */
export const getTypeChipColor = (type: string): string => {
  const cached = chipColorCache[type];
  if (cached) {
    return cached;
  }

  const base = toRgb(getTypeColor(type));
  let t = 0;
  while (contrastOnWhite(mixTowardBlack(base, t)) < AA_TARGET && t < 1) {
    t += 0.02;
  }

  const result = toHex(mixTowardBlack(base, t));
  chipColorCache[type] = result;
  return result;
};
