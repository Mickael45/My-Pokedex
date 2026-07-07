# French Localization — Plan 3: French Pokémon Detail Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 1025 French detail pages at `/fr/pokemon/{slug}` — SSG mirrors of the English detail page, fully French (name, genus/category, flavor text, ability names, type labels, stat/pane labels, evolution chain with French names + slug links, French prev/next).

**Architecture:** `getStaticPaths` enumerates slugs from Plan 2's memoized `buildFrSlugMaps`. `getStaticProps` resolves slug→id, fetches the English full Pokémon (reusing `fetchPokemonDetailsByNameOrId`) plus the species/abilities, and augments it with French fields via Plan 1's extractors + `resolveFrField`. The page is a faithful mirror of `pages/details/[id].tsx` with French display swaps. All French type text uses the static `FR_TYPE_LABELS`; stat labels use `FR_STAT_LABELS`; chrome/pane strings come from the `UI_STRINGS` dict (French branch).

**Tech Stack:** Next.js 16 Pages Router, React 19, TypeScript (strict), Vitest, PokéAPI v2.

## Global Constraints

- **No English may leak onto a `/fr/` page** — including type-effectiveness grid labels, ability names, pane titles, "Lv." prefix, prev/next.
- French fields resolve **PokéAPI fr → `locales/fr-overrides.json` → throw** (`resolveFrField`). The prebuild coverage gate guarantees presence; page-level resolution is the backstop.
- `types` stays an English-slug CSV (effectiveness/icon/color key); French type text is display-only via `FR_TYPE_LABELS[slug] ?? capitalizeFirstLetter(slug)`.
- **English `pages/details/[id].tsx` and `/details/{id}` URLs never change.**
- Detail slugs are Plan 1 `slugify` name-slugs; `getStaticPaths` uses `fallback: false` (mirror the English SSG model).
- Reuse: `buildFrSlugMaps` (Plan 2 — extend to also return `idToFrName`), `FR_TYPE_LABELS`, `FR_STAT_LABELS`, `useStrings`/`UI_STRINGS`, `resolveFrField`, `extractorsFr`, `fetchPokemonDetailsByNameOrId`.
- Cache aggressively; build-time fetch only. Repo type-checks tests (strict) — `npx tsc --noEmit` 0 errors. Vitest `*.test.ts`. `--legacy-peer-deps`.
- French copy placeholder for Mickael's review; all UI strings in `locales/uiStrings.ts`.

---

### Task 1: Extend `buildFrSlugMaps` with `idToFrName` + detail dataset types

**Files:**
- Modify: `services/fetchPokemons/fetchPokemonsFr.ts` (`buildFrSlugMaps` returns `idToFrName` too)
- Modify: `types/Pokemon.d.ts` (optional FR fields on `IFullPokemon` + `IEvolutionStage`)
- Test: `services/fetchPokemons/buildFrSlugMaps.test.ts` is not feasible (network) — instead unit-test any pure helper you extract; otherwise this task's verification is `tsc` + the Task 2 pure augment test.

**Interfaces:**
- `buildFrSlugMaps(): Promise<{ slugToId: Record<string,number>; idToSlug: Record<number,string>; idToFrName: Record<number,string> }>` — the species fetch already resolves each fr name to build slugs, so expose it as `idToFrName` (no extra fetch).
- `IFullPokemon` gains: `frName?: string; frCategory?: string; frDescription?: string; frAbilities?: string[];`
- `IEvolutionStage` gains: `frName?: string; slug?: string;`

- [ ] **Step 1:** Add the optional fields to `types/Pokemon.d.ts` (`IFullPokemon` and `IEvolutionStage`). Optional so English producers stay valid.
- [ ] **Step 2:** In `buildFrSlugMaps`, while iterating species to build `{id, frName}` entries, also accumulate `idToFrName[id] = frName`; return it alongside the maps. Keep the module-memoization.
- [ ] **Step 3:** `npx tsc --noEmit` 0 errors; `npm test` green (no behavior change to existing tests).
- [ ] **Step 4:** Commit `feat(fr): buildFrSlugMaps exposes idToFrName; FR fields on IFullPokemon/IEvolutionStage`.

