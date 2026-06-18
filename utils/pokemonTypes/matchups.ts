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
