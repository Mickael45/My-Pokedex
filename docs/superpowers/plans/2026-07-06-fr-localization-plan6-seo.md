# French Localization — Plan 6: SEO / GEO Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the ~1200 French pages discoverable and rankable: reciprocal hreflang (en/fr/x-default) on every EN and FR page, `<html lang="fr">` + `og:locale=fr_FR` on `/fr/`, self-canonical (already present), a GEO opening sentence with the English name on FR detail pages, localized image alt, French BreadcrumbList JSON-LD, an FR-annotated sitemap, a language switcher, and stripping the redundant English data from the FR pages' `__NEXT_DATA__`.

**Architecture:** `Header` gains `alternates` (hreflang) + `ogLocale` props. `_document` sets `<html lang>` from `ctx.pathname`. Each page computes its counterpart URL where the id/slug is known (detail pages via the slug map; homes/type-chart deterministically) and passes reciprocal alternates. A `tsx`-based sitemap generator emits EN + FR URLs with `xhtml:link` alternates.

**Tech Stack:** Next.js 16 Pages Router, React 19, TypeScript (strict), Vitest, Yarn.

## Global Constraints

- **EN visible output byte-identical.** Adding hreglang/alternate `<link>`s to EN pages changes only `<head>`, never body. Verify per task.
- **hreflang set on EVERY page:** `en` → English URL, `fr` → French URL, `x-default` → English URL. Absolute URLs (via `absoluteUrl`).
- **`<html lang="fr">` and `og:locale=fr_FR` ONLY on `/fr/*`;** English stays `en`/`en_US`.
- **Self-canonical unchanged** (each page already passes its own `canonicalPath`; the numeric EN detail canonicals to `/details/{id}`, FR to `/fr/pokemon/{slug}`).
- **No IP/Accept-Language auto-redirect.** The switcher is manual.
- **`types` stays English-slug-keyed;** GEO/alt text uses French labels.
- Reuse: `Header`, `absoluteUrl`/`SITE_ORIGIN`, `buildFrSlugMaps` (id↔slug), `FR_TYPE_LABELS`, `frTypeSlug`/`toTypeSlug`, `useLocale`, `UI_STRINGS`.
- Repo uses **Yarn**. `npx tsc --noEmit` 0 errors. Vitest `*.test.ts`. Do NOT run full `next build` (coverage gate) — verify via tsc + suite + targeted scoped checks. French copy placeholder for Mickael.

---

### Task 1: `Header` — hreflang alternates + `og:locale` props

**Files:** Modify `ui/components/Header/Header.tsx`; Test `ui/components/Header/Header.test.tsx` (create).
**Interface:** add props `alternates?: Array<{ hrefLang: string; href: string }>` and `ogLocale?: string` (default `SITE_LOCALE`). Render, inside `<Head>`: for each alternate a `<link rel="alternate" hrefLang={a.hrefLang} href={absoluteUrl(a.href)} />`; change the `og:locale` meta to use `ogLocale`. EN pages that pass no `alternates` render none (byte-identical to today) until Task 3 wires them.
- [ ] TDD: render `Header` with `alternates=[{hrefLang:"fr",href:"/fr"}]` + `ogLocale="fr_FR"` (jsdom + `next/head` — assert via a render test or extract a pure `buildAlternateLinks` helper and unit-test that). Simpler: extract `alternateLinkTags(alternates)` pure helper returning the `{hrefLang, href}` absolutized list; unit-test it; use it in the component. Verify EN (no alternates, default ogLocale) output unchanged. tsc + suite green. Commit `feat(fr): Header hreflang alternates + og:locale prop`.

---

### Task 2: `_document` — per-locale `<html lang>`

**Files:** Modify `pages/_document.tsx`.
**Change:** in `getInitialProps`, read `ctx.pathname` (the route pattern, e.g. `/fr/pokemon/[slug]`); compute `lang = ctx.pathname === "/fr" || ctx.pathname.startsWith("/fr/") ? "fr" : "en"`; pass it through `initialProps`. In `render()`, `<Html lang={(this.props as any).lang ?? "en"}>`. Everything else in `_document` UNCHANGED (consent scripts, metas, etc.).
- [ ] Verify EN routes still get `lang="en"` and `/fr*` get `lang="fr"` (reason about `ctx.pathname`; add a small unit test of the pure `langForPathname` helper you extract). tsc + suite green. Commit `feat(fr): <html lang> per locale via _document ctx.pathname`.

> Reuse `localeFromPathname` from `hooks/useLocale` if it can be imported without pulling React-router into `_document` — otherwise a tiny local `langForPathname`.

---

### Task 3: Wire reciprocal hreflang + og:locale into all pages