---

### Task 2: FR detail dataset assembly (`fetchPokemonDetailFrBySlug` + pure augment)

**Files:**
- Modify: `services/fetchPokemons/fetchPokemonsFr.ts` (add the functions)
- Test: `services/fetchPokemons/augmentFull.test.ts`
- Reference: `services/fetchPokemons/fetchPokemons.ts` (`fetchPokemonDetailsByNameOrId`, local `request`), `utils/pokemonFormatter/extractorsFr.ts`, `utils/fr/resolveFrField.ts`.

**Interfaces:**
- `augmentFullWithFr(enFull: IFullPokemon, species: SpecieFr, abilityFrNames: string[], maps: { idToFrName: Record<number,string>; idToSlug: Record<number,string> }, overrides: FrOverrides): IFullPokemon` — PURE, testable. Returns `enFull` plus:
  - `frName` = `resolveFrField({entityType:"names", id:String(enFull.id), field:"name", apiValue: extractPokemonNameFr(species), overrides})`
  - `frCategory` = `resolveFrField({entityType:"category", id, field:"text", apiValue: extractPokemonCategoryFr(species), overrides})`
  - `frDescription` = `resolveFrField({entityType:"flavorText", id, field:"text", apiValue: extractPokemonDescriptionFr(species), overrides})`
  - `frAbilities` = `abilityFrNames` (already resolved by the caller, one per visible ability, in the same order as `enFull.abilities`)
  - `evolutionChain` = each stage mapped to `{...stage, frName: maps.idToFrName[stage.id], slug: maps.idToSlug[stage.id]}`
- `fetchPokemonDetailFrBySlug(slug: string): Promise<{ pokemon: IFullPokemon; prevSlug: string | null; nextSlug: string | null }>` — build-time: `maps = await buildFrSlugMaps()`; `id = maps.slugToId[slug]`; `enFull = await fetchPokemonDetailsByNameOrId(String(id))`; fetch `pokemon-species/{id}` (for the fr fields) and each visible ability's fr name (`/ability/{slug}` → `names[] fr` → `resolveFrField({entityType:"abilities", id: abilitySlug, field:"name", ...})`); call `augmentFullWithFr`; compute `prevSlug=maps.idToSlug[id-1] ?? null`, `nextSlug=maps.idToSlug[id+1] ?? null`.

> Ability slugs: refetch `pokemon/{id}` (or reuse the one `fetchPokemonDetailsByNameOrId` fetched — simplest is a small extra fetch) to get `abilities[].ability.name` filtered to `!is_hidden`, in the same order the EN `abilities` string array was built (see `extractAbilitiesFromPokemon`).

- [ ] **Step 1: Failing test (pure augment)**

```ts
// services/fetchPokemons/augmentFull.test.ts
import { describe, it, expect } from "vitest";
import { augmentFullWithFr } from "./fetchPokemonsFr";
const enFull = {
  id: 1, name: "bulbasaur", category: "Seed", description: "A strange seed.",
  abilities: ["Overgrow"], evolutionChain: [{ id: 1, name: "bulbasaur" }, { id: 2, name: "ivysaur" }],
  types: "grass,poison", stats: [], weaknesses: [], defensiveEffectiveness: [], offensiveEffectiveness: [],
  height: 7, weight: 69, pixelImageUrl: "", hdImageUrl: "",
} as unknown as IFullPokemon;
const species = {
  names: [{ language: { name: "fr" }, name: "Bulbizarre" }],
  genera: [{ language: { name: "fr" }, genus: "Pokémon Graine" }],
  flavor_text_entries: [{ language: { name: "fr" }, version: { name: "scarlet" }, flavor_text: "Une graine FR." }],
} as any;
const overrides = { names: {}, flavorText: {}, category: {}, abilities: {}, typeLabels: {}, statLabels: {} };
const maps = { idToFrName: { 1: "Bulbizarre", 2: "Herbizarre" }, idToSlug: { 1: "bulbizarre", 2: "herbizarre" } };

describe("augmentFullWithFr", () => {
  it("attaches resolved fr name/category/description/abilities and localizes the evolution chain", () => {
    const r = augmentFullWithFr(enFull, species, ["Engrais"], maps, overrides);
    expect(r.frName).toBe("Bulbizarre");
    expect(r.frCategory).toBe("Graine");
    expect(r.frDescription).toBe("Une graine FR.");
    expect(r.frAbilities).toEqual(["Engrais"]);
    expect(r.evolutionChain[1]).toMatchObject({ id: 2, frName: "Herbizarre", slug: "herbizarre" });
  });
  it("throws when a required fr field is missing from both API and overrides", () => {
    const noFr = { ...species, flavor_text_entries: [{ language: { name: "en" }, version: { name: "red" }, flavor_text: "x" }] };
    expect(() => augmentFullWithFr(enFull, noFr, ["Engrais"], maps, overrides)).toThrow();
  });
});
```

