# French Localization — Plan 1: French Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the French data foundation — pure extractors, slug generation with a collision guard, a PokéAPI-fr → overrides → BUILD-ERROR resolution chain, a build-time FR dataset fetcher, and a repeatable coverage checker that makes every missing French field impossible to miss.

**Architecture:** Pure, unit-tested functions do the French extraction and slug work. A build-time fetch layer (mirroring the existing English one) assembles an FR-augmented dataset. A resolution helper enforces "never fall back to English." A coverage script fetches the whole in-scope dataset, scaffolds English-referenced stubs for every gap into `locales/fr-overrides.json`, and exits non-zero until every stub is filled. This plan delivers NO user-visible pages — it produces the tested data backend that Plan 2 (pages) and Plan 3 (SEO) consume.

**Tech Stack:** Next.js 16 (Pages Router), React 19, TypeScript, Vitest (`*.test.ts`, jsdom), Node's built-in test runner (`node --test` for `*.test.mjs`), PokéAPI v2.

## Global Constraints

- **French-only.** No other locales. No English may ever leak onto a `/fr/` surface.
- **Resolution order for every displayed French field:** PokéAPI `fr` → `locales/fr-overrides.json` → **throw `FrCoverageError`**. NEVER silently fall back to English.
- **In-scope displayed FR fields (the ONLY fields coverage inspects):** Pokémon name · flavor text (most recent fr version) · genus/category · each visible (non-hidden) ability name · the 18 type labels · the 6 stat labels. **Ability descriptions are NOT displayed anywhere and are OUT of scope.**
- **`types` stays an English-slug CSV** (e.g. `"grass,poison"`). It is the key into effectiveness tables, colours, and icons — NEVER localize the internal value. French type text is a *display-time* label lookup only.
- **Cache aggressively; build-time only.** Never fetch PokéAPI per page-request in production. All fetching happens in `getStaticProps`/scripts, exactly like the existing English path.
- **Slug rules:** lowercase → Unicode NFD → strip diacritics → non-alphanumerics collapse to single `-` → trim leading/trailing `-`. Collisions after overrides MUST fail the build loudly.
- **Test conventions:** pure TS utils → Vitest `*.test.ts` (`npm test`). Node `.mjs` scripts → `node --test path/to/x.test.mjs`.
- Production origin: `https://www.my-pokedex.com`. Package installs use `npm install --legacy-peer-deps` (pre-existing `@next/third-parties` peer range).
- Nidoran national-dex ids: ♀ = **29**, ♂ = **32** (both slugify to `nidoran` → must be disambiguated).

---

### Task 1: Slug generation + collision guard

**Files:**
- Create: `utils/slugify.ts`
- Create: `constants/FrSlugOverrides.ts`
- Test: `utils/slugify.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `slugify(name: string): string`
  - `FR_SLUG_OVERRIDES: Record<number, string>` — id→slug manual disambiguations.
  - `buildSlugIdMap(entries: Array<{ id: number; frName: string }>): { slugToId: Record<string, number>; idToSlug: Record<number, string> }` — applies `slugify` then `FR_SLUG_OVERRIDES`, throws `Error` listing every colliding pair if two ids map to the same slug.

- [ ] **Step 1: Write the failing tests**

```ts
// utils/slugify.test.ts
import { describe, it, expect } from "vitest";
import { slugify, buildSlugIdMap } from "./slugify";

describe("slugify", () => {
  it("lowercases plain names", () => {
    expect(slugify("Bulbizarre")).toBe("bulbizarre");
  });
  it("strips French accents", () => {
    expect(slugify("Électhor")).toBe("electhor");
    expect(slugify("Flabébé")).toBe("flabebe");
    expect(slugify("Métamorph")).toBe("metamorph");
  });
  it("collapses punctuation and spaces to single dashes", () => {
    expect(slugify("M. Mime")).toBe("m-mime");
    expect(slugify("Ho-Oh")).toBe("ho-oh");
    expect(slugify("Porygon-Z")).toBe("porygon-z");
  });
  it("drops gender symbols, collapsing Nidoran forms to the same base", () => {
    expect(slugify("Nidoran♀")).toBe("nidoran");
    expect(slugify("Nidoran♂")).toBe("nidoran");
  });
  it("trims leading/trailing dashes", () => {
    expect(slugify("♂Truc♂")).toBe("truc");
  });
});

