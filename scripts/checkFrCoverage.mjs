import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchFrRawDataset, computeFrGaps } from "../services/fetchPokemons/fetchFrData.ts";
import { mergeStubs, STUB_PREFIX } from "./scaffoldFrStubs.mjs";
import { mailConfigFromEnv, composeCoverageMail, sendCoverageMail } from "./frCoverageMailer.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const overridesPath = join(root, "locales", "fr-overrides.json");

const overrides = JSON.parse(readFileSync(overridesPath, "utf8"));
console.log("Fetching French dataset from PokéAPI (build-time, cached)…");
const dataset = await fetchFrRawDataset();
const gaps = computeFrGaps(dataset, overrides);

const { merged, addedCount } = mergeStubs(overrides, gaps);
if (addedCount > 0) {
  writeFileSync(overridesPath, JSON.stringify(merged, null, 2) + "\n");
}

if (gaps.length === 0) {
  console.log("✅ French coverage complete — 0 unfilled fields.");
  process.exit(0);
}

const byType = gaps.reduce((acc, g) => ((acc[g.entityType] ??= []).push(g), acc), {});
console.error(`\n❌ ${gaps.length} unfilled French field(s). Stubs scaffolded into locales/fr-overrides.json (prefix "${STUB_PREFIX.trim()}").`);
for (const [type, list] of Object.entries(byType)) {
  console.error(`\n  ${type} (${list.length}):`);
  for (const g of list.slice(0, 50)) console.error(`    ${g.id}.${g.field}  ← EN: ${g.englishRef}`);
  if (list.length > 50) console.error(`    …and ${list.length - 50} more`);
}
console.error(`\nFill every "${STUB_PREFIX.trim()}…" value in locales/fr-overrides.json, then re-run: npm run check-fr-coverage`);

const cfg = mailConfigFromEnv(process.env);
if (cfg) {
  try {
    await sendCoverageMail(composeCoverageMail(gaps, cfg), cfg.token);
    console.error("📧 Sent coverage report to " + cfg.to);
  } catch (e) {
    console.error("⚠️ Coverage email failed to send (build still fails on gaps): " + e.message);
  }
} else {
  console.error("(email notification skipped: FR_COVERAGE_MAIL_TO/FROM/TOKEN not all set)");
}

process.exit(1);