**Files:** Modify `pages/index.tsx`, `pages/fr/index.tsx`, `pages/details/[id].tsx`, `pages/fr/pokemon/[slug].tsx`, `pages/type-interactions/index.tsx` + `[combo].tsx`, `pages/fr/type-interactions/index.tsx` + `[combo].tsx`. Reference: `utils/frTypeSlug.ts`, `utils/typeSlug.ts`, `buildFrSlugMaps`.

For each page, pass `alternates=[{hrefLang:"en", href: <EN url>}, {hrefLang:"fr", href: <FR url>}, {hrefLang:"x-default", href: <EN url>}]`, and FR pages also pass `ogLocale="fr_FR"`:
- Homes: EN `/`, FR `/fr`.
- **EN detail** `pages/details/[id].tsx`: needs the FR slug for its id. Add `buildFrSlugMaps()` in `getStaticProps`, pass `frSlug = idToSlug[id]` as a prop; alternates fr = `/fr/pokemon/${frSlug}`, en = `/details/${id}`. (Adds a build-time fetch to the EN build; visible EN output unchanged — only head links added.)
- **FR detail**: en = `/details/${id}`, fr = `/fr/pokemon/${slug}` (both already known in props — `id` + `slug`).
- Type-chart index: EN `/type-interactions`, FR `/fr/type-interactions` (+ if a type is selected, the combo variants via `toTypeSlug`/`toFrTypeSlug`).
- Type-chart combo: EN `/type-interactions/${enCombo}`, FR `/fr/type-interactions/${frCombo}`. Convert between them: EN page has english types → `toFrTypeSlug`; FR page has english `types` → `toTypeSlug` for the EN alternate and `params.combo` for FR.

- [ ] Per page, wire the alternates (and `ogLocale` on FR). Verify EN pages' VISIBLE output unchanged (only head alternate links added); confirm each page's fr/en/x-default triple is correct and reciprocal (the EN page's fr href === the FR page's self canonical, and vice-versa). tsc + suite green. Commit `feat(fr): reciprocal hreflang (en/fr/x-default) + og:locale across all pages`.

---

### Task 4: GEO opener + localized alt + French BreadcrumbList (FR detail)

**Files:** Modify `pages/fr/pokemon/[slug].tsx`; Create `utils/fr/geoIntro.ts` + test; Modify `utils/structuredData.ts` (add `breadcrumbJsonLd` `inLanguage` support or a `frBreadcrumbJsonLd`); Create `constants/Generations.ts` + test.

- `generationFromId(id): number` (`constants/Generations.ts`) via the 9 id ranges (1-151…906-1025); `frGenerationOrdinal(gen): string` → "1re", "2e"…"9e". TDD.
- `geoIntroFr({ frName, enName, frTypes, gen })` (`utils/fr/geoIntro.ts`, PURE, TDD) → `` `${frName} (anglais : ${enName}) est un Pokémon de type ${frTypes.join("/")} de la ${frGenerationOrdinal(gen)} génération.` ``. `frTypes` are the French labels.
- FR detail page: render the GEO sentence as the FIRST paragraph of the Pokédex-entry pane (or a lead `<p>` right under the H1) — it must be in the server HTML. Uses `enName = name` (the EN name prop), `frName`, `frTypes = types.split(",").map(FR_TYPE_LABELS)`, `gen = generationFromId(id)`.
- Image alt: change the hero `img alt` and card evolution alts on FR detail from `${frName} artwork` to `` `Sprite de ${frName}` `` (per spec) — or `Illustration de ${frName}` for the HD art; pick one and be consistent. (Mickael can adjust wording.)
- French BreadcrumbList: add back a `jsonLd` to the FR detail `Header` = a French breadcrumb `[{name:"Pokédex", path:"/fr"}, {name: frName, path:"/fr/pokemon/${slug}"}]` with `inLanguage:"fr"`. Extend `breadcrumbJsonLd` to accept an optional `inLanguage`.

- [ ] TDD the pure helpers; wire into the FR detail page; verify the GEO sentence + English name are in the rendered HTML (reason/scoped check). tsc + suite green. Commit `feat(fr): GEO opener with English name + localized alt + French BreadcrumbList`.

---

### Task 5: FR-annotated sitemap

**Files:** Modify `scripts/generateSitemap.mjs` → run via `tsx` so it can import `buildFrSlugMaps`/`allFrTypeSlugs`; update the `sitemap`/`prebuild` npm scripts to `tsx scripts/generateSitemap.mjs`. Modify `scripts/generateSitemap.test.mjs` accordingly.

