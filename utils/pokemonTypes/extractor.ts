export const extractEffectiveness = (value: PokemonInteractionTypeHash): PokemonEffectivenessType =>
  Object.values<PokemonEffectivenessType>(value)[0];
