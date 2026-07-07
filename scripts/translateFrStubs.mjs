// scripts/translateFrStubs.mjs
// Interactive CLI that lets the site owner translate the scaffolded French
// `__STUB__` entries in locales/fr-overrides.json. The tool ONLY captures the
// owner's typed input — it never translates anything itself and never touches
// existing non-stub values. Progress is written to disk after every entry so a
// crash or Ctrl-C never loses work.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { STUB_PREFIX } from "./scaffoldFrStubs.mjs";
import { POKE_API_URL } from "../constants/FetchPokemons.ts";

// ── Pure, unit-testable helpers ─────────────────────────────────────────────

// Numeric-aware id compare: "9" < "10", but plain strings fall back to locale.
const compareIds = (a, b) => {
  const na = Number(a);
  const nb = Number(b);
  const aNum = String(a).trim() !== "" && Number.isFinite(na);
  const bNum = String(b).trim() !== "" && Number.isFinite(nb);
  if (aNum && bNum) return na - nb;
  if (aNum) return -1;
  if (bNum) return 1;
  return String(a).localeCompare(String(b));
};

/**
 * Collect every stub (value beginning with STUB_PREFIX) from an overrides tree.
 * Returns `{ entityType, id, field, englishRef }[]` in a deterministic order:
 * by entityType, then numeric-aware id, then field. `englishRef` is the value
 * with the prefix stripped (the English reference to translate from).
 */
export const collectStubs = (overrides) => {
  const stubs = [];
  for (const entityType of Object.keys(overrides ?? {})) {
    const entities = overrides[entityType];
    if (!entities || typeof entities !== "object") continue;
    for (const id of Object.keys(entities)) {
      const fields = entities[id];
      if (!fields || typeof fields !== "object") continue;
      for (const field of Object.keys(fields)) {
        const value = fields[field];
        if (typeof value === "string" && value.startsWith(STUB_PREFIX)) {
          stubs.push({
            entityType,
            id,
            field,
            englishRef: value.slice(STUB_PREFIX.length),
          });
        }
      }
    }
  }
  stubs.sort(
    (a, b) =>
      a.entityType.localeCompare(b.entityType) ||
      compareIds(a.id, b.id) ||
      a.field.localeCompare(b.field),
  );
  return stubs;
};

/**
 * Return a NEW overrides object with `[entityType][id][field]` set to `frText`
 * (no stub prefix). The input is never mutated.
 */
export const applyTranslation = (overrides, { entityType, id, field }, frText) => {
  const next = structuredClone(overrides);
  next[entityType] ??= {};
  next[entityType][id] ??= {};
  next[entityType][id][field] = frText;
  return next;
};

// ── Interactive / IO shell ──────────────────────────────────────────────────

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const overridesPath = join(root, "locales", "fr-overrides.json");

const readOverrides = () => JSON.parse(readFileSync(overridesPath, "utf8"));

const writeOverrides = (overrides) => {
  writeFileSync(overridesPath, JSON.stringify(overrides, null, 2) + "\n");
};

// Fetch the Pokémon's French name for a flavorText stub. Best-effort: any
// failure resolves to null so the prompt still shows a usable label.
const fetchFrName = async (id) => {
  try {
    const res = await fetch(`${POKE_API_URL}pokemon-species/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    const fr = data?.names?.find((n) => n?.language?.name === "fr");
    return fr?.name ?? null;
  } catch {
    return null;
  }
};

const labelFor = async (stub) => {
  if (stub.entityType === "flavorText") {
    const frName = await fetchFrName(stub.id);
    return frName ? `#${stub.id} ${frName}` : `#${stub.id}`;
  }
  return `${stub.entityType}.${stub.id}.${stub.field}`;
};

// Indent multi-line English references so they read cleanly under the label.
const formatRef = (ref) =>
  ref
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

const main = async () => {
  let overrides = readOverrides();
  const stubs = collectStubs(overrides);
  const total = stubs.length;

  if (total === 0) {
    console.log("✅ All French entries are translated — nothing to do.");
    process.exit(0);
  }

  let translated = 0;

  const summarize = () => {
    const remaining = collectStubs(overrides).length;
    return { translated, remaining };
  };

  console.log(`\n🇫🇷 French stub translator — ${total} stub(s) to translate.`);
  console.log(
    "Type the French translation and press Enter. Empty line = skip. Ctrl-C = save & quit.\n",
  );

  const rl = readline.createInterface({ input: stdin, output: stdout });
  // Pause input while we do async work (the French-name fetch) between prompts,
  // so no typed/piped line is consumed and dropped before `question()` listens.
  // `rl.question()` resumes the stream itself when it shows the prompt.
  rl.pause();

  // Ctrl-C: overrides are already on disk (we write after each entry), but we
  // write once more to be safe and print a summary before exiting gracefully.
  rl.on("SIGINT", () => {
    writeOverrides(overrides);
    const { remaining } = summarize();
    console.log(
      `\n\n💾 Saved ${translated} translation(s) this session, ${remaining} remaining.`,
    );
    rl.close();
    process.exit(0);
  });

  for (let i = 0; i < stubs.length; i++) {
    const stub = stubs[i];
    const label = await labelFor(stub);
    console.log(`\n[${i + 1}/${total}] ${label}`);
    console.log("  EN:");
    console.log(formatRef(stub.englishRef));

    let answer;
    try {
      answer = await rl.question("  FR> ");
    } catch {
      // stdin closed (EOF / piped input exhausted) — stop cleanly.
      break;
    }
    rl.pause(); // hold input during the next iteration's async label fetch
    answer = answer.trim();
    if (answer === "") continue; // skip: leave the stub as-is

    overrides = applyTranslation(overrides, stub, answer);
    writeOverrides(overrides); // persist immediately — never lose progress
    translated++;
  }

  rl.close();

  const { remaining } = summarize();
  console.log(
    `\n✅ Done. Translated ${translated} this session, ${remaining} stub(s) remaining.`,
  );
  console.log("Run `yarn check-fr-coverage` to confirm 0 remaining.");
};

// Only run the interactive shell when invoked directly (not when imported by
// the test file).
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
