# Image & Navigation Performance — Design

**Date:** 2026-06-18
**Status:** Approved for planning
**Stack:** Next.js 16.2.6 (Pages Router), React 19, `sharp` (already a dependency)

## Problem

On a normal network — and badly on slow 3G — two things happen on the home grid:

1. Hero images don't appear quickly (large PNGs, no prioritization, empty cards until pop-in).
2. Clicking a card does nothing until its image loads.

### Root cause

- The grid card navigates with `<div onClick={() => router.push(...)}>` (`ui/components/Pokemon/Pokemon.tsx`). Unlike the details page — which already uses `<Link prefetch>` for neighbours — the card prefetches **nothing**. On click, Next must *then* fetch the route chunk + static JSON.
- Images are self-hosted same-origin PNGs under `public/pokemon/`. The browser's ~6-connection-per-origin cap means the navigation fetch **queues behind in-flight image downloads** — so the click only "takes effect" once images free a connection. That is symptom #2.
- Plain `<img loading="lazy">` with no dimensions, modern format, prioritization, or placeholder is symptom #1.

## Scope

Four cohesive workstreams. `next/image` (Vercel Image Optimization) is **explicitly excluded** — it is metered/billed per transformation and would cost real money at ~1025 images. Its byte/format benefit is delivered for free by the build-time WebP migration below; its only unique remaining feature (blur placeholder) is replaced by a free type-color tint (C-lite).

### A. Card navigation → prefetched `<Link>`

- `ui/components/Pokemon/Pokemon.tsx`: replace `<div onClick={handleClick}>` with `<Link href={`${DETAILS}${id}`} prefetch>`; remove `useRouter` and `handleClick`.
- Pages Router auto-prefetches the route chunk + static JSON when the card enters the viewport (or on hover), so the click navigates near-instantly instead of racing image downloads.
- `Pokemon.module.css`: add an `:active` pressed state on the card for instant tap feedback.
- **Caveat (must be in verification):** `<Link>` prefetch is disabled in `next dev`; it only runs in a production build (`next build && next start`).

### B. Preload above-the-fold hero images (React 19 `ReactDOM.preload`)

- `pages/index.tsx`: after filtering, call `ReactDOM.preload(url, { as: "image", fetchPriority: "high" })` for the resolution-appropriate image URL of the first `POKEMON_STACK_SIZE` (12) cards. Implement as a small inline effect or `useImagePreload(pokemons, count)` hook. URL chosen via the same pixel-vs-HD logic as `usePokemonPic` (depends on `ResolutionContext`).
- `pages/details/[id].tsx`: replace the ad-hoc `new window.Image()` neighbour-warming (lines ~54–67) with `ReactDOM.preload`, for consistency and higher priority.

### C-lite. Type-color tint placeholder (free, zero payload)

- Reuse the primary-type color the card already computes (`cardColor` / `--type`) as a soft tint (light blur/shimmer) behind the hero image while it loads, then fade the image in on `load`.
- `ui/components/Pokemon/Pokemon.tsx`: add `useState` `loaded` flag + `onLoad` handler on the hero `<img>`; wrap the hero in a tinted container.
- `Pokemon.module.css`: tint container using `var(--type)`, image opacity transition on `loaded`.
- **No** per-image base64 LQIP — the home page ships all 1025 records in SSG props, so per-record blur data would add ~200–500 KB to the initial payload and work against the 3G goal. Type color is already in props (derived from `types`), so payload added is **0 bytes**.
- Scope: home grid card hero. (Details-page hero may adopt the same pattern later; not required here.)

### D. `preconnect` / `dns-prefetch` for third-party origins

Cross-origin scripts (Google AdSense, Google Analytics) compete for the connection budget on 3G. Same-origin images do **not** benefit from preconnect (already connected) — this targets the third parties, which is where the original "prefetch an origin" instinct pays off.

- `pages/_document.tsx` `<Head>` — static `<link>` hints (known at build time, earliest possible; static tags beat the ReactDOM API here):
  - `rel="preconnect"` → `https://pagead2.googlesyndication.com`, `https://www.googletagmanager.com`
  - `rel="dns-prefetch"` → `https://googleads.g.doubleclick.net`, `https://www.google-analytics.com`

### WebP migration (replace PNG, build-time, free)

All image URLs flow through `createImageUrl()` in `utils/pokemonFormatter/pokemonFormatter.ts`; the only hardcoded `.png` strings elsewhere are the details-page preload (rewritten in B). So the migration touches the download script + two code files.

- `scripts/downloadPokemonImages.mjs`: pipe fetched bytes through `sharp`:
  - `pixel` → `.webp({ lossless: true })` (flat-color sprites, zero quality loss, ~25–35% smaller)
  - `basic` / `full` → `.webp({ quality: 82 })` (HD art, visually near-identical, ~60–90% smaller)
  - Change `file()` extensions to `.webp`; keep idempotent skip (now on `.webp`). Update the header sync comment.
- `utils/pokemonFormatter/pokemonFormatter.ts`: `createImageUrl()` emits `.webp`.
- **One-time:** `rm -rf public/pokemon` locally; Vercel regenerates on next build (`public/pokemon/` is gitignored — the CDN is the source of truth, nothing committed to migrate).

## Sequencing

Two commits / phases within one spec:

1. **Phase 1 — A + B + C-lite + D** (code-only, small, immediately fixes the dead-click and perceived load).
2. **Phase 2 — WebP migration** (regenerates 3000+ assets; isolated commit so the asset churn is reviewable on its own).

## Verification (manual — perf/asset behavior, no automated tests)

Run a **production** build (`next build && next start`), DevTools throttled to **Slow 3G**:

1. Cards are clickable and navigation starts **before** the hero image finishes loading (A).
2. Network waterfall shows the first ~12 hero images fetched at high priority ahead of below-fold images (B).
3. Cards show a type-colored tint, then fade the image in on load (C-lite).
4. `preconnect` entries to the ad/analytics origins appear early in the waterfall (D).
5. After Phase 2: images are served as `.webp` with materially smaller transfer sizes; pixel art is byte-identical in appearance, HD art shows no perceptible quality loss.

## Out of scope

- `next/image` / Vercel Image Optimization (cost).
- Per-image LQIP base64 (payload).
- AVIF / `<picture>` multi-format negotiation (WebP alone is >97% supported; added complexity not justified).
- Details-page hero placeholder (optional follow-up).
