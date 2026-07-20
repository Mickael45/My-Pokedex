import {
  NORMAL,
  FIRE,
  WATER,
  ELECTRIC,
  GRASS,
  ICE,
  FIGHTING,
  POISON,
  GROUND,
  FLYING,
  PSYCHIC,
  BUG,
  ROCK,
  GHOST,
  DRAGON,
  DARK,
  STEEL,
  FAIRY,
} from "../constants/Types";

import {
  NO_EFFECT,
  NOT_EFFECTIVE_AT_ALL,
  NOT_VERY_EFFECTIVE,
  NORMAL_EFFECTIVENESS,
  VERY_EFFECTIVE,
  SUPER_EFFECTIVE,
} from "../constants/EffectivenessTypes";

import { ZERO, QUARTER, HALF, ONE, TWO, FOUR } from "../constants/DamageFactors";

declare global {
  export type PokemonType =
    | typeof NORMAL
    | typeof FIRE
    | typeof WATER
    | typeof ELECTRIC
    | typeof GRASS
    | typeof ICE
    | typeof FIGHTING
    | typeof POISON
    | typeof GROUND
    | typeof FLYING
    | typeof PSYCHIC
    | typeof BUG
    | typeof ROCK
    | typeof GHOST
    | typeof DRAGON
    | typeof DARK
    | typeof STEEL
    | typeof FAIRY;

  export type PokemonEffectivenessType =
    | typeof NO_EFFECT
    | typeof NOT_EFFECTIVE_AT_ALL
    | typeof NOT_VERY_EFFECTIVE
    | typeof NORMAL_EFFECTIVENESS
    | typeof VERY_EFFECTIVE
    | typeof SUPER_EFFECTIVE;

  export type DamageFactor = ZERO | QUARTER | HALF | ONE | TWO | FOUR;

  export type Weakness = {
    type: PokemonType;
    factor: DamageFactor;
  };

  export type PokemonInteractionTypeHash = {
    [key: PokemonType]: PokemonEffectivenessType;
  };
  export interface IPokemonInteractionTypes {
    key: PokemonType | string;
    values: PokemonInteractionTypeHash[];
  }

  export type InteractionType = {
    type: PokemonType;
    typeInteractions: PokemonInteractionType[];
  };
  export interface PokemonInteractionType {
    type: PokemonType;
    effectiveness: DamageFactor;
  }
  export interface IPokemonStat {
    label: string;
    value: number;
  }
  // Compact [hp, attack, defense, speed] the list cards render, kept tiny so the
  // SSG payload for all 1025 Pokemon stays small.
  export type PokemonCardStats = [number, number, number, number];
  export interface IEvolvesFrom {
    name: string;
    // Image URLs are derived from `id` on the client (see cardImageUrls) rather
    // than shipped, to keep the ~1025-card SSG list payload small.
    id: number;
  }
  export interface ITypeEffectiveness {
    type: string;
    factor: DamageFactor;
  }
  export interface IBasicPokemon {
    id: number;
    name: string;
    frName?: string;
    slug?: string;
    types: string;
    // NOTE: the list-card sprite URLs (pixel + basic-HD) are NOT stored here.
    // They are a pure function of `id` (see cardImageUrls) and are derived in the
    // card components, so the SSG list payload for all ~1025 Pokemon stays small.
    stats: PokemonCardStats;
    evolvesFrom?: IEvolvesFrom | null;
  }
  // A stage in the evolution chain plus the level it evolves at (null for the
  // base form or non-level evolutions).
  export type IEvolutionStage = IBasicPokemon & {
    level: number | null;
    frName?: string;
    slug?: string;
  };

  export type IFullPokemon = Omit<IBasicPokemon, "stats"> & {
    // The detail page ships a single Pokemon (not a 1025-item list), so it keeps
    // its resolved sprite URLs — the hero uses FULL_PIC resolution and the OG tag
    // reuses hdImageUrl. Set explicitly by formatToFullPokemon.
    pixelImageUrl: string;
    hdImageUrl: string;
    stats: IPokemonStat[];
    weaknesses: Weakness[] | [];
    defensiveEffectiveness: ITypeEffectiveness[];
    offensiveEffectiveness: ITypeEffectiveness[];
    evolutionChain: IEvolutionStage[] | [];
    abilities: string[] | [];
    description: string;
    height: number;
    weight: number;
    category: string;
    frName?: string;
    frCategory?: string;
    frDescription?: string;
    frAbilities?: string[];
  };
}
