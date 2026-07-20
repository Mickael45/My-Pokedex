# French Localization — Plan 2: Locale Infra + Localized Chrome + FR Pokédex Index

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the French locale foundation — a type-checked UI-strings dictionary + `useLocale` detection, make the shared global chrome (nav/search/filter/sort/footer/placeholder) render French on `/fr/` routes without touching English output, assemble the FR-augmented card dataset with name-slugs, and ship the **French home page** (`/fr`) with a French card grid and accent-insensitive French search.

**Architecture:** A single typed dictionary `UI_STRINGS: Record<Locale, UiStrings>` (EN values byte-identical to today's copy) is read at runtime by shared components via `useLocale()` (route-based: `/fr*` → `fr`). FR pages are a separate route tree that fetch FR data at build (reusing Plan 1's extractors + `resolveFrField` backstop). `types` stays an English-slug CSV; French type text is a display-time label lookup resolved once per build (module-memoized). This plan delivers the working `/fr` index; FR detail pages are Plan 3.

**Tech Stack:** Next.js 16 Pages Router, React 19, TypeScript (strict, `**/*.ts` type-checked incl. tests), Vitest (`*.test.ts`, jsdom), PokéAPI v2.

## Global Constraints

- **Full-site French under `/fr/`. No English may ever leak onto a `/fr/` page — including shared chrome** (nav, search, filter, sort, footer, cookie button, empty placeholder).
- **EN output must be byte-identical to today.** The dictionary's `en` values are the exact current strings; making a component locale-aware must not change what the English site renders. Verify per Task with a focused check.
- **`Locale = "en" | "fr"`**, detected by `useRouter().pathname.startsWith("/fr")`. No IP/Accept-Language auto-redirect anywhere.
- **FR detail URLs are name-slugs** `/fr/pokemon/{slug}` (slug from Plan 1's `slugify`/`buildSlugIdMap`). FR home cards link there. EN URLs (`/details/{id}`, `/`) NEVER change.
- **`types` stays an English-slug CSV** (`"grass,poison"`) — effectiveness/color/icon key. French type text is display-only via a label map.
- **French data resolves PokéAPI fr → `locales/fr-overrides.json` → throw** (`resolveFrField`, Plan 1). The prebuild coverage gate guarantees presence; page-level `resolveFrField` is the backstop.
- **Reuse Plan 1 modules:** `utils/slugify.ts`, `utils/pokemonFormatter/extractorsFr.ts`, `utils/fr/resolveFrField.ts`, `constants/FrStatLabels.ts`, `services/fetchPokemons/fetchFrData.ts`.
- **Cache aggressively; build-time fetch only.** Module-memoize any per-build shared fetch (e.g. type labels) so 1025 pages don't refetch.
- **Test conventions:** pure TS utils/hooks → Vitest `*.test.ts`; `npx tsc --noEmit` must stay 0 errors. Production origin `https://www.my-pokedex.com`; `npm install` uses `--legacy-peer-deps`.
- French copy in this plan is placeholder for Mickael's review; keep every FR UI string in `locales/uiStrings.ts` (the `fr` branch).

---

### Task 1: Locale detection + typed UI-strings dictionary

**Files:**
- Create: `constants/Locale.ts` (the `Locale` union + route prefix)
- Create: `locales/uiStrings.ts` (`UiStrings` type + `UI_STRINGS`)
- Create: `hooks/useLocale.ts` (`useLocale`, `useStrings`)
- Test: `hooks/useLocale.test.tsx`, `locales/uiStrings.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = "en" | "fr"`; `FR_PREFIX = "/fr"`
  - `type UiStrings = { …one field per UI string… }` (see below)
  - `UI_STRINGS: Record<Locale, UiStrings>` — TS enforces both locales define every key.
  - `localeFromPathname(pathname: string): Locale` (pure; `/fr` or `/fr/...` → `"fr"`, else `"en"`)
  - `useLocale(): Locale` (uses `useRouter().pathname`)
  - `useStrings(): UiStrings` (returns `UI_STRINGS[useLocale()]`)

**The `UiStrings` keys (initial set — one per hardcoded English string found in the shared chrome + home; extend in later tasks as needed):**
`navPokedex`, `navTypeChart`, `searchPlaceholder`, `filterByType`, `cookieSettings`, `sortLabel` (+ any sort option labels — read `ui/components/ListSortingDropdown` during Task 4), `footer…` (read `ui/components/Footer/Footer.tsx`), `emptyList`, `homeTitleH1`, `homeIntro`. Give `en` the exact current strings and `fr` the French equivalent (placeholder, Mickael reviews).

- [ ] **Step 1: Write failing tests**

```tsx
// hooks/useLocale.test.tsx
import { describe, it, expect, vi } from "vitest";
import { localeFromPathname } from "./useLocale";

describe("localeFromPathname", () => {
  it("returns fr for /fr and any /fr/* route", () => {
    expect(localeFromPathname("/fr")).toBe("fr");
    expect(localeFromPathname("/fr/pokemon/bulbizarre")).toBe("fr");
    expect(localeFromPathname("/fr/type-interactions")).toBe("fr");
  });
  it("returns en for root and English routes", () => {
    expect(localeFromPathname("/")).toBe("en");
    expect(localeFromPathname("/details/[id]")).toBe("en");
    expect(localeFromPathname("/frobnicate")).toBe("en"); // /fr not followed by / or end
  });
});
```

```ts
// locales/uiStrings.test.ts
import { describe, it, expect } from "vitest";
import { UI_STRINGS } from "./uiStrings";

describe("UI_STRINGS", () => {
  it("defines identical key sets for en and fr", () => {
    expect(Object.keys(UI_STRINGS.fr).sort()).toEqual(Object.keys(UI_STRINGS.en).sort());
  });
  it("has no empty french values", () => {
    for (const [k, v] of Object.entries(UI_STRINGS.fr)) expect(v, k).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- hooks/useLocale.test.tsx locales/uiStrings.test.ts` → FAIL (modules missing).

- [ ] **Step 3: Implement.** Note the `/fr` boundary must not match `/frobnicate`:

```ts
// constants/Locale.ts
export type Locale = "en" | "fr";
export const FR_PREFIX = "/fr";
```

```ts
// hooks/useLocale.ts
import { useRouter } from "next/router";
import { Locale, FR_PREFIX } from "../constants/Locale";
import { UI_STRINGS, UiStrings } from "../locales/uiStrings";

export const localeFromPathname = (pathname: string): Locale =>
  pathname === FR_PREFIX || pathname.startsWith(`${FR_PREFIX}/`) ? "fr" : "en";

export const useLocale = (): Locale => localeFromPathname(useRouter().pathname);
export const useStrings = (): UiStrings => UI_STRINGS[useLocale()];
```

```ts
// locales/uiStrings.ts  (EN = current exact strings; FR = placeholder, Mickael reviews)
import { Locale } from "../constants/Locale";

export type UiStrings = {
  navPokedex: string;
  navTypeChart: string;
  searchPlaceholder: string;
  filterByType: string;
  cookieSettings: string;
  emptyList: string;
  homeTitleH1: string;
  homeIntro: string;
  // extend in later tasks (sort labels, footer, detail pane titles…)
};

export const UI_STRINGS: Record<Locale, UiStrings> = {
  en: {
    navPokedex: "Pokédex",
    navTypeChart: "Type Chart",
    searchPlaceholder: "Search a Pokemon by name or id",
    filterByType: "Filter Pokémon by type",
    cookieSettings: "Cookie settings",
    emptyList: "No Pokemon Found...",
    homeTitleH1: "Pokédex",
    homeIntro:
      "Search every Pokémon by name or National Pokédex number, filter the list by type, and open any entry for its base stats, type weaknesses and resistances, abilities and full evolution line.",
  },
  fr: {
    navPokedex: "Pokédex",
    navTypeChart: "Table des types",
    searchPlaceholder: "Rechercher un Pokémon par nom ou numéro",
    filterByType: "Filtrer les Pokémon par type",
    cookieSettings: "Paramètres des cookies",
    emptyList: "Aucun Pokémon trouvé...",
    homeTitleH1: "Pokédex",
    homeIntro:
      "Recherchez chaque Pokémon par nom ou numéro du Pokédex National, filtrez la liste par type, et ouvrez une fiche pour ses statistiques de base, faiblesses et résistances de type, talents et chaîne d'évolution complète.",
  },
};
```

- [ ] **Step 4: Verify pass** — `npm test -- hooks/useLocale.test.tsx locales/uiStrings.test.ts` PASS; `npx tsc --noEmit` 0 errors.
- [ ] **Step 5: Commit** — `git add constants/Locale.ts locales/uiStrings.ts hooks/useLocale.ts hooks/useLocale.test.tsx locales/uiStrings.test.ts && git commit -m "feat(fr): locale detection + typed UI-strings dictionary"`

---

### Task 2: Search-normalization util + French-aware name filter

**Files:**
- Create: `utils/normalizeSearch.ts`
- Modify: `utils/pokemonTypes/filtering.ts` (`filterPokemonsByName`)
- Test: `utils/normalizeSearch.test.ts`, `utils/pokemonTypes/filtering.frName.test.ts`

**Interfaces:**
- Consumes: `IBasicPokemon` (extended with optional `frName` in Task 3 — this task only reads `pokemon.frName` if present).
- Produces: `normalizeSearch(s: string): string` (lowercase + strip diacritics, reuse the NFD approach from `slugify` but keep spaces — do NOT dash-collapse). `filterPokemonsByName` matches the query (normalized) against the **normalized English name AND normalized `frName` when present**, so `électhor`/`electhor` both match and English still matches as a fallback.

- [ ] **Step 1: Failing tests**

```ts
// utils/normalizeSearch.test.ts
import { describe, it, expect } from "vitest";
import { normalizeSearch } from "./normalizeSearch";
describe("normalizeSearch", () => {
  it("lowercases and strips accents, keeping spaces", () => {
    expect(normalizeSearch("Électhor")).toBe("electhor");
    expect(normalizeSearch("M. Mime")).toBe("m. mime");
    expect(normalizeSearch("BULBIZARRE")).toBe("bulbizarre");
  });
});
```

```ts
// utils/pokemonTypes/filtering.frName.test.ts
import { describe, it, expect } from "vitest";
import { filterPokemonsByName } from "./filtering";
const mons = [
  { id: 145, name: "zapdos", frName: "Électhor" },
  { id: 1, name: "bulbasaur", frName: "Bulbizarre" },
] as unknown as IBasicPokemon[];
describe("filterPokemonsByName (fr-aware)", () => {
  it("matches accent-stripped French name", () => {
    expect(filterPokemonsByName(mons, "electhor").map((m) => m.id)).toEqual([145]);
    expect(filterPokemonsByName(mons, "élec").map((m) => m.id)).toEqual([145]);
  });
  it("still matches the English name as fallback", () => {
    expect(filterPokemonsByName(mons, "bulba").map((m) => m.id)).toEqual([1]);
  });
});
```

- [ ] **Step 2: Verify failure.**
- [ ] **Step 3: Implement.**

```ts
// utils/normalizeSearch.ts
export const normalizeSearch = (s: string): string =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
```
> Write the diacritic class as the explicit escape `/[̀-ͯ]/g` (U+0300–U+036F), not literal combining chars.

```ts
// utils/pokemonTypes/filtering.ts — replace filterPokemonsByName
import { normalizeSearch } from "../normalizeSearch";
export const filterPokemonsByName = (pokemons: IBasicPokemon[], value: string) => {
  const q = normalizeSearch(value);
  const matches = (pokemon: IBasicPokemon) =>
    normalizeSearch(pokemon.name).includes(q) ||
    (pokemon.frName ? normalizeSearch(pokemon.frName).includes(q) : false);
  return pokemons.filter(matches);
};
```
(Leave `filterPokemonsByTypes`/`filterPokemonsById` unchanged.)

- [ ] **Step 4: Verify pass** + `tsc` 0 errors. Also run the existing filtering tests if any, to confirm EN behavior (substring match) is preserved — normalized English substring match is a superset of the old `name.includes`.
- [ ] **Step 5: Commit** — `git commit -m "feat(fr): accent-insensitive French-aware name search"`

---

### Task 3: `IBasicPokemon` FR fields + FR card dataset assembly

**Files:**
- Modify: `types/Pokemon.d.ts` (add optional `frName?: string`, `slug?: string` to `IBasicPokemon`)
- Create: `services/fetchPokemons/fetchPokemonsFr.ts`
- Test: `services/fetchPokemons/augmentFr.test.ts`
- Reference: `services/fetchPokemons/fetchPokemons.ts` (mirror `fetchAllPokemons`), `utils/slugify.ts`, `utils/pokemonFormatter/extractorsFr.ts`, `utils/fr/resolveFrField.ts`.

**Interfaces:**
- Produces:
  - `augmentBasicWithFr(basic: IBasicPokemon, species: SpecieFr, slug: string, overrides: FrOverrides): IBasicPokemon` — PURE; returns `{...basic, frName: resolveFrField(...names...), slug}`. Testable core.
  - `fetchAllPokemonsFr(): Promise<IBasicPokemon[]>` — build-time: like `fetchAllPokemons`, additionally resolves `frName` and computes `slug` for each (uses `buildSlugIdMap` over all fr names for the collision guard, then attaches each slug).
  - `buildFrSlugMaps(): Promise<{ slugToId: Record<string,number>; idToSlug: Record<number,string> }>` — build-time slug↔id map (memoized module-level so Plan 3's `getStaticPaths` and the Task-7 home share one fetch).

- [ ] **Step 1: Failing test (pure core)**

```ts
// services/fetchPokemons/augmentFr.test.ts
import { describe, it, expect } from "vitest";
import { augmentBasicWithFr } from "./fetchPokemonsFr";
const basic = { id: 1, name: "bulbasaur", types: "grass,poison", pixelImageUrl: "", hdImageUrl: "", stats: [45,49,49,45] } as IBasicPokemon;
const species = { names: [{ language: { name: "fr" }, name: "Bulbizarre" }], genera: [], flavor_text_entries: [] } as any;
describe("augmentBasicWithFr", () => {
  it("attaches resolved frName and slug", () => {
    const r = augmentBasicWithFr(basic, species, "bulbizarre", { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} });
    expect(r.frName).toBe("Bulbizarre");
    expect(r.slug).toBe("bulbizarre");
    expect(r.id).toBe(1);
  });
  it("throws when neither PokéAPI nor overrides has the fr name", () => {
    const noFr = { names: [{ language: { name: "en" }, name: "Bulbasaur" }], genera: [], flavor_text_entries: [] } as any;
    expect(() => augmentBasicWithFr(basic, noFr, "x", { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} })).toThrow();
  });
});
```

- [ ] **Step 2: Verify failure.**
- [ ] **Step 3: Implement** (`augmentBasicWithFr` pure; `fetchAllPokemonsFr`/`buildFrSlugMaps` mirror `fetchAllPokemons`'s two-wave fetch, read `locales/fr-overrides.json`, use `extractPokemonNameFr` + `resolveFrField({entityType:"names", id, field:"name", apiValue, overrides})`, and `buildSlugIdMap` from `utils/slugify`). Memoize `buildFrSlugMaps` with a module-level `let cache`. Add `frName?`/`slug?` to `IBasicPokemon` in `types/Pokemon.d.ts`.
- [ ] **Step 4: Verify pass** + `tsc` 0 errors. (Network functions exercised at Task 7's build, not unit-tested.)
- [ ] **Step 5: Commit** — `git commit -m "feat(fr): FR card dataset assembly (frName + slug) with slug-map"`

---

### Task 4: French type-label resolution (build-memoized)

**Files:**
- Create: `utils/fr/typeLabels.ts`
- Test: `utils/fr/typeLabels.test.ts`
- Reference: `services/fetchPokemons/fetchFrData.ts` (`fetchFrRawDataset` fetches types; here fetch just `/type` fr), `utils/fr/resolveFrField.ts`.

**Interfaces:**
- Produces:
  - `resolveTypeLabels(typesRaw: Array<{name:string; names:Array<{language:{name:string};name:string}>}>, overrides: FrOverrides): Record<string,string>` — PURE; maps each English type slug → French label via `resolveFrField({entityType:"typeLabels", id: slug, field:"label", ...})`.
  - `getFrTypeLabels(): Promise<Record<string,string>>` — build-time, module-memoized (fetch the 18 real types once, resolve, cache), so 1025 detail pages (Plan 3) reuse one result.

- [ ] **Step 1: Failing test (pure)**

```ts
// utils/fr/typeLabels.test.ts
import { describe, it, expect } from "vitest";
import { resolveTypeLabels } from "./typeLabels";
const raw = [
  { name: "grass", names: [{ language: { name: "fr" }, name: "Plante" }] },
  { name: "fire", names: [{ language: { name: "en" }, name: "Fire" }] }, // no fr → needs override
];
describe("resolveTypeLabels", () => {
  it("uses PokéAPI fr, falls back to overrides", () => {
    const labels = resolveTypeLabels(raw, { typeLabels: { fire: { label: "Feu" } } } as any);
    expect(labels).toEqual({ grass: "Plante", fire: "Feu" });
  });
  it("throws when a type has neither fr nor override", () => {
    expect(() => resolveTypeLabels(raw, { typeLabels: {} } as any)).toThrow();
  });
});
```

- [ ] **Step 2–5:** verify fail → implement (`resolveTypeLabels` pure; `getFrTypeLabels` fetches `${POKE_API_URL}type`, filters out `unknown/shadow/stellar`, fetches each, resolves, memoizes) → verify pass + `tsc` → commit `feat(fr): French type-label resolution (memoized per build)`.

---

### Task 5: French Pokémon card

**Files:**
- Create: `ui/components/PokemonFr/PokemonFr.tsx`
- Reference (mirror, reuse its CSS module): `ui/components/Pokemon/Pokemon.tsx` + `Pokemon.module.css`.

**Interface:** `PokemonFr(props: IBasicPokemon & { typeLabels: Record<string,string>; priority?: boolean })`. Same markup/behavior as `Pokemon`, with these EXACT swaps:
- Import French deps: `FR_PREFIX` route (`/fr/pokemon/${slug}`), `FR_STAT_LABELS`.
- Link `href` → `/fr/pokemon/${props.slug}` (not `/details/${id}`).
- Display name → `props.frName ?? props.name`; `title` likewise; `img alt` → `` `${props.frName} artwork` `` (localized alt refined in Plan 6).
- Type chips: render `typeLabels[type] ?? type` instead of the raw English `{type}` (keep `TypeIcon type={type}` and the color vars keyed by the English slug — icons/colors stay slug-keyed).
- Stat rows: labels via `FR_STAT_LABELS` — the card shows Attack/Defense/Speed; render `FR_STAT_LABELS["Attack"]` etc. (keep the values).
- Evo badge `title` → `` `Évolue de ${evolvesFrom.name}` `` (evolvesFrom French name refinement deferred; English pre-evo name acceptable on a hover title for now — note as a known follow-up).

**Steps:** No unit test (presentational; verified via Task 7 home render + Plan 6 leak grep). Create the component; `npx tsc --noEmit` 0 errors; visual parity is verified when the home page renders in Task 7. Commit `feat(fr): French Pokémon card`.

---

### Task 6: Localize the shared global chrome

**Files (modify — replace hardcoded English with `useStrings()` values; EN dictionary values are identical so English output is unchanged):**
- `ui/components/NavigationBar/NavigationBar.tsx` — tabs `navPokedex`/`navTypeChart`; drawer/sheet heading `filterByType`; `cookieSettings`; and **locale-aware routing**: when locale is `fr`, the Pokédex tab/logo/bottom-tab link to `/fr` and the Type Chart tab links to `/fr/type-interactions` (EN → `HOME`/`TYPE_INTERACTIONS` as today). Derive locale via `useLocale()`.
- `ui/components/SearchInput/SearchInput.tsx` — `placeholder={strings.searchPlaceholder}`; on submit push to `/fr` when locale is `fr` (else `HOME`); the `isOnDetailsPage` check must also treat `/fr/pokemon/[slug]` as a details page.
- `ui/components/Footer/Footer.tsx` — route its visible strings through new `UiStrings` keys (add them in Task 1's dict as you enumerate them here).
- `ui/components/TypesSelector/TypesSelector.tsx` — any visible label via strings (the type option labels can use Task 4's `typeLabels` on `/fr`, or keep icons; enumerate on read).
- `ui/components/ListSortingDropdown/ListSortingDropdown.tsx` — sort option labels via strings.
- `ui/components/EmptyListPlaceholder/EmptyListPlaceholder.tsx` — if it renders a default English string, route via `emptyList` (the home passes `text` explicitly; make the FR home pass `strings.emptyList`).

**Interfaces consumed:** `useLocale`, `useStrings` (Task 1); `FR_PREFIX`.

**Steps:**
- [ ] Add every newly-enumerated string to `UiStrings` + both locale branches in `locales/uiStrings.ts` (keep the `uiStrings.test.ts` key-parity test green).
- [ ] Make each component read from `useStrings()` / `useLocale()`; keep EN values identical.
- [ ] **EN-unchanged check:** build or render an English route and confirm the chrome text is byte-identical to `git show HEAD:<file>` expectations — concretely, grep the changed components to confirm no English string was altered (only relocated into the `en` dict). Report the check.
- [ ] `npm test` green; `npx tsc --noEmit` 0 errors.
- [ ] Commit `feat(fr): localize shared navigation/search/footer/filters chrome`.

> This task touches live English components. Work carefully, follow existing patterns, and do not restructure beyond string/route localization.

---

### Task 7: French home page `/fr`

**Files:**
- Create: `pages/fr/index.tsx`
- Reference (mirror): `pages/index.tsx`.

**Interface:** `getStaticProps` = `{ pokemons: await fetchAllPokemonsFr(), typeLabels: await getFrTypeLabels() }`. Page mirrors `pages/index.tsx` with these swaps:
- Render `PokemonFr` (passing `typeLabels`) instead of `Pokemon`.
- H1 = `strings.homeTitleH1`, intro = `strings.homeIntro`, empty placeholder text = `strings.emptyList` (via `useStrings()`).
- Seed `PokemonContext` with the FR pokemons exactly as the EN home does (so `useFiltering` filters the FR list; Task 2 made name search fr-aware).
- `Header` title/description: French placeholder now (`"Pokédex en français — stats, types, faiblesses, évolutions"` / a French description); full SEO (hreflang, canonical, og:locale, JSON-LD) is Plan 6 — leave a `// Plan 6: hreflang/canonical/og:locale` marker.
- `canonicalPath="/fr"` for now.

**Steps:**
- [ ] Create the page.
- [ ] **Build-run the FR home** to exercise the live FR fetch: `npx next build` will run its `getStaticProps` — but the prebuild coverage gate currently fails on 127 untranslated stubs. So instead verify this page in isolation: run `npm run dev` is heavy; simplest is a focused build-time smoke via a temporary script OR confirm types + rely on Plan 6's full build. At minimum: `npx tsc --noEmit` 0 errors, and a `node`/`tsx` smoke that imports `fetchAllPokemonsFr` for a tiny id range if practical. Report exactly what you verified.
- [ ] `npm test` green.
- [ ] Commit `feat(fr): French home page /fr with localized grid and search`.

> DONE_WITH_CONCERNS is acceptable if the full `next build` can't be run because of the (intended) coverage gate — the controller will run an integration build once stubs are filled or the gate is temporarily bypassed for verification.

---

## Self-Review (against Plan-2 scope)

- Locale detection + typed dict (EN byte-identical) → Task 1. Accent-insensitive fr search + EN fallback → Task 2. FR card data (frName+slug) → Task 3. FR type labels (memoized) → Task 4. FR card → Task 5. Localized shared chrome (no English leak) → Task 6. FR home page → Task 7.
- **Cross-task types:** `frName?`/`slug?` added to `IBasicPokemon` (Task 3) are read by Task 2's filter, Task 5's card, Task 7's page. `typeLabels: Record<string,string>` flows Task 4 → Task 5/7. `useLocale`/`useStrings` (Task 1) consumed by Tasks 5–7.
- **Known follow-ups (not Plan 2 defects):** evolvesFrom hover title uses English pre-evo name (localize in Plan 3 when evolution carries frName); localized `alt`/full SEO is Plan 6; FR Type Chart / legal pages are Plans 4–5.
- **Risk to watch:** Task 6 edits shared English components — the EN-unchanged check is the guard; if any `en` value drifts, treat as a failed task.

## Depends on / feeds
- Depends on Plan 1 (extractors, slugify, resolveFrField, overrides, coverage gate).
- Feeds Plan 3 (reuses `buildFrSlugMaps`, `getFrTypeLabels`, `PokemonFr`, locale dict), Plan 6 (SEO over `/fr` + language switcher using the slug maps).
