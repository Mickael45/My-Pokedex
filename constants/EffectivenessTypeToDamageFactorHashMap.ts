import {
  NO_EFFECT,
  NOT_EFFECTIVE_AT_ALL,
  NOT_VERY_EFFECTIVE,
  NORMAL_EFFECTIVENESS,
  VERY_EFFECTIVE,
  SUPER_EFFECTIVE,
} from "./EffectivenessTypes";
import { ZERO, QUARTER, HALF, ONE, TWO, FOUR } from "./DamageFactors";

type EffectivenessTypeToDamageFactorHashMapType = {
  [key in PokemonEffectivenessType]: DamageFactor;
};

const EffectivenessTypeToDamageFactorHashMap: EffectivenessTypeToDamageFactorHashMapType = {
  [NO_EFFECT]: ZERO,
  [NOT_EFFECTIVE_AT_ALL]: QUARTER,
  [NOT_VERY_EFFECTIVE]: HALF,
  [NORMAL_EFFECTIVENESS]: ONE,
  [VERY_EFFECTIVE]: TWO,
  [SUPER_EFFECTIVE]: FOUR,
};

export default EffectivenessTypeToDamageFactorHashMap;