- [ ] **Step 2–5:** verify fail → implement `augmentFullWithFr` (pure) + `fetchPokemonDetailFrBySlug` (network, mirror the retry pattern) → verify pass + `tsc` → commit `feat(fr): FR detail dataset assembly (fetchPokemonDetailFrBySlug + augmentFullWithFr)`.

---

### Task 3: French detail pane/label strings + French EvolutionStage

**Files:**
- Modify: `locales/uiStrings.ts` (+ `locales/uiStrings.test.ts` stays green) — add detail keys
- Create: `ui/components/EvolutionStage/EvolutionStageFr.tsx`
- Reference: `ui/components/EvolutionStage/EvolutionStage.tsx` (mirror; reuse its CSS module), `pages/details/[id].tsx` (for the exact EN pane strings).

**Add these `UiStrings` keys (EN = the exact current detail-page strings; FR = placeholder):**
`detailPokedexEntry` ("Pokedex entry"), `detailBaseStats` ("Base stats"), `detailProfile` ("Profile"), `detailTypeEffectiveness` ("Type effectiveness"), `detailDamageTaken` ("Damage taken"), `detailDamageDealt` ("Damage dealt"), `detailEvolution` ("Evolution"), `detailHeight` ("Height"), `detailWeight` ("Weight"), `detailCategory` ("Category"), `detailAbilities` ("Abilities"), `detailPrev` ("< Prev"), `detailNext` ("Next >"), `detailLevelPrefix` ("Lv.").
Suggested FR: "Description Pokédex", "Statistiques de base", "Profil", "Efficacité des types", "Dégâts subis", "Dégâts infligés", "Évolution", "Taille", "Poids", "Catégorie", "Talents", "< Préc.", "Suiv. >", "Niv.".

**`EvolutionStageFr`** mirrors `EvolutionStage` with: `stage.frName ?? capitalizeFirstLetter(stage.name)` as the label, `href` = `${FR_POKEMON}${stage.slug}`, `img alt` = `` `${stage.frName ?? stage.name}-pic` ``. Reuse `EvolutionStage.module.css`.

- [ ] Add keys to both locale branches; keep key-parity test green. Create `EvolutionStageFr`. `tsc` 0 errors; `npm test` green. Commit `feat(fr): French detail pane strings + French EvolutionStage`.

---

### Task 4: French detail page `/fr/pokemon/[slug]`

**Files:**
- Create: `pages/fr/pokemon/[slug].tsx`
- Reference (mirror): `pages/details/[id].tsx`.

**`getStaticPaths`:** `const { slugToId } = await buildFrSlugMaps(); paths = Object.keys(slugToId).map((slug) => ({ params: { slug } })); return { paths, fallback: false }`.
**`getStaticProps`:** `const { pokemon, prevSlug, nextSlug } = await fetchPokemonDetailFrBySlug(params.slug); return { props: { ...pokemon, prevSlug, nextSlug } }`.

