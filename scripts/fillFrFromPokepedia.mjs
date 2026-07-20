// scripts/fillFrFromPokepedia.mjs
// Auto-fill missing French flavor-text (`__STUB__ ` entries) in
// locales/fr-overrides.json from Poképédia's MediaWiki API, then email the
// site owner the original → translated pairs for review.
//
// This is a FILL tool, not the build gate: `check-fr-coverage` remains the
// gate, so any stub Poképédia can't fill stays a stub and keeps the build red.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STUB_PREFIX } from "./scaffoldFrStubs.mjs";
import { POKE_API_URL } from "../constants/FetchPokemons.ts";
import {
  mailConfigFromEnv,
  sendCoverageMail,
  composePokepediaFillMail,
} from "./frCoverageMailer.mjs";

// ── Pure, unit-testable helpers ─────────────────────────────────────────────

// Normalize MediaWiki wikitext into a clean plain-text sentence.
export const cleanWikitext = (s) =>
  s
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1") // [[a|b]] -> b
    .replace(/\[\[([^\]]*)\]\]/g, "$1") // [[a]] -> a
    .replace(/\{\{[^{}]*\}\}/g, "") // {{..}} -> ''
    .replace(/'''?/g, "")
    .replace(/<ref[^>]*>.*?<\/ref>/gi, "")
    .replace(/<br\s*\/?>(?=.)/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Extract the first Pokédex description from a Poképédia page's wikitext.
// Returns a cleaned French string (>= 15 chars), or null if none is found.
export const extractDesc = (wikitext) => {
  const s = wikitext.search(/Descriptions du \[*Pok[eé]dex/i); // "Pokédex" AND "[[Pokédex]]"
  if (s === -1) return null;
  const rest = wikitext.slice(s);
  const e = rest.slice(24).search(/\n==[^=]/); // next level-2 heading ends the section
  const section = e === -1 ? rest : rest.slice(0, 24 + e);
  const m = section.match(/\n:([^\n]+)/); // first ":description" line
  if (!m) return null;
  const t = cleanWikitext(m[1]);
  return t.length >= 15 ? t : null;
};

/**
 * Collect every flavorText stub (value beginning with STUB_PREFIX).
 * @param {Record<string, Record<string, Record<string, string>>>} overrides
 * @returns {{id: string, englishRef: string}[]}
 */
export const collectFlavorStubs = (overrides) => {
  const flavor = overrides?.flavorText;
  if (!flavor || typeof flavor !== "object") return [];
  const stubs = [];
  for (const id of Object.keys(flavor)) {
    const entry = flavor[id];
    const value = entry?.text;
    if (typeof value === "string" && value.startsWith(STUB_PREFIX)) {
      stubs.push({ id, englishRef: value.slice(STUB_PREFIX.length) });
    }
  }
  return stubs;
};

// ── IO shell ────────────────────────────────────────────────────────────────

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const overridesPath = join(root, "locales", "fr-overrides.json");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch with a few retries and exponential-ish backoff. Returns the Response
// (which may still be non-ok) or throws after exhausting attempts.
const fetchWithRetry = async (url, attempts = 3) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    if (i < attempts - 1) await wait(300 * (i + 1));
  }
  throw lastErr ?? new Error("fetch failed");
};

// The Pokémon's French name from PokéAPI species → names[lang==="fr"].
const fetchFrName = async (id) => {
  const res = await fetchWithRetry(`${POKE_API_URL}pokemon-species/${id}`);
  const data = await res.json();
  const fr = data?.names?.find((n) => n?.language?.name === "fr");
  return fr?.name ?? null;
};

// The raw wikitext of a Poképédia page (by French name).
const fetchPokepediaWikitext = async (frName) => {
  const url =
    `https://www.pokepedia.fr/api.php?action=parse` +
    `&page=${encodeURIComponent(frName)}` +
    `&prop=wikitext&format=json&formatversion=2&redirects=1`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  return data?.parse?.wikitext ?? null;
};

const readOverrides = () => JSON.parse(readFileSync(overridesPath, "utf8"));
const writeOverrides = (overrides) =>
  writeFileSync(overridesPath, JSON.stringify(overrides, null, 2) + "\n");

const main = async () => {
  const overrides = readOverrides();
  const stubs = collectFlavorStubs(overrides);

  if (stubs.length === 0) {
    console.log("✅ No French flavor stubs to fill.");
    process.exit(0);
  }

  console.log(
    `\n🇫🇷 Filling ${stubs.length} French flavor stub(s) from Poképédia…\n`,
  );

  const filled = [];
  const failed = [];

  for (const { id, englishRef } of stubs) {
    let frName = null;
    try {
      frName = await fetchFrName(id);
      if (!frName) {
        failed.push({ id, frName: null, reason: "no French name from PokéAPI" });
        console.log(`  ✗ #${id}: no French name`);
        await wait(150);
        continue;
      }

      const wikitext = await fetchPokepediaWikitext(frName);
      if (!wikitext) {
        failed.push({ id, frName, reason: "no Poképédia page/wikitext" });
        console.log(`  ✗ #${id} ${frName}: no Poképédia page`);
        await wait(150);
        continue;
      }

      const frText = extractDesc(wikitext);
      if (!frText) {
        failed.push({
          id,
          frName,
          reason: "no Pokédex description found on Poképédia",
        });
        console.log(`  ✗ #${id} ${frName}: no description found`);
        await wait(150);
        continue;
      }

      // Success: write immediately so we never lose progress on a crash.
      overrides.flavorText[id] ??= {};
      overrides.flavorText[id].text = frText;
      writeOverrides(overrides);
      filled.push({ id, frName, englishRef, frText });
      console.log(`  ✓ #${id} ${frName}`);
    } catch (err) {
      failed.push({ id, frName, reason: `error: ${err?.message ?? err}` });
      console.log(`  ✗ #${id} ${frName ?? ""}: ${err?.message ?? err}`);
    }
    await wait(150);
  }

  // Email the review pairs (best-effort — never throw from the mailer).
  const mailConfig = mailConfigFromEnv(process.env);
  if (mailConfig && filled.length > 0) {
    try {
      const message = composePokepediaFillMail(filled, failed, {
        from: mailConfig.from,
        to: mailConfig.to,
      });
      await sendCoverageMail(message, mailConfig.token);
      console.log(`\n📧 Emailed ${filled.length} review pair(s) to ${mailConfig.to}.`);
    } catch (err) {
      console.warn(`⚠️  Email failed (fill still saved): ${err?.message ?? err}`);
    }
  } else if (!mailConfig) {
    console.log("(email skipped: FR_COVERAGE_MAIL_* not set)");
  }

  console.log(`\n✅ Filled ${filled.length}/${stubs.length} stub(s).`);
  if (failed.length > 0) {
    console.log(`⚠️  ${failed.length} still need manual translation:`);
    for (const f of failed) {
      console.log(`   #${f.id} ${f.frName ?? ""} — ${f.reason}`);
    }
    console.log("Run `yarn check-fr-coverage` — it stays red until these are filled.");
  }
  process.exit(0);
};

// Only run when invoked directly (not when imported by the test file).
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
