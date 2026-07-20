# French Localization — Plan 4: French Type Chart

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the French Type Chart at `/fr/type-interactions` (index) and `/fr/type-interactions/{fr-slug}` (the 18 types + 153 pairs), with **French type-slug URLs** (`feu-eau`), fully French display (type labels, matchup prose, headings, picker), reusing the English effectiveness logic (which stays keyed on English type names internally).

**Architecture:** A French-type-slug layer (`frTypeSlug`/`parseFrTypeSlug`) maps `feu-eau ↔ ["fire","water"]`; the effectiveness helpers (`matchupSummary`/`defendingRows`/`attackingRows`) are called with the English types as today. The shared display components (`TypeIntro`, `TypeMatchups`, `TypePicker`, `PokemonType` default variant) become locale-aware — English output byte-identical, French branch added. `TypeIntro`'s data-driven sentences get a French sentence builder.

**Tech Stack:** Next.js 16 Pages Router, React 19, TypeScript (strict), Vitest.

## Global Constraints

- **Full French, no English leak on `/fr/type-interactions*`** — type labels, matchup sentences, section headings, picker, empty/prompt text.
- **English output byte-identical** for `/type-interactions*` (the components are shared) — verify per task.
- **FR type-slug URLs**: French label → `slugify` → slug (`Feu`→`feu`, `Électrik`→`electrik`, `Ténèbres`→`tenebres`). Two-type combos sort by French slug and join with `-`. `getStaticPaths` uses `fallback:false`.
- **Effectiveness logic stays keyed on English type names.** `parseFrTypeSlug` returns ENGLISH types; never localize the internal type keys. `TypesColor`/icons stay English-slug-keyed.
- **EN `/type-interactions` URLs and pages never change.**
- Reuse: `FR_TYPE_LABELS`, `slugify`, `useLocale`/`useStrings`/`UI_STRINGS`, `constants/Types.ts`, `utils/pokemonTypes/matchups.ts`, `FR_TYPE_INTERACTIONS` route.
- Repo uses **Yarn** (`yarn add`/`yarn install`; never npm — see the yarn memory). `npx tsc --noEmit` 0 errors. Vitest `*.test.ts`. French copy placeholder for Mickael's review; all UI strings in locale files.

---

### Task 1: French type-slug layer

**Files:**
- Create: `utils/frTypeSlug.ts`
- Test: `utils/frTypeSlug.test.ts`
- Reference: `utils/typeSlug.ts` (English mirror), `constants/FrTypeLabels.ts`, `constants/Types.ts`, `utils/slugify.ts`.

**Interfaces (all pure):**
- `frTypeSlug(engType: string): string` — `slugify(FR_TYPE_LABELS[engType])` (e.g. `"electric"`→`"electrik"`, `"fire"`→`"feu"`).
- `engTypeFromFrSlug(frSlug: string): string | null` — reverse lookup over the 18 types.
- `toFrTypeSlug(engTypes: string[]): string` — `engTypes.map(frTypeSlug).sort().join("-")`.
- `parseFrTypeSlug(frSlug: string): string[]` — split on `-`, map each part via `engTypeFromFrSlug`, return the ENGLISH types (sorted for canonical order) or `[]` if any part is invalid or >2 parts.
- `allFrTypeSlugs(): string[]` — the 18 single French slugs + all 153 French pair slugs (mirror `allTypeSlugs`).

- [ ] **Step 1: Failing tests**

```ts
// utils/frTypeSlug.test.ts
import { describe, it, expect } from "vitest";
import { frTypeSlug, engTypeFromFrSlug, toFrTypeSlug, parseFrTypeSlug, allFrTypeSlugs } from "./frTypeSlug";
describe("frTypeSlug layer", () => {
  it("maps english type → french slug", () => {
    expect(frTypeSlug("fire")).toBe("feu");
    expect(frTypeSlug("electric")).toBe("electrik");
    expect(frTypeSlug("dark")).toBe("tenebres");
  });
  it("reverses french slug → english type", () => {
    expect(engTypeFromFrSlug("feu")).toBe("fire");
    expect(engTypeFromFrSlug("electrik")).toBe("electric");
    expect(engTypeFromFrSlug("nope")).toBeNull();
  });
  it("round-trips a two-type combo, sorted by french slug, returning english types", () => {
    const slug = toFrTypeSlug(["water", "fire"]); // feu, eau → sorted "eau-feu"
    expect(slug).toBe("eau-feu");
    expect(parseFrTypeSlug(slug)).toEqual(["fire", "water"].sort());
  });
  it("rejects invalid or oversized slugs", () => {
    expect(parseFrTypeSlug("feu-eau-plante")).toEqual([]);
    expect(parseFrTypeSlug("feu-xyz")).toEqual([]);
  });
  it("allFrTypeSlugs has 18 singles + 153 pairs = 171", () => {
    expect(allFrTypeSlugs()).toHaveLength(171);
  });
});
```

