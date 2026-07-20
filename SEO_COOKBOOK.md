# SEO / GEO Cookbook — My Pokédex

> # ⛔ SUPERSEDED — see [`../MASTER_SEO_COOKBOOK.md`](../MASTER_SEO_COOKBOOK.md)
> **Kept for history. Do not action the flagged claims below.** A cross-reference sweep across all
> five sibling cookbooks on **2026-06-19** re-verified every claim against primary sources. The
> following claims in THIS file were found **wrong or overstated** and are left in place for the record:
> - **[X1] "INP is the most-failed CWV in 2026" (§4) — ❌ FALSE.** Per CrUX, **LCP** is the most-failed; INP passes ~77% on mobile. Watch INP after ads, but it is not the top failure.
> - **[X2] "`Organization.logo` must be a crawlable raster ≥112×112 (PNG/JPG, square), not `.ico`" (§3) — ⚠️ OVERSTATED.** Google requires only **≥112×112 + a Google-Images-supported format**, and **SVG *is* supported**; square/raster are not requirements. (Avoiding a tiny `.ico` is still good advice.)
> - **[X4] "~83% of AI Overview citations come from outside top-10 / overlap collapsed to 17–38%" (§7, §13) — ⚠️ OVERSTATED.** The "~83% outside" / "~17%" figures are **BrightEdge's** (different methodology). The verified Ahrefs 2026 figure is **~38% top-10 / ~62% outside** (863K kw), and Ahrefs notes part of the drop is *improved citation parsing*, not purely Google behavior.
> - **[X3] Princeton GEO figures (§7) are imprecise** (the "+115%" is rank-5-specific, not a general lever; "+41/+28%" mix two metrics). Exact per-method numbers are in the master §6/§7.
>
> Everything else in this file — including the §10 Pokémon IP/copyright risk — was re-confirmed as correct and is carried into the master §13.

> A single source of truth for making this site maximally visible (Google + AI answer
> engines) and ready to monetize with AdSense. Every item is verified against
> **current 2025–2026** requirements — outdated advice (FAQ rich results, `llms.txt`,
> FID, `priority`/`changefreq`, **sitelinks `SearchAction`**, **the sitemap ping endpoint**)
> is explicitly called out so we don't waste effort on it.
>
> **Last re-verified: 2026-06-19** against live authoritative sources (web.dev, Google Search
> Central, AdSense Help, IAB Europe TCF docs, the Princeton GEO paper) **and** cross-referenced
> against the cookbooks of the four sibling sites (wordify-number, decimal-to-hexadecimal-converter,
> yo-mama-jokes, LinkedIn-JobLens-AI). Corrections made in this pass — and sibling-cookbook claims
> we *rejected* after verification (e.g. the "LCP tightened to 2.0s" myth) — are logged in **§13**.

**Legend**

| Mark | Meaning |
|------|---------|
| ✅ | Already implemented in this repo |
| ⚠️ | Partially done / needs improvement |
| ❌ | Missing — should add |
| 🚫 | Deprecated / proven useless in 2026 — **do not bother** |

**Status snapshot:** the *technical foundation* is strong (SSG, canonical, OG/Twitter,
JSON-LD, sitemap, consent-gated tags). The things blocking money and visibility today are:
**(1) no ad units on the page, (2) no legal pages, (3) no certified consent CMP, (4) thin /
"scaled" content risk on 1,025 generated pages, and (5) an unaddressed Pokémon IP/copyright
exposure.** Details below.

---

## 0. Scorecard at a glance

| Area | State |
|------|-------|
| Head / meta tags | ✅ Strong — missing only `max-image-preview` & author/publisher |
| Canonical / OG / Twitter | ✅ Complete |
| Structured data | ⚠️ Breadcrumb + WebSite + Organization only; no ItemList/ImageObject |
| Rendering (content in HTML) | ✅ SSG everywhere, no loader gate |
| Sitemap | ⚠️ 1,198 URLs, but no image entries + flat `lastmod` |
| robots.txt | ⚠️ Allows all, but no AI-crawler decisions |
| Core Web Vitals | ⚠️ Good hints; not using `next/image`; ad CLS risk |
| AdSense — ad units | ❌ Script loads, **zero `<ins>` slots** = no revenue |
| AdSense — legal pages | ❌ No privacy/about/contact/terms |
| Consent (EEA/UK) | ❌ Custom banner only — **no certified CMP / TCF v2.3 / Consent Mode v2** |
| Content depth / E-E-A-T | ⚠️ Thin home + scaled-content risk on detail pages |
| GEO / AI visibility | ⚠️ SSR is right; needs answer-first prose + crawler policy |
| i18n / hreflang | ❌ English only |
| **Pokémon IP / copyright** | ❌ **Unaddressed monetization risk — read §10** |