- Emit EN URLs (unchanged) PLUS FR URLs: `/fr`, `/fr/pokemon/${slug}` for all ids (via `buildFrSlugMaps().idToSlug`), `/fr/type-interactions` + `allFrTypeSlugs()`, and the FR static pages (whatever exists — `/fr` for now; add legal FR pages in Plan 5).
- Annotate each URL with reciprocal `xhtml:link rel="alternate" hreflang="en|fr|x-default"` alternates (add the `xmlns:xhtml` namespace to `<urlset>`).
- Confirm `public/robots.txt` allows `/fr/` (it's allow-all) and GPTBot/ClaudeBot/PerplexityBot (allow-all covers them) — no change needed; note it.

- [ ] Update the generator + its test (the test may need to become async or mock the slug map — keep the pure URL-assembly helpers unit-testable; the live fetch is the generator's `main`). Run `yarn sitemap` (or `tsx scripts/generateSitemap.mjs`) once to confirm it emits FR URLs + hreflang (this does a ~1025-species fetch — expected). tsc + suite green. Commit `feat(fr): sitemap emits FR URLs with reciprocal hreflang`.

> Note: this adds a build-time species fetch to sitemap generation (for the slugs). Acceptable (build-time, fair-use). The weekly-rebuild CI (Plan 7) refreshes it.

---

### Task 6: Language switcher

**Files:** Create `ui/components/LanguageSwitcher/LanguageSwitcher.tsx`; integrate into `NavigationBar`; detail/combo pages provide their counterpart href via a small context or prop.

- Home: `/` ↔ `/fr` (from pathname). Type-chart: convert via `toTypeSlug`/`toFrTypeSlug` client-side (deterministic). Detail: the page passes its counterpart href (EN detail passes `frHref=/fr/pokemon/${frSlug}` from Task 3's prop; FR detail passes `enHref=/details/${id}`) into a `SwitchTargetContext` the switcher reads; fallback to the locale home when unknown.
- No auto-redirect; a simple FR/EN toggle link. AdSense snippets untouched.
- [ ] Build the switcher + context; wire the counterpart href from detail/combo pages; verify EN nav visible output unchanged except the added toggle (which appears on both locales). tsc + suite green. Commit `feat(fr): language switcher (same page, other locale; no auto-redirect)`.

---

### Task 7: Strip redundant English fields from FR page payloads

**Files:** Modify `services/fetchPokemons/fetchPokemonsFr.ts` (`fetchPokemonDetailFrBySlug`) + `fetchAllPokemonsFr`.
**Change:** the FR pages render only the FR fields, but the full EN `IFullPokemon` (incl. EN `description` = English flavor text, `name`, `category`, `abilities`) is serialized into `__NEXT_DATA__`. After augmenting, BLANK the EN-only fields that the FR page never reads — set `name`/`description`/`category` to `""` and `abilities` to `[]` on the returned FR object (the page uses `frName`/`frDescription`/`frCategory`/`frAbilities`), and blank the EN `name` on each evolution stage (the FR EvolutionStage uses `frName`). KEEP fields the FR page DOES use: `id`, `types`, `stats` (with EN `stat.label` — needed for the `FR_STAT_LABELS` lookup), images, `weaknesses`, `defensiveEffectiveness`, `offensiveEffectiveness`, `height`, `weight`, evolution `id`/`level`/`frName`/`slug`. Do the same for `fetchAllPokemonsFr` cards (blank EN `name` since the card uses `frName`; keep `types`/`stats`/images/`slug`/`frName`).
- [ ] Confirm (reason + a scoped build check like the earlier MAX=12 build, or a targeted grep of a rendered FR page) that the English flavor text no longer appears in `__NEXT_DATA__` and the FR page still renders correctly (frName/frDescription/etc. intact). Guard against the `frName ?? name` fallbacks now hitting `""` — since frName is always resolved (throws otherwise), the fallback never triggers, but double-check the card/detail/evolution render. tsc + suite green. Commit `feat(fr): strip redundant English fields from FR page payloads`.

> This is the integration-build finding. It removes English flavor text from FR hydration JSON and roughly halves the FR page payload.

---

## Self-Review
- Header hreflang+ogLocale → T1. `<html lang>` → T2. Reciprocal hreflang wiring (EN+FR) → T3. GEO+alt+breadcrumb → T4. Sitemap → T5. Switcher → T6. Payload strip → T7.
- Reciprocity check: every EN page's `fr` alternate === the corresponding FR page's self URL, and vice-versa (T3 verifies).
- EN visible output unchanged across T1/T2/T3/T7 (only head links / hydration JSON / non-rendered fields change).
- Known follow-up: Plan 5 (FR legal pages) adds their URLs to the sitemap + hreflang; Plan 7 weekly CI refreshes data/sitemap.

## Depends on / feeds
- Depends on Plans 1–4 (pages, slug maps, FR labels, locale layer).
- Feeds Plan 5 (legal pages inherit the hreflang/sitemap pattern) and Plan 7 (CI rebuilds the sitemap).
