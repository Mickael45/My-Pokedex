import * as Types from "../constants/Types";
import { FR_TYPE_LABELS } from "../constants/FrTypeLabels";
import { slugify } from "./slugify";

const ALL_TYPES: string[] = Object.values(Types);

export const frTypeSlug = (engType: string): string => slugify(FR_TYPE_LABELS[engType]);

// Build the reverse map (french slug → english type) ONCE over the 18 types.
const FR_SLUG_TO_ENG: Record<string, string> = ALL_TYPES.reduce<Record<string, string>>(
  (acc, engType) => {
    acc[frTypeSlug(engType)] = engType;
    return acc;
  },
  {}
);

export const engTypeFromFrSlug = (frSlug: string): string | null =>
  FR_SLUG_TO_ENG[frSlug] ?? null;

export const toFrTypeSlug = (engTypes: string[]): string =>
  [...engTypes].map(frTypeSlug).sort().join("-");

export const parseFrTypeSlug = (frSlug: string): string[] => {
  const parts = frSlug.split("-");
  if (parts.length < 1 || parts.length > 2) return [];
  const engTypes = parts.map(engTypeFromFrSlug);
  if (engTypes.some((t) => t === null)) return [];
  return (engTypes as string[]).sort();
};

export const allFrTypeSlugs = (): string[] => {
  const singles = ALL_TYPES.map((t) => frTypeSlug(t));
  const pairs: string[] = [];
  for (let i = 0; i < ALL_TYPES.length; i++) {
    for (let j = i + 1; j < ALL_TYPES.length; j++) {
      pairs.push(toFrTypeSlug([ALL_TYPES[i], ALL_TYPES[j]]));
    }
  }
  return [...singles, ...pairs];
};