**Page mirrors `pages/details/[id].tsx`** with these swaps (props type = `IFullPokemon & { prevSlug: string|null; nextSlug: string|null }`, and use `useStrings()` for pane labels):
- Display name/H1/title/alt → `frName ?? name`.
- Category → `frCategory`; description → `frDescription`; abilities → `frAbilities.map(...).join(", ")`.
- All type text (type chips + both effectiveness grids' `capitalizeFirstLetter(type)`) → `FR_TYPE_LABELS[type] ?? capitalizeFirstLetter(type)`. KEEP `TypeIcon type={type}` + color vars slug-keyed.
- Stat labels → the FR page's stats come from the EN `stats: IPokemonStat[]` whose `.label` is the English label; map each through `FR_STAT_LABELS[stat.label] ?? stat.label`.
- Pane titles / Profile labels / "Damage taken/dealt" / "Evolution" / Height / Weight / Category / Abilities → `strings.detail*`.
- Evolution: render `EvolutionStageFr` and the step label `stage.level ? \`${strings.detailLevelPrefix} ${stage.level}\` : "→"`.
- Prev/Next: link to `${FR_POKEMON}${prevSlug}` / `${FR_POKEMON}${nextSlug}` (disabled when null); labels `strings.detailPrev`/`strings.detailNext`. Keep the `ReactDOM.preload` neighbour-warming but it can keep pixel/full image preloads keyed by neighbour id (compute neighbour id from prev/next slug via… simplest: keep preload keyed on current `id` ± 1 exactly as EN, images are id-based).
- `Header`: French title `` `${frName} (#${formatNumberToMatchLength(id)}) — Stats, Types, Faiblesses & Évolution | Pokédex` ``, French description placeholder, `canonicalPath={\`/fr/pokemon/${slug}\`}` (slug available via `idToSlug` or pass it in props — add `slug` to props from `getStaticProps`), and a `{/* Plan 6: hreflang/og:locale/canonical/breadcrumb JSON-LD + GEO opener + localized alt */}` marker (do NOT implement full SEO here).
- Footer suppression: `_app`'s `isDetailPage` already includes `/fr/pokemon/[slug]` (added in Plan 2 SearchInput work? — verify; if `_app.tsx:32` only checks `/details/[id]`, ADD `|| pathname === "/fr/pokemon/[slug]"` so the FR detail page doesn't get a double footer).

**Steps:**
- [ ] Add `slug` to `getStaticProps` props (from `params.slug`) for the canonical.
- [ ] Verify/patch `_app.tsx` footer suppression for the FR detail route.
- [ ] Create the page.
- [ ] `npx tsc --noEmit` 0 errors; `npm test` green. Do NOT run full `next build` (coverage gate). DONE_WITH_CONCERNS acceptable; note deferred build.
- [ ] Commit `feat(fr): French detail page /fr/pokemon/[slug]`.

---

## Self-Review (against Plan-3 scope)
- `idToFrName` + FR type fields → Task 1. FR detail assembly (fr name/genus/flavor/abilities + localized evolution) → Task 2. Pane strings + FR EvolutionStage → Task 3. FR detail page (all type text via FR_TYPE_LABELS, no English leak) → Task 4.
- **Closes** the Plan-2 residual: the detail page renders all type text via `FR_TYPE_LABELS` (the effectiveness grids + chips), so no English type names on FR detail. (The `PokemonType` DEFAULT variant leak, if it exists, is a Type-Chart/Plan-4 concern — the detail page renders types inline, not via `PokemonType`.)
- **Cross-task types:** `frName?/frCategory?/frDescription?/frAbilities?` on `IFullPokemon`, `frName?/slug?` on `IEvolutionStage` (Task 1) consumed by Tasks 2/3/4. `prevSlug/nextSlug/slug` are page props, not on the shared type.
- Known follow-up (Plan 6): full hreflang/canonical/og:locale/breadcrumb/GEO opener/localized alt — markers left in place.

## Depends on / feeds
- Depends on Plan 1 (extractors/resolveFrField/overrides) + Plan 2 (`buildFrSlugMaps`, `FR_TYPE_LABELS`, `FR_STAT_LABELS`, `UI_STRINGS`, `FR_POKEMON`).
- Feeds Plan 6 (language switcher uses `idToSlug`; SEO over `/fr/pokemon/*`).
