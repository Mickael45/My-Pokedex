// Manual slug disambiguations by national-dex id. Only needed where two official
// French names collapse to the same accent-stripped slug. Nidoran ♀ (29) and
// ♂ (32) are the sole base-dex collision; the build-time collision guard in
// buildSlugIdMap fails loudly if a future data refresh introduces another.
export const FR_SLUG_OVERRIDES: Record<number, string> = {
  29: "nidoran-f",
  32: "nidoran-m",
};