---

## 1. Crawlability & Indexing

| Item | Status | Current 2026 requirement / note | Action |
|------|--------|----------------------------------|--------|
| `robots.txt` exists + references sitemap | ✅ | `public/robots.txt` allows all, points to sitemap | — |
| XML sitemap | ✅ | `public/sitemap.xml`, 1,198 URLs (limit is 50,000 / 50 MB — fine) | — |
| Canonical on every page | ✅ | `Header.tsx:51`, self-referencing | — |
| Single `<h1>` per page, semantic HTML, `lang` | ✅ | `lang="en"` (`_document.tsx:12`); `<main>/<section>/<nav>` used | — |
| 404 returns proper status | ✅ | `pages/404.tsx` (Next sets 404 status correctly) | — |
| **`max-image-preview:large` meta robots** | ❌ | **Required for Google Discover large-image cards** and full image previews. Without it you get tiny thumbnails / are largely excluded from Discover | Add `<meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1">` site-wide in `Header.tsx` |
| **Image sitemap** | ❌ | `<image:image>` entries are supported and open Google Images traffic (perfect for a visual site with 1,025 sprites/artworks). May even point to cross-domain CDN images | Extend `scripts/generateSitemap.mjs` to emit `<image:image><image:loc>` per detail URL |
| **Honest `lastmod`** | ⚠️ | Every URL currently shares one hard-coded date (`2026-06-18`). Google **does** use `lastmod` — but only if "consistently and verifiably accurate." Fake/flat dates get the whole sitemap's dates ignored | Stamp `lastmod` from real per-entity data change, or drop it rather than fake it |
| `priority` / `changefreq` in sitemap | 🚫 | **Google ignores both entirely.** We correctly don't emit them — keep it that way | None (do not add) |
| AI-crawler directives in robots.txt | ❌ | See **§7 (GEO)** — decide explicitly which AI bots to allow | Add named `User-agent` blocks |
| Submit sitemap via Search Console / robots.txt | ✅/❌ | Sitemap is declared in `robots.txt` (correct). **Verify it's submitted in GSC** for coverage reporting | Confirm in Search Console |
| **Sitemap "ping" endpoint** (`google.com/ping?sitemap=…`) | 🚫 | **Removed June 2023** (most submissions were spam). HTTP pings to the old REST endpoint no longer work — only Search Console + the robots.txt declaration matter now. We don't ping — keep it that way | None (do not add) |
| **IndexNow** (instant Bing/Yandex/Seznam/Naver indexing) | ❌ optional | **Google does NOT support IndexNow** (confirmed 2026). But Bing & co. accept it (~billions of URLs/day) and **Bing's index feeds ChatGPT Search + Copilot** — so it's a cheap GEO/indexing hedge: host the key file, ping changed URLs on deploy | Low priority; add if pursuing Bing/ChatGPT reach |

---

## 2. Head / Meta Tags

| Tag | Status | Note | Action |
|-----|--------|------|--------|
| `<title>` (unique, per page) | ✅ | `Header.tsx:48`, descriptive templated titles | — |
| `meta description` (unique) | ✅ | `Header.tsx:50` | — |
| `meta viewport` | ✅ | `Header.tsx:49` | — |
| `canonical` | ✅ | `Header.tsx:51` | — |
| Open Graph (title/desc/url/image/type/site_name/locale + image dims) | ✅ | `Header.tsx:53–62` | — |
| Twitter Card | ⚠️ | `Header.tsx:64–68`. Detail pages use `summary` instead of `summary_large_image` (`details/[id].tsx:102`) — smaller share image | Switch detail pages to `summary_large_image` with a large artwork |
| `theme-color`, favicons, apple-touch-icon, manifest | ✅ | `Header.tsx:70–74` | — |
| `google-site-verification` (Search Console) | ✅ | `_document.tsx:25` | — |
| **`meta robots` with preview directives** | ❌ | See §1 — biggest single meta gap (Discover) | Add it |
| **Author / publisher / E-E-A-T meta** | ❌ | Helps trust signals & AdSense review | Add `author`/`publisher`, a visible byline, and "data sourced from PokéAPI" attribution |
| Bing / IndexNow verification | ❌ | Optional second search channel | Add Bing Webmaster verification if pursuing Bing/Copilot |

