import typeInteractionsData from "../../constants/TypeInteractions.json";
import EffectivenessTypeToDamageFactorHashMap from "../../constants/EffectivenessTypeToDamageFactorHashMap";

type InteractionEntry = { key: string; values: Array<Record<string, string>> };

// FACTOR[defendingType][attackingType] = incoming damage multiplier.
// Built once from the 18 single-type rows; every dual-type matchup is just the
// product of its two single-type factors, so we never need the combo rows.
const FACTOR: Record<string, Record<string, number>> = {};

(typeInteractionsData as unknown as InteractionEntry[][]).flat().forEach((entry) => {
  if (entry.key.includes(",")) return; // single-type rows only

  const row: Record<string, number> = {};
  entry.values.forEach((pair) => {
    const [attacker, effectiveness] = Object.entries(pair)[0];
    row[attacker] = EffectivenessTypeToDamageFactorHashMap[effectiveness as PokemonEffectivenessType];
  });
  FACTOR[entry.key] = row;
});

// Multiplier a single attacking type deals to a (possibly dual) defender.
export const incomingFactor = (defenders: string[], attacker: string): number =>
  defenders.reduce((mult, defender) => mult * (FACTOR[defender]?.[attacker] ?? 1), 1);

// Best multiplier an attacker's typing lands on a defender. A move is always
// single-typed, so the strongest of the attacker's types wins (STAB coverage).
export const bestDamage = (attackerTypes: string[], defenderTypes: string[]): number =>
  Math.max(...attackerTypes.map((attacker) => incomingFactor(defenderTypes, attacker)));

// Tiers worth surfacing, ordered most-extreme first (neutral ×1 is omitted).
export const DAMAGE_TIERS = [4, 2, 0.5, 0.25, 0];
