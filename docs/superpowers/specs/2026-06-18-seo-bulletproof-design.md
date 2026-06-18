# Bulletproof SEO for My-Pokédex — Design

**Date:** 2026-06-18
**Branch:** `worktree-seo-bulletproof`
**Goal:** Make the site's SEO bulletproof to grow organic traffic (~200 visits/month → ~200/week) and prepare it for AdSense monetization.

## Context

Next.js 16 Pages Router app, statically generated (`getStaticProps`/`getStaticPaths`). 1,025 Pokémon detail pages are prerendered; a home page and a `/type-interactions` tool exist. Hosted on Vercel. GA + AdSense + Google site-verification already wired up.

The foundation is strong (real HTML via SSG, per-page `<title>` + `<meta description>` via a shared `Header` component). This work closes the remaining gaps.

### Canonical host decision

`www.my-pokedex.com` (with `www`) is canonical. Rationale: `robots`, `sitemap`, AdSense, and Google site-verification already point to `www`; www-vs-non-www is SEO-neutral, so switching would only cost a Search Console re-verification for no ranking benefit. Non-www → www (308) is enforced at the Vercel domain level (mark www primary), not in code.

## Goals

- Fix the silently-broken robots file.
- Eliminate duplicate-content ambiguity (canonical tags + single host).
- Make shared links render rich cards (Open Graph + Twitter).
- Add realistic structured data (breadcrumbs + sitelinks searchbox).
- Add ~171 indexable, keyword-targeted type pages.
- Keep the sitemap fresh and complete automatically.
- Sharpen titles, descriptions, and image alt text.

## Non-goals

- Dynamic OG image generation (using existing artwork instead — explicit user choice).
- Product/FAQ/HowTo rich-result markup. There is no clean schema.org type for a Pokémon, and Google restricted FAQ rich results to gov/health domains in 2023. We will not ship markup that cannot produce results.
- A test framework. The repo has none; verification is build + headless assertions (see Verification).

## Architecture

### 1. SEO config — `constants/Seo.ts`
Single source of truth so URLs never drift:
- `SITE_ORIGIN = "https://www.my-pokedex.com"`
- `SITE_NAME`, default title, default description, default share image path, `twitter` handle (if any), locale.
- Small helper `absoluteUrl(path)` → `SITE_ORIGIN + path`.

Every other module imports from here.