- [ ] **Step 2–5:** verify fail → implement (build a `frSlug→eng` reverse map once from the 18 `constants/Types.ts` values via `frTypeSlug`) → verify pass + `tsc` → commit `feat(fr): French type-slug layer (feu-eau ↔ english types)`.

---

### Task 2: French matchup-intro sentence builder + localize `TypeIntro`

**Files:**
- Create: `utils/pokemonTypes/frMatchupIntro.ts`
- Test: `utils/pokemonTypes/frMatchupIntro.test.ts`
- Modify: `ui/components/TypeMatchups/TypeIntro.tsx` (make locale-aware)
- Modify: `locales/uiStrings.ts` (+ keep key-parity test green) — add `typeChartLandingTitle` ("Pokémon Type Interactions" / "Interactions de types Pokémon").
- Reference: `utils/pokemonTypes/matchups.ts` (`matchupSummary` returns `{weakTo, resists, immuneTo, strongAgainst}` as English type arrays).

**Interfaces:**
- `frFormatList(items: string[]): string` — `"A, B et C"` (French "et"; single → itself; empty → "").
- `frMatchupIntro(label: string, summary: { weakTo: string[]; resists: string[]; immuneTo: string[]; strongAgainst: string[] }, typeLabel: (t: string) => string): { title: string; paragraph: string }` — PURE. `label` is the already-localized "Feu / Eau" heading label; `typeLabel` maps an english type → French label. Produces the French title (`` `${label} — Faiblesses & Résistances` ``) and the French paragraph mirroring the EN three-sentence structure:
  - defense: weakTo → `Les Pokémon ${label} subissent des dégâts super efficaces de la part des types ${frFormatList(weakTo.map(typeLabel))}.` else `Les Pokémon ${label} n'ont pas de faiblesse de type commune.`
  - guard: `résistent à ${…}` / `sont immunisés contre ${…}` joined → `Ils ${parts.join(" et ")}.` (empty → "")
  - offense: strongAgainst → `En attaque, leur meilleure couverture est contre ${…}.` else `En attaque, ils n'ont pas de couverture super efficace.`
  - Return paragraph = `` `${defense} ${guard} ${offense}`.replace(/\s+/g," ").trim() ``.

**`TypeIntro` change:** use `useLocale()`. When `fr`: landing `<h1>` = `strings.typeChartLandingTitle`; selected → build `label = selected.map((t) => FR_TYPE_LABELS[t] ?? capitalizeFirstLetter(t)).join(" / ")` and render `frMatchupIntro(...)`'s title/paragraph. When `en`: EXACT current behavior (unchanged output).

- [ ] **Step 1:** Failing tests for `frFormatList` + `frMatchupIntro` (assert French connectors, type labels applied, no-weakness/no-coverage branches). **Step 2–5:** implement, localize `TypeIntro`, verify EN branch byte-identical, `tsc`+suite green, commit `feat(fr): French type-matchup intro sentences + localized TypeIntro`.

---

### Task 3: Localize `TypeMatchups`, `TypePicker`, `PokemonType` default variant