describe("buildSlugIdMap", () => {
  it("maps slug↔id both ways", () => {
    const { slugToId, idToSlug } = buildSlugIdMap([
      { id: 1, frName: "Bulbizarre" },
      { id: 145, frName: "Électhor" },
    ]);
    expect(slugToId).toEqual({ bulbizarre: 1, electhor: 145 });
    expect(idToSlug).toEqual({ 1: "bulbizarre", 145: "electhor" });
  });
  it("applies FR_SLUG_OVERRIDES so the Nidoran pair resolves distinctly", () => {
    const { slugToId } = buildSlugIdMap([
      { id: 29, frName: "Nidoran♀" },
      { id: 32, frName: "Nidoran♂" },
    ]);
    expect(slugToId).toEqual({ "nidoran-f": 29, "nidoran-m": 32 });
  });
  it("throws listing the colliding names when two ids share a slug", () => {
    expect(() =>
      buildSlugIdMap([
        { id: 100, frName: "Doublon" },
        { id: 200, frName: "Doublon" },
      ])
    ).toThrow(/collision/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- utils/slugify.test.ts`
Expected: FAIL — `Cannot find module './slugify'`.

- [ ] **Step 3: Write the implementation**

```ts
// constants/FrSlugOverrides.ts
// Manual slug disambiguations by national-dex id. Only needed where two official
// French names collapse to the same accent-stripped slug. Nidoran ♀ (29) and
// ♂ (32) are the sole base-dex collision; the build-time collision guard in
// buildSlugIdMap fails loudly if a future data refresh introduces another.
export const FR_SLUG_OVERRIDES: Record<number, string> = {
  29: "nidoran-f",
  32: "nidoran-m",
};
```

```ts
// utils/slugify.ts
import { FR_SLUG_OVERRIDES } from "../constants/FrSlugOverrides";

export const slugify = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (U+0300–U+036F)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumerics → single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

export const buildSlugIdMap = (
  entries: Array<{ id: number; frName: string }>
): { slugToId: Record<string, number>; idToSlug: Record<number, string> } => {
  const slugToId: Record<string, number> = {};
  const idToSlug: Record<number, string> = {};
  const collisions: string[] = [];

  for (const { id, frName } of entries) {
    const slug = FR_SLUG_OVERRIDES[id] ?? slugify(frName);
    if (slug in slugToId && slugToId[slug] !== id) {
      collisions.push(`"${slug}" ← id ${slugToId[slug]} and id ${id} ("${frName}")`);
      continue;
    }
    slugToId[slug] = id;
    idToSlug[id] = slug;
  }

  if (collisions.length) {
    throw new Error(
      `Slug collision(s) detected — add disambiguations to constants/FrSlugOverrides.ts:\n  ` +
        collisions.join("\n  ")
    );
  }

  return { slugToId, idToSlug };
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- utils/slugify.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add utils/slugify.ts utils/slugify.test.ts constants/FrSlugOverrides.ts
git commit -m "feat(fr): slug generation with accent-strip and collision guard"
```

---

### Task 2: French extractors (name, flavor text, genus)

**Files:**
- Create: `utils/pokemonFormatter/extractorsFr.ts`
- Test: `utils/pokemonFormatter/extractorsFr.test.ts`
- Reference (do not modify): `utils/pokemonFormatter/types.ts` (`Specie`, `FlavorTextEntry`, `GeneraEntry`), `utils/pokemonFormatter/extractors.ts` (English versions this mirrors).

**Interfaces:**
- Consumes: `Specie` from `./types` — but note the existing `FlavorTextEntry` type lacks a `version` field; this task widens the local view (see below).
- Produces (each returns `null` when PokéAPI has no French value, so the resolution chain in Task 4 can take over — they NEVER return English):
  - `extractPokemonNameFr(species: SpecieFr): string | null`
  - `extractPokemonDescriptionFr(species: SpecieFr): string | null`
  - `extractPokemonCategoryFr(species: SpecieFr): string | null`
  - `VERSION_RECENCY: string[]` (exported for reuse/testing)
  - types `SpecieFr`, `FlavorTextEntryFr`, `NameEntryFr` (local, exported)

- [ ] **Step 1: Write the failing tests**

```ts
// utils/pokemonFormatter/extractorsFr.test.ts
import { describe, it, expect } from "vitest";
import {
  extractPokemonNameFr,
  extractPokemonDescriptionFr,
  extractPokemonCategoryFr,
} from "./extractorsFr";

const species = {
  names: [
    { language: { name: "en" }, name: "Bulbasaur" },
    { language: { name: "fr" }, name: "Bulbizarre" },
  ],
  genera: [
    { language: { name: "en" }, genus: "Seed Pokémon" },
    { language: { name: "fr" }, genus: "Pokémon Graine" },
  ],
  flavor_text_entries: [
    { language: { name: "en" }, version: { name: "red" }, flavor_text: "A strange seed." },
    { language: { name: "fr" }, version: { name: "black" }, flavor_text: "Vieille\fentrée." },
    { language: { name: "fr" }, version: { name: "scarlet" }, flavor_text: "Nouvelle\nentrée FR." },
  ],
} as const;

describe("extractPokemonNameFr", () => {
  it("returns the fr name", () => {
    expect(extractPokemonNameFr(species)).toBe("Bulbizarre");
  });
  it("returns null when no fr name exists", () => {
    expect(extractPokemonNameFr({ ...species, names: [{ language: { name: "en" }, name: "X" }] })).toBeNull();
  });
});

describe("extractPokemonCategoryFr", () => {
  it("returns the fr genus with the 'Pokémon' word stripped and trimmed", () => {
    expect(extractPokemonCategoryFr(species)).toBe("Graine");
  });
  it("returns null when no fr genus exists", () => {
    expect(extractPokemonCategoryFr({ ...species, genera: [{ language: { name: "en" }, genus: "Seed Pokémon" }] })).toBeNull();
  });
});

describe("extractPokemonDescriptionFr", () => {
  it("picks the most recent fr version and normalizes whitespace/formfeeds", () => {
    // scarlet outranks black in VERSION_RECENCY
    expect(extractPokemonDescriptionFr(species)).toBe("Nouvelle entrée FR.");
  });
  it("falls back to the last fr entry when the version is unknown to the ranking", () => {
    const s = {
      ...species,
      flavor_text_entries: [
        { language: { name: "fr" }, version: { name: "made-up-a" }, flavor_text: "Un." },
        { language: { name: "fr" }, version: { name: "made-up-b" }, flavor_text: "Deux." },
      ],
    };
    expect(extractPokemonDescriptionFr(s)).toBe("Deux.");
  });
  it("returns null when no fr flavor text exists", () => {
    expect(extractPokemonDescriptionFr({ ...species, flavor_text_entries: [{ language: { name: "en" }, version: { name: "red" }, flavor_text: "x" }] })).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- utils/pokemonFormatter/extractorsFr.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// utils/pokemonFormatter/extractorsFr.ts
// French counterparts of extractors.ts. Each returns null (never English) when
// PokéAPI has no French value, so resolveFrField (Task 4) can consult the
// overrides file and, failing that, throw. `types` is intentionally NOT handled
// here — type text is a display-time label lookup, never derived per-species.

export type NameEntryFr = { language: { name: string }; name: string };
export type GeneraEntryFr = { language: { name: string }; genus: string };
export type FlavorTextEntryFr = {
  language: { name: string };
  version: { name: string };
  flavor_text: string;
};
export type SpecieFr = {
  names: NameEntryFr[];
  genera: GeneraEntryFr[];
  flavor_text_entries: FlavorTextEntryFr[];
};

const isFr = (entry: { language: { name: string } }) => entry.language.name === "fr";

// Main-series versions that carry French flavor text, newest → oldest. Index 0 =
// most recent. Unknown versions get Infinity so any ranked entry beats them; when
// NO entry is ranked we fall back to the last fr entry in array order.
export const VERSION_RECENCY: string[] = [
  "scarlet", "violet",
  "legends-arceus",
  "brilliant-diamond", "shining-pearl",
  "sword", "shield",
  "lets-go-pikachu", "lets-go-eevee",
  "ultra-sun", "ultra-moon",
  "sun", "moon",
  "omega-ruby", "alpha-sapphire",
  "x", "y",
  "black-2", "white-2",
  "black", "white",
  "heartgold", "soulsilver",
  "platinum",
  "diamond", "pearl",
];

const rank = (version: string) => {
  const i = VERSION_RECENCY.indexOf(version);
  return i === -1 ? Infinity : i;
};

// Pokédex flavor text carries newlines, form-feeds (\f) and soft hyphens
// (­, a line-break hint) as layout artifacts — flatten them to spaces.
const normalizeFlavor = (text: string) => text.replace(/[\n\r\f­]/g, " ").replace(/\s+/g, " ").trim();

export const extractPokemonNameFr = (species: SpecieFr): string | null =>
  species.names.find(isFr)?.name ?? null;

export const extractPokemonCategoryFr = (species: SpecieFr): string | null => {
  const genus = species.genera.find(isFr)?.genus;
  if (!genus) return null;
  return genus.replace("Pokémon", "").trim();
};

export const extractPokemonDescriptionFr = (species: SpecieFr): string | null => {
  const frEntries = species.flavor_text_entries.filter(isFr);
  if (!frEntries.length) return null;

  const allUnknown = frEntries.every((e) => rank(e.version.name) === Infinity);
  const chosen = allUnknown
    ? frEntries[frEntries.length - 1]
    : frEntries.reduce((best, e) => (rank(e.version.name) < rank(best.version.name) ? e : best));

  return normalizeFlavor(chosen.flavor_text);
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- utils/pokemonFormatter/extractorsFr.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add utils/pokemonFormatter/extractorsFr.ts utils/pokemonFormatter/extractorsFr.test.ts
git commit -m "feat(fr): French name/genus/flavor-text extractors with version recency"
```

---

### Task 3: French field resolution chain (fr → overrides → throw)

**Files:**
- Create: `utils/fr/resolveFrField.ts`
- Create: `locales/fr-overrides.json`
- Test: `utils/fr/resolveFrField.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `class FrCoverageError extends Error`
  - `type FrOverrides = Record<string, Record<string, Record<string, string>>>` — `entityType → id → field → value`
  - `resolveFrField(args: { entityType: string; id: string; field: string; apiValue: string | null; overrides: FrOverrides }): string`
  - `collectFrGap(args: { entityType: string; id: string; field: string; apiValue: string | null; overrides: FrOverrides }): { entityType: string; id: string; field: string } | null` — returns a gap descriptor when the field would fail to resolve, else null (used by the coverage script; does NOT throw).

- [ ] **Step 1: Write the failing tests**

```ts
// utils/fr/resolveFrField.test.ts
import { describe, it, expect } from "vitest";
import { resolveFrField, collectFrGap, FrCoverageError } from "./resolveFrField";

const overrides = { flavorText: { "906": { text: "Texte de secours." } } };

describe("resolveFrField", () => {
  it("returns the PokéAPI value when present", () => {
    expect(resolveFrField({ entityType: "names", id: "1", field: "name", apiValue: "Bulbizarre", overrides })).toBe("Bulbizarre");
  });
  it("falls back to the overrides file when the API value is missing", () => {
    expect(resolveFrField({ entityType: "flavorText", id: "906", field: "text", apiValue: null, overrides })).toBe("Texte de secours.");
  });
  it("treats empty/whitespace API values as missing", () => {
    expect(resolveFrField({ entityType: "flavorText", id: "906", field: "text", apiValue: "   ", overrides })).toBe("Texte de secours.");
  });
  it("throws FrCoverageError when neither source has a value", () => {
    expect(() => resolveFrField({ entityType: "flavorText", id: "999", field: "text", apiValue: null, overrides })).toThrow(FrCoverageError);
  });
});

describe("collectFrGap", () => {
  it("returns null when the field resolves", () => {
    expect(collectFrGap({ entityType: "names", id: "1", field: "name", apiValue: "Bulbizarre", overrides })).toBeNull();
  });
  it("returns a gap descriptor when the field would throw", () => {
    expect(collectFrGap({ entityType: "flavorText", id: "999", field: "text", apiValue: null, overrides })).toEqual({ entityType: "flavorText", id: "999", field: "text" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- utils/fr/resolveFrField.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// utils/fr/resolveFrField.ts
export class FrCoverageError extends Error {
  constructor(entityType: string, id: string, field: string) {
    super(
      `Missing French value for ${entityType}.${id}.${field}. ` +
        `Add it to locales/fr-overrides.json or run "npm run check-fr-coverage" to scaffold it.`
    );
    this.name = "FrCoverageError";
  }
}

export type FrOverrides = Record<string, Record<string, Record<string, string>>>;

type Args = {
  entityType: string;
  id: string;
  field: string;
  apiValue: string | null;
  overrides: FrOverrides;
};

const overrideValue = ({ entityType, id, field, overrides }: Args): string | null => {
  const value = overrides?.[entityType]?.[id]?.[field];
  return value && value.trim() ? value : null;
};

const apiOrNull = (apiValue: string | null): string | null => (apiValue && apiValue.trim() ? apiValue : null);

export const resolveFrField = (args: Args): string => {
  const resolved = apiOrNull(args.apiValue) ?? overrideValue(args);
  if (resolved === null) {
    throw new FrCoverageError(args.entityType, args.id, args.field);
  }
  return resolved;
};

export const collectFrGap = (args: Args): { entityType: string; id: string; field: string } | null => {
  const resolved = apiOrNull(args.apiValue) ?? overrideValue(args);
  return resolved === null ? { entityType: args.entityType, id: args.id, field: args.field } : null;
};
```

```json
// locales/fr-overrides.json
{
  "names": {},
  "flavorText": {},
  "category": {},
  "abilities": {},
  "typeLabels": {},
  "statLabels": {}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- utils/fr/resolveFrField.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add utils/fr/resolveFrField.ts utils/fr/resolveFrField.test.ts locales/fr-overrides.json
git commit -m "feat(fr): fr→overrides→throw resolution chain + empty overrides file"
```

---

### Task 4: Static FR label sources (stat labels) + build-time type-label fetch contract

**Files:**
- Create: `constants/FrStatLabels.ts`
- Test: `constants/FrStatLabels.test.ts`
- Reference: `utils/pokemonFormatter/extractors.ts:6-13` (the English `statLabelMapper` keys these mirror).

**Interfaces:**
- Consumes: nothing.
- Produces: `FR_STAT_LABELS: Record<string, string>` — keyed by the English display label produced by `extractStatsFromPokemon` (`"Hp"`, `"Attack"`, `"Defense"`, `"Speed"`, `"Spe. Att."`, `"Spe. Def."`), value = French label. These are our own UI labels (not PokéAPI text); still routed through overrides/coverage as `statLabels` so a new stat surfaces a gap.

> **Copy note for reviewer (Mickael):** the French strings below are placeholders in the reviewer's domain — the coverage check (Task 6) treats `statLabels` as in-scope, so any you blank out will resurface as a stub. Provided values: `PV`, `Attaque`, `Défense`, `Vitesse`, `Att. Spé.`, `Déf. Spé.`

- [ ] **Step 1: Write the failing test**

```ts
// constants/FrStatLabels.test.ts
import { describe, it, expect } from "vitest";
import { FR_STAT_LABELS } from "./FrStatLabels";

describe("FR_STAT_LABELS", () => {
  it("covers every English stat label emitted by extractStatsFromPokemon", () => {
    for (const key of ["Hp", "Attack", "Defense", "Speed", "Spe. Att.", "Spe. Def."]) {
      expect(FR_STAT_LABELS[key]).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- constants/FrStatLabels.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// constants/FrStatLabels.ts
// Keyed by the English label extractStatsFromPokemon already produces
// (capitalizeFirstLetter of statLabelMapper values). Display maps through this.
export const FR_STAT_LABELS: Record<string, string> = {
  Hp: "PV",
  Attack: "Attaque",
  Defense: "Défense",
  Speed: "Vitesse",
  "Spe. Att.": "Att. Spé.",
  "Spe. Def.": "Déf. Spé.",
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- constants/FrStatLabels.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add constants/FrStatLabels.ts constants/FrStatLabels.test.ts
git commit -m "feat(fr): French stat-label map"
```

---

### Task 5: FR fetch layer — species/type/ability French fetch + gap computation core

**Files:**
- Create: `services/fetchPokemons/fetchFrData.ts`
- Test: `services/fetchPokemons/computeFrGaps.test.ts`
- Reference: `services/fetchPokemons/fetchPokemons.ts` (the `request` retry pattern to mirror), `constants/FetchPokemons.ts` (`POKE_API_URL`, `MAX_POKEMON_ID_ALLOWED`).

**Interfaces:**
- Consumes: `extractPokemonNameFr`, `extractPokemonCategoryFr`, `extractPokemonDescriptionFr` (Task 2); `collectFrGap`, `resolveFrField`, `FrOverrides` (Task 3); `FR_STAT_LABELS` (Task 4).
- Produces:
  - `type FrSpeciesRaw = { id: number; names: any[]; genera: any[]; flavor_text_entries: any[] }`
  - `type FrTypeRaw = { name: string; names: Array<{ language: { name: string }; name: string }> }`
  - `type FrAbilityRaw = { name: string; names: Array<{ language: { name: string }; name: string }> }`
  - `type FrRawDataset = { species: FrSpeciesRaw[]; types: FrTypeRaw[]; abilities: FrAbilityRaw[] }`
  - `computeFrGaps(dataset: FrRawDataset, overrides: FrOverrides): Array<{ entityType: string; id: string; field: string; englishRef: string }>` — PURE; the network-free core the coverage script and its tests share.
  - `fetchFrRawDataset(): Promise<FrRawDataset>` — build-time network fetch (species 1..MAX, the 18 types, and every visible ability referenced), reusing a local retry `request`.

**Note:** This task's testable deliverable is `computeFrGaps` (pure, fixture-driven). `fetchFrRawDataset` is exercised live by Task 6's script run and the Plan-1 verification step, not by a unit test (no network in unit tests).

- [ ] **Step 1: Write the failing test for the pure core**

```ts
// services/fetchPokemons/computeFrGaps.test.ts
import { describe, it, expect } from "vitest";
import { computeFrGaps } from "./fetchFrData";

const dataset = {
  species: [
    {
      id: 1,
      names: [{ language: { name: "fr" }, name: "Bulbizarre" }, { language: { name: "en" }, name: "Bulbasaur" }],
      genera: [{ language: { name: "fr" }, genus: "Pokémon Graine" }, { language: { name: "en" }, genus: "Seed Pokémon" }],
      flavor_text_entries: [{ language: { name: "en" }, version: { name: "red" }, flavor_text: "A strange seed." }], // no fr → gap
    },
  ],
  types: [{ name: "grass", names: [{ language: { name: "fr" }, name: "Plante" }] }], // ok
  abilities: [{ name: "overgrow", names: [{ language: { name: "en" }, name: "Overgrow" }] }], // no fr → gap
};

describe("computeFrGaps", () => {
  it("flags missing fr flavor text with the English reference", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps).toContainEqual({ entityType: "flavorText", id: "1", field: "text", englishRef: "A strange seed." });
  });
  it("flags a missing fr ability name with the English reference", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps).toContainEqual({ entityType: "abilities", id: "overgrow", field: "name", englishRef: "Overgrow" });
  });
  it("does NOT flag fields the API covers", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps.find((g) => g.entityType === "names")).toBeUndefined();
    expect(gaps.find((g) => g.entityType === "typeLabels")).toBeUndefined();
  });
  it("does NOT flag a gap already filled in overrides", () => {
    const gaps = computeFrGaps(dataset, { names: {}, flavorText: { "1": { text: "Rempli." } }, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(gaps.find((g) => g.entityType === "flavorText")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- services/fetchPokemons/computeFrGaps.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// services/fetchPokemons/fetchFrData.ts
import { POKE_API_URL, MAX_POKEMON_ID_ALLOWED } from "../../constants/FetchPokemons";
import { FR_STAT_LABELS } from "../../constants/FrStatLabels";
import { collectFrGap, FrOverrides } from "../../utils/fr/resolveFrField";
import {
  extractPokemonNameFr,
  extractPokemonCategoryFr,
  extractPokemonDescriptionFr,
  type SpecieFr,
} from "../../utils/pokemonFormatter/extractorsFr";

const findEn = (entries: Array<{ language: { name: string } }>) => entries.find((e) => e.language.name === "en");
const findEnName = (entries: Array<{ language: { name: string }; name: string }>) => findEn(entries)?.name ?? "";

export type FrSpeciesRaw = { id: number; names: any[]; genera: any[]; flavor_text_entries: any[] };
export type FrTypeRaw = { name: string; names: Array<{ language: { name: string }; name: string }> };
export type FrAbilityRaw = { name: string; names: Array<{ language: { name: string }; name: string }> };
export type FrRawDataset = { species: FrSpeciesRaw[]; types: FrTypeRaw[]; abilities: FrAbilityRaw[] };

// PURE: given fetched raw data + current overrides, list every in-scope displayed
// field with no French value from either source, each with its English reference.
export const computeFrGaps = (
  dataset: FrRawDataset,
  overrides: FrOverrides
): Array<{ entityType: string; id: string; field: string; englishRef: string }> => {
  const gaps: Array<{ entityType: string; id: string; field: string; englishRef: string }> = [];
  const push = (entityType: string, id: string, field: string, apiValue: string | null, englishRef: string) => {
    if (collectFrGap({ entityType, id, field, apiValue, overrides })) gaps.push({ entityType, id, field, englishRef });
  };

  for (const s of dataset.species) {
    const specie = s as unknown as SpecieFr;
    const id = String(s.id);
    push("names", id, "name", extractPokemonNameFr(specie), findEnName(s.names));
    push("category", id, "text", extractPokemonCategoryFr(specie), findEn(s.genera)?.genus?.replace("Pokémon", "").trim() ?? "");
    push("flavorText", id, "text", extractPokemonDescriptionFr(specie), findEn(s.flavor_text_entries)?.flavor_text ?? "");
  }

  for (const t of dataset.types) {
    push("typeLabels", t.name, "label", t.names.find((n) => n.language.name === "fr")?.name ?? null, findEnName(t.names));
  }

  for (const a of dataset.abilities) {
    push("abilities", a.name, "name", a.names.find((n) => n.language.name === "fr")?.name ?? null, findEnName(a.names));
  }

  // Stat labels are our own UI strings (not PokéAPI); FR_STAT_LABELS is the API source.
  for (const [key, value] of Object.entries(FR_STAT_LABELS)) {
    push("statLabels", key, "label", value, key);
  }

  return gaps;
};

const REQUEST_RETRIES = 3;
const REQUEST_RETRY_DELAY_MS = 400;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const request = async (url: string, attempt = 1): Promise<any> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request to ${url} failed with status ${res.status}`);
    return await res.json();
  } catch (error) {
    if (attempt >= REQUEST_RETRIES) throw error;
    await wait(REQUEST_RETRY_DELAY_MS * attempt);
    return request(url, attempt + 1);
  }
};

// Build-time only. Fetches: every species 1..MAX, the 18 types, and every visible
// (non-hidden) ability referenced by those Pokémon (deduped).
export const fetchFrRawDataset = async (): Promise<FrRawDataset> => {
  const ids = Array.from({ length: MAX_POKEMON_ID_ALLOWED }, (_, i) => i + 1);
  const species: FrSpeciesRaw[] = await Promise.all(ids.map((id) => request(`${POKE_API_URL}pokemon-species/${id}`)));

  const typeList: { results: Array<{ name: string }> } = await request(`${POKE_API_URL}type`);
  const realTypes = typeList.results.filter((t) => !["unknown", "shadow", "stellar"].includes(t.name));
  const types: FrTypeRaw[] = await Promise.all(realTypes.map((t) => request(`${POKE_API_URL}type/${t.name}`)));

  // Collect visible ability slugs from each Pokémon (the /pokemon endpoint, not species).
  const pokemon: Array<{ abilities: Array<{ ability: { name: string }; is_hidden: boolean }> }> = await Promise.all(
    ids.map((id) => request(`${POKE_API_URL}pokemon/${id}`))
  );
  const abilitySlugs = Array.from(
    new Set(pokemon.flatMap((p) => p.abilities.filter((a) => !a.is_hidden).map((a) => a.ability.name)))
  );
  const abilities: FrAbilityRaw[] = await Promise.all(abilitySlugs.map((name) => request(`${POKE_API_URL}ability/${name}`)));

  return { species, types, abilities };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- services/fetchPokemons/computeFrGaps.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/fetchPokemons/fetchFrData.ts services/fetchPokemons/computeFrGaps.test.ts
git commit -m "feat(fr): FR raw-dataset fetch + pure gap-computation core"
```

---

### Task 6: Coverage check script + npm command + prebuild wiring

**Files:**
- Create: `scripts/checkFrCoverage.mjs`
- Create: `scripts/scaffoldFrStubs.mjs` (pure stub-merge helper, importable + testable)
- Test: `scripts/scaffoldFrStubs.test.mjs` (`node --test`)
- Modify: `package.json` (scripts block, `scripts/generateSitemap.mjs:31` is unrelated) — add `check-fr-coverage` and chain it into `prebuild`.

**Interfaces:**
- Consumes: `computeFrGaps`, `fetchFrRawDataset` from `services/fetchPokemons/fetchFrData` (imported via the built TS? — see Note), current `locales/fr-overrides.json`.
- Produces:
  - `mergeStubs(overrides, gaps): { merged, addedCount }` in `scaffoldFrStubs.mjs` — inserts a stub `"__STUB__: <englishRef>"` for each gap not already present; returns new object + count of stubs added.
  - `scripts/checkFrCoverage.mjs` CLI: fetch → compute gaps → merge stubs → write `fr-overrides.json` → print grouped report → `process.exit(gaps.length ? 1 : 0)`.

> **Note on importing TS from an .mjs script:** the existing scripts are pure `.mjs` with no TS imports. To avoid a build-tool detour, `checkFrCoverage.mjs` runs via `tsx` (already transitively available through Next, but add it explicitly): invoke as `npx tsx scripts/checkFrCoverage.mjs`? — simpler: keep the fetch+gap logic reachable from Node by running the script through `tsx`. The npm script below uses `tsx` so the `.mjs` can `import` the `.ts` modules directly. If `tsx` is not present, Step 3a adds it as a devDependency.

- [ ] **Step 1: Write the failing test for the pure stub-merge helper**

```js
// scripts/scaffoldFrStubs.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeStubs, STUB_PREFIX } from "./scaffoldFrStubs.mjs";

test("mergeStubs inserts a stub carrying the English reference for each gap", () => {
  const overrides = { flavorText: {}, abilities: {} };
  const gaps = [
    { entityType: "flavorText", id: "906", field: "text", englishRef: "Some English entry." },
    { entityType: "abilities", id: "mycelium-might", field: "name", englishRef: "Mycelium Might" },
  ];
  const { merged, addedCount } = mergeStubs(overrides, gaps);
  assert.equal(addedCount, 2);
  assert.equal(merged.flavorText["906"].text, `${STUB_PREFIX}Some English entry.`);
  assert.equal(merged.abilities["mycelium-might"].name, `${STUB_PREFIX}Mycelium Might`);
});

test("mergeStubs does not overwrite an already-filled value", () => {
  const overrides = { flavorText: { "906": { text: "Déjà traduit." } } };
  const gaps = [{ entityType: "flavorText", id: "906", field: "text", englishRef: "English." }];
  const { merged, addedCount } = mergeStubs(overrides, gaps);
  assert.equal(addedCount, 0);
  assert.equal(merged.flavorText["906"].text, "Déjà traduit.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/scaffoldFrStubs.test.mjs`
Expected: FAIL — cannot find module `./scaffoldFrStubs.mjs`.

- [ ] **Step 3: Write the pure helper**

```js
// scripts/scaffoldFrStubs.mjs
// A stub value begins with STUB_PREFIX so both humans and the coverage check can
// tell "not yet translated" from a real French string. collectFrGap/resolveFrField
// treat a stub as UNFILLED because... (see companion guard below).
export const STUB_PREFIX = "__STUB__ ";

export const mergeStubs = (overrides, gaps) => {
  const merged = structuredClone(overrides);
  let addedCount = 0;
  for (const { entityType, id, field, englishRef } of gaps) {
    merged[entityType] ??= {};
    merged[entityType][id] ??= {};
    if (merged[entityType][id][field] === undefined) {
      merged[entityType][id][field] = `${STUB_PREFIX}${englishRef}`;
      addedCount++;
    }
  }
  return { merged, addedCount };
};
```

> **Guard consistency:** because a stub value is a non-empty string, `resolveFrField` (Task 3) would otherwise treat it as "filled." Update `overrideValue` in `utils/fr/resolveFrField.ts` to reject stub values:
> ```ts
> const overrideValue = ({ entityType, id, field, overrides }: Args): string | null => {
>   const value = overrides?.[entityType]?.[id]?.[field];
>   if (!value || !value.trim() || value.startsWith("__STUB__ ")) return null;
>   return value;
> };
> ```
> Add a test to `utils/fr/resolveFrField.test.ts`: a `__STUB__ …` override value is treated as missing (throws / is collected as a gap). Run `npm test -- utils/fr/resolveFrField.test.ts` → PASS.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/scaffoldFrStubs.test.mjs`
Expected: PASS.

- [ ] **Step 5: Write the coverage CLI**

```js
// scripts/checkFrCoverage.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchFrRawDataset, computeFrGaps } from "../services/fetchPokemons/fetchFrData.ts";
import { mergeStubs, STUB_PREFIX } from "./scaffoldFrStubs.mjs";

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
process.exit(1);
```

- [ ] **Step 6: Add tsx devDependency and npm scripts**

Run:
```bash
npm install --legacy-peer-deps --save-dev tsx
```

Edit `package.json` scripts block to add the command and chain it into prebuild (keep the existing image/sitemap steps):

```json
    "check-fr-coverage": "tsx scripts/checkFrCoverage.mjs",
    "prebuild": "node scripts/downloadPokemonImages.mjs && node scripts/generateSitemap.mjs && npm run check-fr-coverage",
```

- [ ] **Step 7: Run the coverage check live (first real gap report)**

Run: `npm run check-fr-coverage`
Expected: it fetches, then EITHER prints `✅ French coverage complete` (unlikely on first run) OR exits 1 with a grouped gap report and writes `__STUB__ ` entries into `locales/fr-overrides.json`. Capture the report — this is the stub list handed to Mickael.

- [ ] **Step 8: Commit (script + scaffolded stubs)**

```bash
git add scripts/checkFrCoverage.mjs scripts/scaffoldFrStubs.mjs scripts/scaffoldFrStubs.test.mjs package.json package-lock.json utils/fr/resolveFrField.ts utils/fr/resolveFrField.test.ts locales/fr-overrides.json
git commit -m "feat(fr): check-fr-coverage script scaffolds stubs and gates the build"
```

---

## Self-Review (completed against Plan-1 scope)

- **Slug + collision guard** → Task 1. **FR name/genus/flavor extraction** → Task 2. **fr→overrides→throw** → Task 3. **Stat labels** → Task 4. **Type labels** → routed as `typeLabels` through Tasks 5–6 (fetched from `/type` fr, gap-checked). **Ability names** → Tasks 5–6. **Coverage command + prebuild gate + stub scaffolding with English reference** → Task 6. **Bounded scope (no ability descriptions)** → enforced by `computeFrGaps` only inspecting the six in-scope entity types.
- **Stub-vs-filled consistency** — the `__STUB__ ` guard in Task 6 Step 3 keeps `resolveFrField` honest so scaffolded stubs count as unfilled until translated.
- **Type consistency** — `FrOverrides`, `computeFrGaps`, `collectFrGap`, `resolveFrField`, `mergeStubs` share the `entityType → id → field` shape throughout.
- **Open risk to validate during execution:** importing `fetchFrData.ts` from an `.mjs` script relies on `tsx`. If `tsx` resolution of a `.ts` import from `.mjs` misbehaves, the fallback is to rename `checkFrCoverage.mjs` → `checkFrCoverage.ts` and keep the `tsx` runner (no logic change). Confirm at Task 6 Step 7.

---

## Remaining phases (separate plans, written+executed after this one)

**Plan 2 — FR routing, pages, search, UI locale**
- `pages/fr/index.tsx`, `pages/fr/pokemon/[slug].tsx` (SSG mirror; `getStaticPaths` from the slug↔id map; `getStaticProps` builds an FR-augmented `IFullPokemon` via `resolveFrField`, incl. `typeLabels` map + `frName`).
- FR-augmented dataset assembly (`fetchAllPokemonsFr`, `fetchPokemonDetailsFrBySlug`) reusing Task 5's fetch + Task 2/3 resolution.
- `locales/fr.json` UI catalog (pane titles, Profile labels, search placeholder, intro/H1, filters, "Lv.", etc.).
- FR search: `frName` on `IBasicPokemon` (optional), accent/case-insensitive normalized match + English fallback; FR filtering hook.
- Language switcher (id↔slug map), no auto-redirect.

**Plan 3 — FR SEO/GEO**
- `Header` gains `alternates` (hreflang en/fr/x-default) + `ogLocale` props; FR pages emit reciprocal hreflang, self-canonical `/fr/pokemon/{slug}`, `og:locale=fr_FR`.
- `_document` sets `<html lang>` from `ctx.pathname` (`/fr*` → `fr`).
- GEO opening sentence incl. English name; localized `alt` ("Sprite de Bulbizarre"); FR BreadcrumbList `inLanguage:"fr"`.
- `scripts/generateSitemap.mjs`: emit `/fr/pokemon/{slug}` + `/fr`, annotated with reciprocal `xhtml:link` hreflang; verify `robots.txt` allows `/fr/` + GPTBot/ClaudeBot/PerplexityBot (already allow-all).
- Locale-scoped internal links (evolutions, same-type, adjacent numbers) resolved to `/fr/` slugs.