### 2. Upgraded SEO head (extend existing `ui/components/Header/Header.tsx`)
Keep the existing call sites and props (`title`, `description`); add optional props: `canonicalPath`, `image`, `ogType`, `jsonLd`. The component additionally emits:
- `<link rel="canonical" href={absoluteUrl(canonicalPath)} />`
- **Open Graph:** `og:title`, `og:description`, `og:url`, `og:image` (absolute), `og:type`, `og:site_name`, `og:locale`
- **Twitter:** `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- Optional `<script type="application/ld+json">` when `jsonLd` is provided
- A proper icon set replacing the lone `surprised-pikachu.png`: `favicon.ico`, `apple-touch-icon`, `theme-color` (existing font/icon preloads are preserved)

**Boundary:** pages pass plain data in; `Header` owns all `<head>` SEO output. A page never writes head tags directly.

**og:image strategy (reuse existing art):** detail pages pass the Pokémon's hosted HD artwork URL; home and type pages pass one hand-made banner added to `/public` (e.g. `/images/og-default.png`).

### 3. Structured data (JSON-LD)
Built by a small pure helper module `utils/structuredData.ts` (one function per schema, each returning a plain object the page hands to `Header`):
- **Home:** `WebSite` with `potentialAction` `SearchAction` (sitelinks searchbox) + `Organization`.
- **All content pages:** `BreadcrumbList`.
- **Detail page:** `BreadcrumbList` (Home › *Name*).
- **Type pages:** `BreadcrumbList` (Home › Type Interactions › *Type(s)*).

### 4. `robots.txt` fix
Rename `public/robot.txt` → `public/robots.txt`. Content: allow all, `Sitemap:` line pointing at the absolute sitemap URL. (Current filename is invisible to crawlers — highest-ROI single fix.)

### 5. Build-time sitemap generator — `scripts/generateSitemap.mjs`
Replaces the hand-maintained, stale (`2024-10-27`) `public/sitemap.xml`. Wired into `prebuild` and `predev` alongside the existing image downloader. Emits, with a fresh `lastmod`:
- `/`
- `/type-interactions`
- 1,025 detail pages (`/details/{id}`)
- **171 type pages** (18 singles + 153 alphabetical pairs)

Reuses the same Pokémon/type source data the app already uses so it can never drift from reality.

### 6. Indexable type pages — `pages/type-interactions/[combo].tsx`
New statically-generated route:
- `getStaticPaths` generates 18 single-type slugs (`fire`) + 153 alphabetical pair slugs (`fire-water`); `fallback: false`. Only the alphabetical order is generated, so there is exactly one canonical URL per matchup.
- `getStaticProps` computes the defending/attacking matchup data server-side (reusing `utils/pokemonTypes/effectiveness`) and passes it in — same visual rendering as today's `index.tsx`.
- Self-canonical; keyword-targeted `<title>`/description; `BreadcrumbList` JSON-LD; included in the sitemap.
- The interactive picker links to these canonical slug URLs. The existing `index.tsx` stays as the picker landing, canonical to `/type-interactions`; legacy `?types=` requests still render but canonicalize to the matching slug page (or to `/type-interactions` when nothing is selected).

### 7. Content / keyword polish
- **Home `<title>`:** `Pokédex — Search Every Pokémon by Type, Stats, Weakness & Evolution`; fix the stray newline/whitespace currently embedded in the home description string.
- **Detail `<title>`:** `{Name} (#{NNN}) — Stats, Types, Weaknesses & Evolution | Pokédex`.
- **Type page `<title>`:** `{Type} Type — Weaknesses, Resistances & Best Matchups | Pokédex` (and a paired-type variant).
- **alt text:** real descriptions (e.g. `Bulbasaur official artwork`) replacing `${name}-pic`. Audit the list-card `Pokemon` component alt too.

### 8. Host canonicalization (Vercel — config, not code)
Documented step: in Vercel domain settings mark `www.my-pokedex.com` primary so non-www → www returns 308; HTTPS is already enforced by Vercel. No code change.

## Data flow

```
constants/Seo.ts ──┐
                   ├─→ Header component ─→ <head> (canonical, OG, Twitter, JSON-LD, icons)
utils/structuredData.ts ─┘        ↑
                                  │ (title, description, canonicalPath, image, jsonLd)
pages/index.tsx ──────────────────┤
pages/details/[id].tsx ───────────┤
pages/type-interactions/[combo].tsx ─┘

source data (pokemons, types) ─→ scripts/generateSitemap.mjs ─→ public/sitemap.xml
                                 (prebuild/predev)
```

## Error handling / edge cases

- **Type slug parsing:** unknown or non-alphabetical-order slugs are not generated (`fallback: false` → 404). Picker only ever emits canonical slugs.
- **Pair de-duplication:** slugs are always lowercased and alphabetically ordered (`fire-water`, never `water-fire`) so a matchup has exactly one URL.
- **Absolute URLs:** OG/canonical/sitemap URLs always go through `absoluteUrl()`; never relative.
- **Single canonical per page:** verification asserts exactly one `<link rel="canonical">` per rendered page.
- **Sitemap drift:** generated from the same source data as the pages, at build time, so it cannot list pages that don't exist (or omit ones that do).

## Verification (no test framework in repo)

1. `next build` succeeds and prerenders the new `[combo]` pages.
2. Headless-Chrome / HTML assertions on one of each page type (home, detail, single-type, pair-type): exactly one canonical; valid OG + Twitter tags with absolute image URLs; parseable JSON-LD of the expected `@type`.
3. `public/robots.txt` exists and references the sitemap; `public/robot.txt` is gone.
4. `public/sitemap.xml` is well-formed XML and its URL count matches expected (2 + 1025 + 171).
5. Spot-check a generated type page renders the correct matchup data.
6. Post-merge: resubmit sitemap in Search Console; validate a sample URL in Google's Rich Results Test.

## Implementation order (high-impact first)

1. `robots.txt` rename (instant win).
2. `constants/Seo.ts` + `Header` upgrade (canonical/OG/Twitter) — unblocks every page.
3. Titles/descriptions/alt polish.
4. Structured data helper + wire into pages.
5. `[combo].tsx` type pages + picker links + legacy canonicalization.
6. Sitemap generator + wire into prebuild/predev.
7. Vercel primary-domain config (manual, documented).
8. Verification pass.
