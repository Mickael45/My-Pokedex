// Pure classification for the orchestrator validateCmd. Maps candidate facts to an
// exit code the swarm understands:
//   0  OK        → promote, build, deploy
//   3  HOLD      → benign: valid but not ready (serve last-good, warn in digest)
//   1  HARD FAIL → data is broken (quarantine, red in digest)
// See bin/run-site.sh: exit 3 is the soft-hold signal.

export const OK = 0;
export const HARD_FAIL = 1;
export const HOLD = 3;

export interface ValidationInput {
  currentCount: number; // recordCount from the candidate manifest (dynamic dex size)
  lastKnown: number | null; // recordCount of the last promoted snapshot (null on first run)
  snapshotEntries: number; // URL entries captured in the candidate snapshot
  frGapCount: number; // computeFrGaps(...).length against the candidate
  missingImageCount: number; // species missing one or more image files
  nullFieldRate: number; // 0..1 fraction of sampled required fields that were null
}

export interface ValidationResult {
  code: typeof OK | typeof HARD_FAIL | typeof HOLD;
  reasons: string[];
}

export const classifyValidation = (
  input: ValidationInput,
  opts: { maxNullRate?: number } = {}
): ValidationResult => {
  const maxNullRate = opts.maxNullRate ?? 0.02;

  const hardFails: string[] = [];
  const holds: string[] = [];

  // --- hard failures: the fetch/data is broken ---
  if (input.currentCount <= 0 || input.snapshotEntries === 0) {
    hardFails.push("empty candidate — the fetch produced no data");
  }
  if (input.nullFieldRate > maxNullRate) {
    hardFails.push(
      `required fields null in ${(input.nullFieldRate * 100).toFixed(1)}% of samples (> ${(maxNullRate * 100).toFixed(0)}%)`
    );
  }

  // --- benign holds: valid data, deliberately not ready to ship ---
  // The national dex never shrinks, so a smaller count can only be an API glitch.
  // No upper guard: a new-game drop of hundreds at once is exactly what we want to ship.
  if (input.lastKnown !== null && input.currentCount < input.lastKnown) {
    holds.push(
      `dex count shrank ${input.lastKnown} → ${input.currentCount} — serving last-good`
    );
  }
  if (input.frGapCount > 0) {
    holds.push(`${input.frGapCount} field(s) awaiting French translation`);
  }
  if (input.missingImageCount > 0) {
    holds.push(`${input.missingImageCount} species missing image assets`);
  }

  if (hardFails.length) return { code: HARD_FAIL, reasons: hardFails };
  if (holds.length) return { code: HOLD, reasons: holds };
  return { code: OK, reasons: [] };
};