---

## 3. Structured Data (JSON-LD)

What we emit today (`utils/structuredData.ts`, injected via `Header`):

| Type | Status | Where |
|------|--------|-------|
| `WebSite` (site-name signal) | ✅ | home (`index.tsx:77`) — **keep**, still drives the site-name in results |
| ~~`WebSite` + `SearchAction` (sitelinks search box)~~ | 🚫 **corrected** | We emit `SearchAction`, but **Google removed the Sitelinks Searchbox starting Nov 21 2024** — the markup is now **inert** (no SERP box, but harmless / no GSC error). Earlier this file scored it as a feature ✅; that was wrong. Keep `WebSite` for the site-name; the `SearchAction`/`potentialAction` no longer earns anything | home |
| `Organization` (name/url/logo) | ✅ | home — but the **`logo` must be a crawlable raster ≥112×112 px (PNG/JPG, square), not a `.ico`**. Verify ours qualifies; add `sameAs[]` (socials/Wikipedia) + `contactPoint` to feed the Knowledge Graph |
| `BreadcrumbList` | ✅ | details, type-interactions, type combos |

What's missing / worth adding:

| Type | Status | Current 2026 value | Action |
|------|--------|--------------------|--------|
| `ImageObject` / image metadata | ❌ | Still produces image rich results / licensable signals; pairs with image sitemap | Add to detail pages for the artwork (creator/license/credit) |
| `ItemList` | ❌ | Describes the home Pokémon grid / category lists to Google | Add to home + any listing pages |
| `Dataset` | ⚠️ optional | Eligible for **Google Dataset Search** — a stat-table site is a natural fit | Consider for detail pages (stats as a dataset) |
| Visible breadcrumb **UI** | ❌ | We emit `BreadcrumbList` JSON-LD but render no on-page trail. Schema should match a visible element; also a UX/internal-link win | Render a real breadcrumb nav on detail & combo pages |
| **`FAQPage`** | 🚫 *for rich results* / ⚠️ *for AI* | **Google removed FAQ rich results on May 7, 2026** — it no longer earns SERP space. It is still valid markup and still helps AI engines extract Q&A. **Do not add it expecting rich snippets**; add Q&A as real on-page prose first (that helps GEO regardless — see §7) | Write real Q&A prose; schema optional, low priority |
| `HowTo` and 7 other types (Book/ClaimReview/Salary/etc.) | 🚫 | Retired by Google (2023 / June 2025) | Don't bother |

> **Populate fully or omit.** Rich, complete schema helps AI engines recognize entities and
> reduces hallucination, but **bare/minimal schema can *underperform* no schema at all** (one
> industry test: ~42% citation rate for thin schema vs ~60% for well-populated). When you add
> `ImageObject`/`ItemList`/`Dataset`, fill the fields properly — don't ship stubs.
>
> Validate with the **Rich Results Test** + Search Console's structured-data report. Note: FAQ
> support is being removed from the Rich Results Test / GSC reporting (mid-2026) — use a generic
> schema.org/JSON-LD validator for FAQ, and don't be alarmed when it drops from those reports.

---

## 4. Rendering, Performance & Core Web Vitals

**Core Web Vitals 2026** (field data, 75th percentile, mobile+desktop):

| Metric | "Good" threshold | Note |
|--------|------------------|------|
| **LCP** | ≤ **2.5 s** | **Verified 2026-06-19 at web.dev/articles/lcp (page last updated Sep 4 2025): the bar is still 2.5 s.** The "Google tightened LCP to 2.0s in 2026" claim — asserted in two sibling cookbooks (decimal-to-hex, yo-mama) — is **a myth**; we reject it. See §13 |
| **INP** | ≤ **200 ms** | **INP replaced FID in March 2024** — do not optimize/report FID anymore. INP is the **most-failed** CWV in 2026 and is dominated by main-thread JS |
| **CLS** | ≤ **0.1** | Ads are the #1 CLS threat — reserve slot height (§5) |

> Measured at the **75th percentile** of field data (mobile + desktop). Only ~56% of origins pass
> all three CWV in 2026. After ad units go live, **monitor real-world INP/CLS** via the Search
> Console *Core Web Vitals* report / CrUX — a lab Lighthouse score won't catch field regressions.