**Files (modify — locale-aware; EN output identical):**
- `ui/components/TypeMatchups/TypeMatchups.tsx` — headings "Defending"/"Attacking", the two descriptions (`Damage ${combo} takes from…` / `deals to…`), "Only neutral matchups for this selection.", "Select a type (or two) above to see its matchups." → `strings.*`. `combo` label and each row's `capitalizeFirstLetter(type)` → French labels on `/fr`.
- `ui/components/TypePicker/TypePicker.tsx` — "Type(s)", "select up to 2", chip labels → `strings.*`/French labels; and **locale-aware navigation**: on `fr`, `hrefFor` targets `${FR_TYPE_INTERACTIONS}/${toFrTypeSlug(next)}` (else `${TYPE_INTERACTIONS}/${toTypeSlug(next)}`).
- `ui/components/PokemonType/PokemonType.tsx` — the DEFAULT variant (line ~60) `capitalizeFirstLetter(type)` → `locale === "fr" ? (FR_TYPE_LABELS[type] ?? capitalizeFirstLetter(type)) : capitalizeFirstLetter(type)` (mirror the filter-variant fix already there). Icons/colors stay slug-keyed.
- `locales/uiStrings.ts` — add: `typeChartDefending`("Defending"), `typeChartAttacking`("Attacking"), `typeChartDefendingDesc`/`typeChartAttackingDesc` (these embed `${combo}` — store as functions? No — store the fixed fragments and compose in-component: keep the EN string shape, e.g. `typeChartDefendingDescA`="Damage ", `…B`=" takes from each attacking type, worst matchups first." OR simpler: store full templates and interpolate `${combo}` in the component with `.replace('{combo}', combo)`). Use the `{combo}` placeholder approach: `typeChartDefendingDesc`="Damage {combo} takes from each attacking type, worst matchups first." (fr: "Dégâts subis par {combo} de la part de chaque type attaquant, pires en premier."), `typeChartAttackingDesc` likewise, `typeChartNeutralOnly`, `typeChartPrompt`, `typePickerLabel`("Type(s)"), `typePickerHint`("select up to 2"). Keep EN values byte-identical to the current literals; keep key-parity test green.

- [ ] Localize each component via `useStrings()`/`useLocale()`; French type labels via `FR_TYPE_LABELS`. Verify EN output byte-identical per component (grep). `tsc`+suite green. Commit `feat(fr): localize TypeMatchups/TypePicker/PokemonType default variant`.

> This closes the Plan-2 residual (PokemonType default variant English leak).

---

### Task 4: French Type Chart index `/fr/type-interactions`

**Files:**
- Create: `pages/fr/type-interactions/index.tsx`
- Reference (mirror): `pages/type-interactions/index.tsx`.

Mirror the EN index with: French `Header` title/description placeholders + `canonicalPath` = `selected.length ? \`/fr/type-interactions/${toFrTypeSlug(selected)}\` : "/fr/type-interactions"`; drop `breadcrumbJsonLd` + leave a `{/* Plan 6: hreflang/og:locale/breadcrumb */}` marker; render the (now locale-aware) `TypeIntro`/`TypePicker`/`TypeMatchups`. The `selected` types still come from `usePokemonTypesFromQuery()` (English type query) — the picker navigates to FR combo pages. `tsc`+suite green; do NOT run full build. Commit `feat(fr): French type-chart index /fr/type-interactions`.

---

### Task 5: French combo page `/fr/type-interactions/[combo]`

**Files:**
- Create: `pages/fr/type-interactions/[combo].tsx`
- Reference (mirror): `pages/type-interactions/[combo].tsx`.

- `getStaticPaths`: `allFrTypeSlugs().map((combo) => ({ params: { combo } }))`, `fallback:false`.
- `getStaticProps`: `const types = parseFrTypeSlug(params.combo); if (!types.length) return { notFound: true }; return { props: { combo: params.combo, types } };` (`types` are ENGLISH for the effectiveness logic).
- Page: French `Header` title/description using the French label (`types.map((t) => FR_TYPE_LABELS[t]).join(" / ")`); `canonicalPath = \`/fr/type-interactions/${combo}\``; drop breadcrumb + Plan-6 marker; render locale-aware `TypeIntro`/`TypePicker`/`TypeMatchups` with `selected={types}`.
- `tsc`+suite green; DONE_WITH_CONCERNS acceptable (full build deferred). Commit `feat(fr): French type-chart combo page /fr/type-interactions/[combo]`.

---

## Self-Review
- FR type-slug layer → T1. French matchup sentences + TypeIntro → T2. TypeMatchups/TypePicker/PokemonType default + strings → T3 (closes Plan-2 default-variant leak). FR index → T4. FR combo pages → T5.
- Cross-task: `toFrTypeSlug`/`parseFrTypeSlug`/`allFrTypeSlugs` (T1) used by T3 (picker nav) + T4/T5 (routing). `frMatchupIntro` (T2) used by `TypeIntro`. EN output identity guarded per component.
- Known follow-up (Plan 6): full hreflang/canonical/og:locale/breadcrumb over `/fr/type-interactions*`.

## Depends on / feeds
- Depends on Plan 2 (`FR_TYPE_LABELS`, `useLocale`, `FR_TYPE_INTERACTIONS`, `slugify`).
- Feeds Plan 6 (SEO over `/fr/type-interactions*`; sitemap FR type slugs).
