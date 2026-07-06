import { FR_SLUG_OVERRIDES } from "../constants/FrSlugOverrides";

export const slugify = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics (U+0300–U+036F)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumerics → single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

export const buildSlugIdMap = (
  entries: Array<{ id: number; frName: string }>
): { slugToId: Record<string, number>; idToSlug: Record<number, string> } => {
  const slugToId: Record<string, number> = {};
  const idToSlug: Record<number, string> = {};
  const collisions: string[] = [];

  for (const { id, frName } of entries) {
    const slug = FR_SLUG_OVERRIDES[id] ?? slugify(frName);
    if (slug in slugToId && slugToId[slug] !== id) {
      collisions.push(`"${slug}" ← id ${slugToId[slug]} and id ${id} ("${frName}")`);
      continue;
    }
    slugToId[slug] = id;
    idToSlug[id] = slug;
  }

  if (collisions.length) {
    throw new Error(
      `Slug collision(s) detected — add disambiguations to constants/FrSlugOverrides.ts:\n  ` +
        collisions.join("\n  ")
    );
  }

  return { slugToId, idToSlug };
};
