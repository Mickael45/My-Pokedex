import { ONE } from "../../constants/DamageFactors";
import EffectivenessTypeToDamageFactorHashMap from "../../constants/EffectivenessTypeToDamageFactorHashMap";

const isInteractionsEffectivenessesDifferenThanOne = (values: [PokemonType, PokemonEffectivenessType]) =>
  convertEffectivenessStringToDamageRatio(values[1]) !== ONE;

export const convertEffectivenessStringToDamageRatio = (effectiveness: PokemonEffectivenessType): DamageFactor =>
  EffectivenessTypeToDamageFactorHashMap[effectiveness];

export const convertHashMapToArray = (hashMap: IPokemonInteractionTypes) =>
  Object.entries(hashMap)[0] as [PokemonType, PokemonEffectivenessType];

export const convertInteractionTypeHashMapToArray = (
  interactionTypesHashMap: IPokemonInteractionTypes[]
): PokemonInteractionType[] =>
  interactionTypesHashMap
    .map(convertHashMapToArray)
    .filter(isInteractionsEffectivenessesDifferenThanOne)
    .map((values: [PokemonType, PokemonEffectivenessType]) => ({
      type: values[0],
      effectiveness: convertEffectivenessStringToDamageRatio(values[1]),
    }))
    .sort((a, b) => b.effectiveness - a.effectiveness);

export const convertTypeInteractionArrayToObj = (arr: any): InteractionType => ({
  type: arr[0],
  typeInteractions: convertInteractionTypeHashMapToArray(arr[1]),
});
