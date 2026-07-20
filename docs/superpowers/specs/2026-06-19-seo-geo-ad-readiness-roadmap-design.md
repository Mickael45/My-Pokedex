# My-Pokedex — SEO/GEO + Ad-Readiness Roadmap

**Date:** 2026-06-19
**Status:** Approved (design) — to be executed phase-by-phase, each phase getting its own spec → plan → implementation cycle.
**Source of truth:** `../MASTER_SEO_COOKBOOK.md` (the local `SEO_COOKBOOK.md` is superseded and intentionally ignored).

## Goal

Maximize the site's organic + AI-answer-engine visibility and make it **ready to monetize with
AdSense** — all ad infrastructure prepared but **disabled** (`ADS_ENABLED=false`) until the owner
chooses to enable it. JobLens-style "no ads ever" does not apply here; this site is intended to carry
ads later. The Pokémon IP/copyright exposure (cookbook §13) is the top AdSense-rejection / DMCA risk
and is addressed across phases.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Scope | **Everything** — incl. i18n/hreflang and a content hub, sequenced as later phases. |
| Consent / CMP | **Google Funding Choices** ("Privacy & messaging", certified) + Consent Mode v2 wired in code. |
| Ad slots | **Flag-gated, placed, disabled** — CLS-safe `<AdSlot>` placed in layouts behind `ADS_ENABLED=false`. |
| IP risk | Cheap standard mitigation (disclaimer + factual lean) in the P0 gate; original-content shift rides along in the content-depth phase. |

## Current state (audited 2026-06-19)

The codebase is further along than the cookbook's per-site appendix (§17.4) suggests — that appendix
is stale. Re-confirmed by reading the code:

**Already done:** SSR detail pages (`pages/details/[id].tsx`, `getStaticProps`/`getStaticPaths`) with
real stats tables, evolution chains, and type-effectiveness grids in the HTML; type-interaction pages
(`pages/type-interactions/[combo].tsx`, 171 combos) with data-driven prose; per-page unique
`<title>`/`<meta description>`; self-referencing canonical; full OG tags + Twitter
`summary_large_image`; `theme-color`; full favicon/icon/manifest set; `ads.txt` (correct pub
`pub-3950888851778991` + TAG `f08c47fec0942fa0`); `robots.txt` + `sitemap.xml` (1,198 URLs);
`preconnect` to GTM; AdSense loader gated on consent.

**Gaps (this roadmap):** no legal/trust pages; no IP disclaimer; hand-rolled consent banner that does
**not** emit `gtag('consent', …)` Consent-Mode-v2 signals and **GA4 loads outside the consent gate**;
no rendered ad slots; no `max-image-preview:large` robots meta; **flat sitemap `lastmod`**; `WebSite`
schema still carries a (retired/inert) `SearchAction`; no image sitemap; raw `<img>` (no `next/image`,
no AVIF); bare `next.config.ts` (no headers/cache); thin per-page editorial depth; no content hub; no
i18n.

## Architecture principle

Head/SEO concerns are currently spread across `ui/components/Header/Header.tsx`, `pages/_document.tsx`,
and `utils/structuredData.ts`. As we add robots meta, per-page schema, and honest `lastmod`, consolidate
into small focused units rather than growing those files:
- a `seo/` helper for meta assembly,
- a `schema/` builder with one function per JSON-LD type,
- a single `config/ads.ts` module owning the `ADS_ENABLED` flag and slot config.

Each unit has one purpose, a clear interface, and is testable in isolation. No unrelated refactoring.

## Phases

Priority-ordered and independently shippable. AdSense application happens after **Phase 0** plus enough
of **Phase 3** content to clear the "low-value content" bar.

### Phase 0 — AdSense & Compliance Gate 🔴

Hard blockers; nothing else monetizes until these land.

