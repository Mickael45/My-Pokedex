// constants/Generations.ts
// Maps a National-Dex id to its game generation and formats the French ordinal
// used in the FR GEO opener. Pure and client-safe: no fetches, no build-time
// data — the nine ranges are fixed by the National Dex itself.

// Upper-inclusive id bound of each generation, gen 1 → gen 9.
const GENERATION_UPPER_BOUNDS = [151, 251, 386, 493, 649, 721, 809, 905, 1025];

// Given a National-Dex id, return its generation (1-9). Ids beyond the last
// known bound fall back to the highest generation.
export const generationFromId = (id: number): number => {
  const index = GENERATION_UPPER_BOUNDS.findIndex((bound) => id <= bound);
  return index === -1 ? GENERATION_UPPER_BOUNDS.length : index + 1;
};

// French ordinal for a generation number: "1re" (feminine, agrees with the
// elided "génération") for the first, "Ne" for the rest.
export const frGenerationOrdinal = (gen: number): string => (gen === 1 ? "1re" : `${gen}e`);
