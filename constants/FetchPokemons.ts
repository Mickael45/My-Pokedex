export const MAX_POKEMON_ID_ALLOWED = 1025;
// Cap simultaneous build-time PokéAPI requests so a full static export (~1025-item
// fan-outs) doesn't exhaust connections and fail with "fetch failed". NOTE: this is
// PER worker process, and Next runs several (see next.config `experimental.cpus`), so
// true peak ≈ cpus × this. Kept low so cpus(2) × 8 = 16 concurrent stays polite to
// pokeapi.co. Raising it re-introduces ECONNREFUSED/ETIMEDOUT at export scale.
export const FETCH_CONCURRENCY = 8;
export const POKE_API_URL = "https://pokeapi.co/api/v2/";
export const POKEMON_BASIC_PIC_URL =
  "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
export const POKEMON_FULL_PIC_URL =
  "https://assets.pokemon.com/assets/cms2/img/pokedex/full/";
export const POKEMON_PIXEL_PIC_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
export const BASIC_PIC = "basic";
export const FULL_PIC = "full";
export const PIXELATED = "pixel";
