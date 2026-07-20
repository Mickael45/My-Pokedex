import * as Types from "../constants/Types";

const ALL_TYPES: string[] = Object.values(Types);

export const toTypeSlug = (types: string[]): string =>
  [...types].map((type) => type.toLowerCase()).sort().join("-");

export const parseTypeSlug = (slug: string): string[] => {
  const parts = slug.split("-");
  const valid = parts.length >= 1 && parts.length <= 2 && parts.every((part) => ALL_TYPES.includes(part));
  return valid ? [...parts].sort() : [];
};

export const allTypeSlugs = (): string[] => {
  const pairs: string[] = [];
  for (let i = 0; i < ALL_TYPES.length; i++) {
    for (let j = i + 1; j < ALL_TYPES.length; j++) {
      pairs.push(toTypeSlug([ALL_TYPES[i], ALL_TYPES[j]]));
    }
  }
  return [...ALL_TYPES, ...pairs];
};