1. **Legal/trust pages** — Privacy Policy (mandatory: discloses Google/third-party ad cookies + opt-outs
   via Google Ads Settings, aboutads.info, youronlinechoices.eu), About, Contact, Terms. Linked from
   the footer. Feed E-E-A-T.
2. **IP non-affiliation disclaimer** — visible footer line + About-page statement; nominative name use;
   state the site's value as the **computed factual data** (stat tables, type charts). (§13.)
3. **Certified consent** — adopt Google's free **Funding Choices / "Privacy & messaging"** CMP (owner
   does the AdSense-console setup); wire **Consent Mode v2** in code: deny-by-default `ad_storage`,
   `analytics_storage`, `ad_user_data`, `ad_personalization`, update on consent. **Fix the audit bug:
   bring GA4 under the consent gate** (it currently loads unconditionally).
4. **Flag-gated ad infrastructure** — CLS-safe `<AdSlot>` (reserved `min-height`, lazy below-fold) +
   `config/ads.ts` `ADS_ENABLED=false`; reserved slots placed in detail/type/home layouts rendering a
   placeholder while disabled. Add `preconnect` to `pagead2.googlesyndication.com`.

### Phase 1 — Technical SEO/GEO foundation 🟠

5. **Robots meta** `max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
6. **Honest `lastmod`** — per-page git-mtime dates (or omit); kill the flat date that makes Google
   distrust all lastmods.
7. **Drop `SearchAction`** from `WebSite` schema (Sitelinks Searchbox retired/inert); keep plain
   `WebSite`.
8. **Image sitemap** for sprite/artwork URLs.
9. **AI-crawler robots policy** documented in `robots.txt` (keep all *retrieval* bots allowed).
10. **`next/image` + AVIF** migration; `Cache-Control: immutable` on hashed + `/pokemon/*` assets;
    baseline security headers (HSTS) via `next.config`. **CSP authored last**, once ad origins are known.

### Phase 2 — Schema & GEO answer structure 🟡

11. **Answer-first blocks** — self-contained 40–60-word direct answer under a question-style heading on
    detail + type pages (RAG extraction).
12. **Populated entity schema** — `Dataset` for stat/type tables (Dataset Search + AI citation),
    `ItemList` for the home grid and type lists, `Article`/`BlogPosting` where prose justifies it.
    Populated, never bare.
13. **Outbound citations** to authorities + captioned, machine-readable reference tables.

### Phase 3 — Content depth & E-E-A-T 🟡 (also the stronger IP defense)

14. Original analysis/prose on detail + type pages beyond the templated sentence; visible
    author/publisher identity; "Last updated" dates tied to real `dateModified`. The thin/scaled-content
    defense *and* the AI-citation lever — and it shifts the site's value off the copyrighted images.

### Phase 4 — Content hub / blog 🟢

15. 15–25 genuinely useful articles, `BlogPosting` + visible author, RSS, internal links. Long-tail + AI
    citation surface.

### Phase 5 — i18n / hreflang 🟢 (biggest later multiplier)

16. Localized routes with bidirectional return tags + exactly one `x-default`; correct ISO codes. The
    biggest traffic multiplier, worth it once the base is solid.

## Sequencing logic

Phase 0 gates monetization. Phase 1 is cheap high-leverage crawl/GEO wins. Phases 2–3 compound AI
visibility and harden the IP posture. Phases 4–5 are growth multipliers once the foundation holds.

## Out of scope

Enabling live ads (owner flips the flag); higher-RPM ad networks (Ezoic/Mediavine/Raptive — traffic-
gated, far future); any change to the underlying Pokémon data pipeline.

## Verification per phase

Each phase's spec defines its own checks. Cross-cutting: `validator.schema.org` + Rich Results Test for
schema; rendered-HTML check (view-source / curl) that content is server-rendered; field CWV after any
image/ad change; Search Console + Bing Webmaster after deploy.

## Next step

Write the **Phase 0** implementation plan first (it is the monetization gate). Phases 1–5 each get their
own spec → plan when reached.