| Item | Status | Note | Action |
|------|--------|------|--------|
| Content server-rendered (SSG) | ✅ | `index.tsx`, `details/[id].tsx`, `type-interactions/[combo].tsx` all use `getStaticProps`; H1/prose/stats are in HTML, **not** behind the Pikachu loader gate | — |
| `type-interactions/index` rendering | ⚠️ | No `getStaticProps`; relies on Next Automatic Static Optimization. Content appears static, but verify nothing is client-gated so AI/non-JS crawlers see it | Confirm prerendered HTML contains the type chart text |
| Resource hints (preconnect/dns-prefetch/preload) | ✅ | `_document.tsx:16–19`, fonts preloaded `Header.tsx:76–78` | — |
| Image loading discipline | ✅ | Eager + `fetchpriority=high` above the fold, lazy below, `ReactDOM.preload` for LCP & neighbours | — |
| **`next/image`** | ❌ | Raw `<img>` everywhere (eslint-disabled). Missing automatic responsive `srcset`, AVIF, sizing → affects LCP/CLS | Migrate hero + card images to `next/image` (or `<picture>` with AVIF + WebP fallback). Assets are already self-hosted WebP — add AVIF |
| `next.config.ts` | ⚠️ | Only `reactStrictMode`. No image config, cache headers, or compression | Add `images` config, long-cache headers for `/pokemon/*` & fonts |
| HTTPS / mobile-first | ✅ | Mobile-first indexing completed July 2024 — site is responsive; keep all content mobile-accessible | — |
| Font `font-display` | ⚠️ | Fonts preloaded but no `font-display: swap` seen | Add `font-display: swap` to @font-face to avoid invisible-text LCP hits |

---

## 5. Monetization — AdSense

### 5a. Approval blockers (no revenue until these are fixed)

| Item | Status | Requirement | Action |
|------|--------|-------------|--------|
| **Actual ad units on the page** | ❌ | `ConsentScripts.tsx` loads `adsbygoogle.js` but there is **not one `<ins class="adsbygoogle">` slot** anywhere → script fills nothing, earns nothing | Build a reusable `<AdSlot>` component and place 1–2 units near content |
| **Privacy Policy page** | ❌ | **Mandatory** for AdSense (cookies + personalized ads). Most-cited rejection reason | Add `pages/privacy.tsx` (see §5b for required disclosures) |
| **About + Contact pages** | ❌ | De-facto approval blockers — establish site authenticity/trust | Add `pages/about.tsx`, `pages/contact.tsx` |
| Terms of Service | ⚠️ | Recommended, not strictly required | Add `pages/terms.tsx` when convenient |
| Original, high-value content | ⚠️ | Single biggest rejection cause is "low value / scaled content" (see §6) | Add unique prose + editorial guides |
| `ads.txt` | ✅ | `public/ads.txt` present & correctly formatted (`google.com, pub-3950888851778991, DIRECT, f08c47fec0942fa0`) | — |
| HTTPS, owns domain, working nav | ✅ | — | — |

### 5b. Legal / consent (compliance — can suspend the account)

| Item | Status | Requirement | Action |
|------|--------|-------------|--------|
| Cookie consent gating for ads/analytics | ⚠️ | We gate GA4 + AdSense behind a custom localStorage banner (`ConsentScripts.tsx`, `CookieConsentBanner`, `useConsent`) — good intent | Replace with a certified CMP (below) |
| **Google-certified CMP w/ IAB TCF v2.3** | ❌ | **Mandatory since Jan 16 2024** to serve AdSense to EEA/UK (Switzerland Jul 31 2024). **Without it, ads do not serve to EEA/UK at all** — your highest-value traffic. **TCF version bumped: v2.2 → v2.3, deadline March 1 2026 (now passed).** v2.3 adds a mandatory `disclosedVendors` segment in the TC string; any string generated since March 1 2026 without it gets **Limited Ads** only — so pick a CMP already certified for **v2.3** | **Cheapest path: enable Google's own free "Privacy & messaging" consent message** in the AdSense dashboard (it *is* a certified CMP and wires Consent Mode v2 for you). Alternatives: CookieYes, Cookiebot, consentmanager, iubenda, Didomi, Usercentrics |
| **Google Consent Mode v2** | ❌ | Required since March 2024 for EEA/UK Google tags; certified CMPs implement it for you. Our custom banner does **not** emit `gtag('consent', …)` signals | Adopt via the CMP, or wire `gtag` consent default/update manually |
| Privacy Policy discloses ad cookies / third-party vendors / opt-out | ❌ | AdSense requires explicit disclosure of Google/third-party advertising cookies and the Ads-Settings opt-out link | Include in `pages/privacy.tsx` |

