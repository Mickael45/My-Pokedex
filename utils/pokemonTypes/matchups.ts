import * as Types from "../../constants/Types";
import { incomingFactor, bestDamage } from "./effectiveness";

export interface MatchupRow {
  type: string;
  mult: number;
}

const ALL_TYPES = Object.values(Types);

// Non-neutral matchups only, strongest first (mirrors the old in-page logic).
const rows = (score: (type: string) => number): MatchupRow[] =>
  ALL_TYPES.map((type) => ({ type, mult: score(type) }))
    .filter((row) => row.mult !== 1)
    .sort((a, b) => b.mult - a.mult);

export const defendingRows = (selected: string[]): MatchupRow[] =>
  rows((type) => incomingFactor(selected, type));

export const attackingRows = (selected: string[]): MatchupRow[] =>
  rows((type) => bestDamage(selected, [type]));

export interface MatchupSummary {
  weakTo: string[];
  resists: string[];
  immuneTo: string[];
  strongAgainst: string[];
}

// Plain-language buckets for on-page prose: defensive multipliers split into
// weak (>1x), resisted (between 0 and 1) and immune (0x); offensive coverage is
// the best move landing >1x.
export const matchupSummary = (selected: string[]): MatchupSummary => {
  const def = defendingRows(selected);
  const atk = attackingRows(selected);
  return {
    weakTo: def.filter((row) => row.mult > 1).map((row) => row.type),
    resists: def.filter((row) => row.mult > 0 && row.mult < 1).map((row) => row.type),
    immuneTo: def.filter((row) => row.mult === 0).map((row) => row.type),
    strongAgainst: atk.filter((row) => row.mult > 1).map((row) => row.type),
  };
};