### 5c. Ad implementation best practices

| Item | Status | Note |
|------|--------|------|
| Reserve ad slot height (CLS) | ❌ | Use `min-height` containers so ads don't shift layout — protects CLS & viewability |
| Better Ads Standards | ⚠️ | Keep mobile ad density ≤ ~30%, no pop-ups / auto-play-sound / large stickies. **The Coalition updated the desktop/mobile standards; compliance is assessed no earlier than May 14 2026** — "Density Overload" (too many ads vs content, esp. mobile) is now a tracked violation. Relevant once you add Auto Ads / more units |
| Lazy-load below-fold ads | ❌ | Improves LCP & RPM |
| Auto Ads + manual hybrid | ❌ | 2026 best practice: manual units in premium spots + Auto Ads to fill |
| Alternatives when traffic grows | — | Ezoic (no min), Mediavine Journey (~10k sessions), Raptive (now 25k pageviews) pay higher RPM than bare AdSense |

---

## 6. Content Quality & E-E-A-T

> The **Helpful Content system is now baked into core ranking** (since March 2024) and the
> **Scaled Content Abuse policy** (tightened through the Aug 2025 spam update) targets
> mass-produced low-value pages — **AI or human**. 1,025 API-generated detail pages with one
> templated sentence each is exactly this risk profile, and it's also the #1 AdSense
> "low-value content" rejection trigger.

| Item | Status | Action |
|------|--------|--------|
| Unique prose per detail page | ⚠️ | Add original analysis beyond the API dump: "best counters," competitive niche, notable matchups, trivia — a few genuinely written sentences per entry |
| Home page depth | ⚠️ | Currently H1 + one intro paragraph + grid. Add an original explainer section |
| Editorial / guide content | ❌ | Add real articles ("How type matchups work," "Best Water-type Pokémon," "Strongest Gen-1 Pokémon"). Editorial depth is what flips both rankings and AdSense approval |
| Original data / statistics | ❌ | Publish your own computed data (e.g., "Pokémon with the highest 4× weakness count") — original stats are highly citable (see §7) |
| E-E-A-T signals | ❌ | Visible author/byline, "data from PokéAPI" attribution, last-updated date, About page describing who runs the site |

---

## 7. GEO — Generative Engine Optimization (AI answer engines)

> **Honest framing (verified against Google's own AI-optimization guide, 2026-06-19):** Google is
> explicit — *"You don't need to create…AI text files, markup, or Markdown to appear in Google
> Search,"* *"Structured data isn't required for generative AI search, and there's no special
> schema.org markup you need to add,"* *"You don't need to write in a specific way just for
> generative AI search,"* and *"There's no requirement to break your content into tiny pieces."*
> AI features are *"rooted in our core Search ranking and quality systems."* **Net: ~80% of GEO is
> durable SEO done well.** The genuinely GEO-specific levers are: server-rendered HTML,
> citation-worthy original data, crawler-access decisions, and off-site brand presence.

| Item | Status | Impact | Action |
|------|--------|--------|--------|
| Content in server HTML (SSR/SSG) | ✅ | **HIGH** | GPTBot/ClaudeBot/PerplexityBot **do not execute JS** — our SSG means they can read the page. This is the single most important GEO fix and it's already done |
| **AI-crawler policy in robots.txt** | ❌ | **HIGH** | Explicitly **allow the retrieval/search bots** you want citations from — `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`. Decide separately on **training** bots (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`, `Applebot-Extended`) — blocking those is a legitimate IP choice with little citation cost. Note: `Google-Extended` only governs Gemini *training*, **not** Google Search/AI Overviews |
| Answer-first prose, question-style headings | ❌ | **HIGH** | Lead each section with a direct 1–2 sentence answer ("Charizard is a Fire/Flying-type, 4× weak to Rock…") in the first ~150 words, self-contained. AI extracts prose, not stat bars |
| **Reference tables** (the single highest-citation content structure) | ⚠️ | **HIGH** | Well-structured tables are the format AI engines cite most (industry tests put them ~2.5× more citable than prose). **This is a natural fit for us** — type-matchup grids, base-stat tables, weakness/resistance charts. We have the data; make the tables clean, captioned, and machine-readable |
| Original statistics / quotes / cited sources | ❌ | **HIGH** | **Princeton GEO paper** (arXiv 2311.09735, ACM SIGKDD 2024; GEO-bench, 10k queries, 9 strategies): adding **statistics +41%**, **quotations +28%**, and **citing external sources +115% for lower-ranked content**. Keyword stuffing does *nothing*. Publish your own computed stats (e.g. "Pokémon with the most 4× weaknesses") — original data is the most citable asset you can make |
| Off-site authority / brand mentions | ❌ | **HIGH** | Strongest measured correlate of AI inclusion — **brand-mention correlation ≈0.66 vs backlinks ≈0.22**. Presence on Reddit/YouTube/Wikipedia + consistent branded mentions matter more than links. (Don't *farm* mentions — Google says systems prioritize genuine quality.) |
| ~~"Must already rank top-10 to be cited"~~ | ⚠️ **corrected** | NUANCE | An older heuristic (repeated in the yo-mama cookbook as "~76% of AI citations are top-10 URLs") **no longer holds in 2026**: ~83% of AI Overview citations now come from pages *outside* the organic top-10, and top-10↔AI-citation overlap collapsed from ~75% to 17–38%. You **do** still need to be indexed/crawlable/snippet-eligible — but ranking #1 is *not* a prerequisite for being cited. See §13 |
| Clean chunkable semantic HTML, lists, tables | ✅/⚠️ | WORTH | We have decent semantic structure; keep one concept per section |
| Schema for AI | ⚠️ | WORTH | Schema isn't required for AI citation (Google confirmed) but `Organization`/`sameAs`/entity markup helps disambiguation |
| **`llms.txt`** | 🚫 | LOW | **Skip it for visibility.** Google's **own AI-optimization guide (2026) explicitly says you don't need AI text files** to appear in AI features; Mueller/Illyes are on record ignoring it; Ahrefs found ~97% of `llms.txt` files get **zero** crawler requests; no major AI vendor reads it in production. (Three sibling sites ship one only as a near-zero-cost hedge — fine, but **don't prioritize it**.) Not worth it for us |
| Measure AI referrals | ❌ | WORTH | Segment GA4 by source for `chatgpt`/`perplexity`/`gemini`; run a monthly fixed-prompt citation audit |

---

## 8. Internationalization (i18n / hreflang)

| Item | Status | Note | Action |
|------|--------|------|--------|
| Multi-locale routing | ❌ | English only (`lang="en"`, no `i18n` in `next.config.ts`) | Pokémon has huge non-English search volume (es/fr/de/pt/ja) — **the single biggest untapped traffic lever**. Add Next i18n routing |
| `hreflang` / `x-default` | ❌ | If/when localized, get the codes exactly right | Use `en-US`, `es-ES`, etc.; **bidirectional return tags are mandatory** (a missing return tag invalidates the whole cluster); exactly one `x-default` |

> Only pursue after the AdSense blockers and content depth are done — but it's the highest-ROI growth move once the base is solid.

---

## 9. Trust / Legal Pages & Analytics

| Item | Status | Action |
|------|--------|--------|
| Privacy Policy | ❌ | Required (see §5) |
| About | ❌ | Required (trust + AdSense) |
| Contact | ❌ | Required (trust + AdSense) |
| Terms | ❌ | Recommended |
| Non-affiliation / fan-site disclaimer | ❌ | See §10 — add "not affiliated with / endorsed by Nintendo, Game Freak, or The Pokémon Company" |
| GA4 | ✅ | `G-6FS0YBDE8T`, consent-gated |
| Search Console verification | ✅ | `_document.tsx:25` |
| Bing Webmaster | ❌ | Optional second channel |

---

## 10. ⚠️ The big risk: Pokémon IP / Copyright (read before monetizing)

This is the item most likely to get an AdSense application **rejected** or trigger a **DMCA/trademark**
takedown, and it was the strongest flag from policy research:

- Pokémon **sprites, official artwork, logos, character art, and the names/marks** (Pokémon™,
  Nintendo™, Game Freak) are owned by The Pokémon Company / Nintendo / Game Freak. Their terms
  permit **personal, non-commercial** fan use only — no commercial license.
- AdSense policy prohibits running ads alongside infringing copyrighted material and prohibits
  placing another brand's trademark/logo on your site. Monetizing a site built around official
  sprites/art is a recurring cause of "copyrighted content" rejections.

**Practical mitigations** (reduce, not eliminate — consider legal advice before turning ads on):

1. Lean on **factual data** you compute/present (stat tables, type charts) and use names
   **nominatively/descriptively**, not as branding.
2. Prefer **your own original artwork/diagrams** or properly-licensed assets; avoid reproducing
   official sprite sheets / box art wholesale.
3. Add a visible **non-affiliation disclaimer** (footer + About page).
4. Add substantial **original written content** so the site's value isn't the copyrighted images.

---

## 11. Prioritized roadmap

**P0 — unblock monetization (nothing earns until these ship)**
1. Build a CLS-safe `<AdSlot>` component + place 1–2 units near content.
2. Add `pages/privacy.tsx` (with ad-cookie disclosures), `about.tsx`, `contact.tsx`.
3. Integrate a Google-certified CMP (TCF v2.3 + Consent Mode v2) for EEA/UK — the free Google "Privacy & messaging" message is the cheapest certified option.
4. Add the non-affiliation disclaimer + factual-content framing (§10).

**P1 — visibility wins (high ROI, low effort)**
5. `max-image-preview:large` meta robots (Discover + image previews).
6. Image sitemap entries (Google Images channel).
7. AI-crawler `User-agent` blocks in robots.txt (§7).
8. Make `lastmod` honest (or remove it).
9. Detail pages → `summary_large_image` Twitter card.

**P2 — depth & growth**
10. Answer-first prose + original analysis on detail pages; editorial guide articles (§6).
11. `ItemList` + `ImageObject` schema; visible breadcrumb UI.
12. Migrate images to `next/image`/AVIF; add `next.config` image + cache config; `font-display: swap`.
13. i18n + hreflang (biggest traffic multiplier once the base is solid).
14. GA4 AI-referral segments + monthly citation audit.

**Do NOT spend time on (deprecated / proven useless in 2026)**
- 🚫 FAQ/HowTo schema *for rich results* (FAQ removed May 7 2026; HowTo retired 2023).
- 🚫 `WebSite` `SearchAction` / sitelinks searchbox (removed Nov 21 2024 — markup now inert; keep plain `WebSite` for the site-name only).
- 🚫 `llms.txt` for AI visibility (Google's own guide says it's not needed; ~97% never crawled).
- 🚫 `priority` / `changefreq` sitemap fields (Google ignores them).
- 🚫 Sitemap **ping endpoint** (`google.com/ping`) — removed June 2023; use Search Console / robots.txt.
- 🚫 Optimizing for FID (replaced by INP in 2024).
- 🚫 Chasing a "2.0s LCP" target — **the bar is still 2.5s** (web.dev, verified Sep 2025 / Jun 2026).
- 🚫 `<meta name="keywords">` (ignored since ~2009).
- 🚫 Content "chunking" / writing differently "for AI" (Google explicitly debunked both in 2026).

---

## 12. Sources (verified 2025–2026)

**Google primary**
- Page experience & CWV — developers.google.com/search/docs/appearance/page-experience
- LCP threshold (2.5s) — web.dev/articles/lcp
- robots meta directives — developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Build a sitemap (limits, `lastmod`, ignored fields) — developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Structured data gallery / FAQ deprecation — developers.google.com/search/docs/appearance/structured-data/search-gallery
- Google Discover — developers.google.com/search/docs/appearance/google-discover
- Image SEO — developers.google.com/search/docs/appearance/google-images
- AI optimization guide (May 2026) — developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Gen-AI content guidance — developers.google.com/search/docs/fundamentals/using-gen-ai-content

**AdSense / monetization**
- Eligibility — support.google.com/adsense/answer/9724
- Required content (privacy/cookies) — support.google.com/adsense/answer/1348695
- EU user consent policy — support.google.com/adsense/answer/7670013
- Certified CMP / TCF v2.3 — support.google.com/adsense/answer/13554116 ; support.google.com/adsense/answer/9804260
- ads.txt — support.google.com/adsense/answer/12171612
- Better Ads Standards — betterads.org/standards
- Pokémon copyright — pokemon.com/us/legal/copyright

**GEO / AI search**
- Princeton GEO paper (stats +41% / quotes +28% / sources +115% for low-ranked; SIGKDD 2024) — arxiv.org/abs/2311.09735
- llms.txt reality (Ahrefs, 97% uncrawled) — searchenginejournal.com/97-of-llms-txt-files-got-no-requests-ahrefs-data-shows/579478
- AI-citation ≠ top-10 ranking (83% from outside top-10; overlap collapsed to 17–38%) — convertmate.io/research/geo-benchmark-2026 ; stubgroup.com/blog/geo-in-2026
- AI crawler reference — developers.openai.com/api/docs/bots ; docs.perplexity.ai/guides/bots ; searchengineland.com/anthropic-claude-bots-470171
- AI crawlers don't run JS — clickrank.ai/llms-render-javascript
- Brand mentions correlate with AI Overviews (~0.66 vs backlinks ~0.22) — ahrefs.com/blog/ai-overview-brand-correlation

**Newly verified this pass (2026-06-19)**
- LCP still 2.5s — web.dev/articles/lcp (page last updated 2025-09-04) ; web.dev/articles/defining-core-web-vitals-thresholds
- Sitelinks Searchbox / `SearchAction` removed Nov 21 2024 — developers.google.com/search/blog/2024/10/sitelinks-search-box
- IAB TCF v2.3 mandatory (deadline Mar 1 2026; `disclosedVendors` segment) — support.google.com/adsense/answer/9804260 ; clym.io/blog/tcf-v23-deadline
- Better Ads Standards update assessed ≥ May 14 2026 — betterads.org/press-releases/updated-standards-desktop-mobile-web
- Sitemap ping endpoint removed (June 2023) — developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- IndexNow (Bing/Yandex/Seznam; not Google) — searchengineland.com/google-to-deprecate-sitemaps-ping-endpoint-later-this-year-428661
- Google AI-optimization guide ("no llms.txt / no special schema / no chunking / no AI-specific writing") — developers.google.com/search/docs/fundamentals/ai-optimization-guide

---

## 13. Cross-repo corrections log (2026-06-19)

This pass cross-referenced the four sibling cookbooks and re-verified disputed items against primary
sources. Kept here as history so we don't re-litigate or re-introduce the errors.

| Item | Old claim (here or in a sibling cookbook) | Verified 2026 reality | Action taken |
|------|--------------------------------------------|------------------------|--------------|
| **LCP threshold** | decimal-to-hex + yo-mama cookbooks said Google "tightened LCP to **2.0s** in 2026" | **False — still 2.5s** per web.dev (updated 2025-09-04). Our file was already correct | Hardened the debunk in §4; added to §11 |
| **`WebSite` + `SearchAction`** | *This file* scored it as an implemented feature ✅ | **Sitelinks Searchbox removed Nov 21 2024**; `SearchAction` markup is inert (harmless, no GSC error). Plain `WebSite` still gives the site-name | Corrected §3; added to §11 |
| **IAB TCF version** | *This file* said **v2.2** | Bumped to **v2.3** (deadline Mar 1 2026, now passed; adds `disclosedVendors`) | Updated §5 |
| **AI citation ⇄ top-10** | yo-mama cookbook: "~76% of AI citations are top-10 URLs → just rank top-10" | **Diverged in 2026**: ~83% of AI Overview citations are from *outside* top-10; overlap fell to 17–38%. Indexed/eligible still required; #1 ranking is not | Added corrected nuance row in §7 |
| **Better Ads enforcement** | not tracked here | New desktop/mobile standards assessed **≥ May 14 2026** ("Density Overload") | Added to §5c |
| **Sitemap ping endpoint** | not tracked here | **Removed June 2023** | Added 🚫 row in §1 + §11 |
| **IndexNow** | not tracked here | Bing/Yandex/Seznam only (not Google); feeds ChatGPT/Copilot — cheap hedge | Added optional row in §1 |
| **Princeton GEO figures** | this file said "+30–40%" generally | Precise: **stats +41%, quotes +28%, external sources +115% for low-ranked**; arXiv 2311.09735 | Sharpened §7 |
| **Reference tables** | not tracked here | Highest-citation content structure (~2.5×) — strong fit for our stat/type tables | Added HIGH-impact row in §7 |
| **Bare schema risk** | not tracked here | Thin schema can underperform *no* schema (~42% vs ~60% citation) — populate or omit | Added callout in §3 |
| **`Organization.logo`** | not tracked here | Must be crawlable raster ≥112×112 (PNG/JPG), not `.ico`; add `sameAs`/`contactPoint` | Noted in §3 |

> Items every sibling cookbook already agreed on and we keep: FAQ rich results dropped **May 7 2026**
> (markup still parsed for AI), HowTo retired, `priority`/`changefreq` ignored, FID→INP, certified-CMP +
> Consent Mode v2 mandatory for EEA/UK/CH, "scaled content abuse" is the #1 AdSense rejection trigger.

---

*Generated as a living audit. Re-verify deprecation items each quarter — this space moves fast.
Next re-verify: the certified-CMP list, the Better Ads May-14-2026 assessment outcome, and whether
Google ever revisits the LCP threshold.*
