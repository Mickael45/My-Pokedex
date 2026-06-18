# Bulletproof SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every remaining SEO gap on the My-Pokédex site (broken robots file, missing canonicals/Open Graph/structured data, stale sitemap, non-indexable type pages, weak titles/alt) without regressing the existing SSG setup.

**Architecture:** A single `constants/Seo.ts` config feeds an upgraded `Header` component that emits canonical + Open Graph + Twitter + JSON-LD into `<head>`. Pure helpers (`utils/structuredData.ts`, `utils/typeSlug.ts`, `utils/pokemonTypes/matchups.ts`) keep page code thin and let a new statically-generated `pages/type-interactions/[combo].tsx` and a build-time sitemap script share logic. Type-matchup rendering is extracted into one reusable component so the interactive index and the 171 static combo pages stay DRY.

**Tech Stack:** Next.js 16 Pages Router, React 19, TypeScript, `next/head`, `sharp` (already a dep) for asset generation, Node's built-in `node --test` for pure-logic tests.

## Global Constraints

- Canonical origin is exactly `https://www.my-pokedex.com` (with `www`). Every absolute URL goes through `absoluteUrl()` from `constants/Seo.ts`.
- Pokémon types are the fixed list of 18 in `constants/Types.ts`: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy.
- Detail pages are `/details/{id}` for contiguous ids `1..1025` (`MAX_POKEMON_ID_ALLOWED`).
- Type slugs are always lowercase, alphabetically ordered, hyphen-joined (`fire-water`, never `water-fire`). Exactly 18 singles + 153 pairs = 171 slugs.
- Sitemap total = 2 + 1025 + 171 = **1198** URLs.
- No new runtime dependencies. Reuse `sharp`; tests use `node --test`.
- The existing `Header` call sites must keep working: `title` and `description` stay required props; everything else is optional.
- Verification is build + headless/HTML assertion (the repo has no DOM test framework — user-approved in the spec). Pure helpers that *can* be unit-tested with `node --test` are.

---

### Task 1: Fix the broken robots file 🔴

**Files:**
- Rename: `public/robot.txt` → `public/robots.txt`

**Interfaces:**
- Produces: a crawler-visible `/robots.txt`.

- [ ] **Step 1: Confirm the bug**

Run: `ls public/robot.txt public/robots.txt 2>&1`
Expected: `public/robot.txt` exists, `public/robots.txt` does not (No such file).

- [ ] **Step 2: Rename via git**

```bash
git mv public/robot.txt public/robots.txt
```

- [ ] **Step 3: Set final content**

Overwrite `public/robots.txt` with exactly:

```
User-agent: *
Allow: /

Sitemap: https://www.my-pokedex.com/sitemap.xml
```

- [ ] **Step 4: Verify**

Run: `cat public/robots.txt && ls public/robot.txt 2>&1`
Expected: prints the content above; `public/robot.txt` → No such file.

- [ ] **Step 5: Commit**

```bash
git add -A public/robots.txt
git commit -m "fix: rename robot.txt to robots.txt so crawlers can find it"
```

---

### Task 2: SEO config + upgraded Header (canonical, OG, Twitter, JSON-LD, icons)

**Files:**
- Create: `constants/Seo.ts`
- Modify: `ui/components/Header/Header.tsx`

**Interfaces:**
- Produces (`constants/Seo.ts`):
  - `SITE_ORIGIN: string` = `"https://www.my-pokedex.com"`
  - `SITE_NAME: string`, `SITE_LOCALE: string`
  - `DEFAULT_TITLE: string`, `DEFAULT_DESCRIPTION: string`, `DEFAULT_OG_IMAGE: string`
  - `absoluteUrl(path: string): string` — passes absolute `http(s)` URLs through unchanged; otherwise prefixes `SITE_ORIGIN`.
- Produces (`Header`): same component name, props `{ title: string; description: string; canonicalPath?: string; image?: string; ogType?: string; jsonLd?: JsonLd | JsonLd[] }` where `JsonLd = Record<string, unknown>`. Defaults: `canonicalPath="/"`, `image=DEFAULT_OG_IMAGE`, `ogType="website"`.
- Consumes: nothing yet (used by all page tasks below).

- [ ] **Step 1: Create `constants/Seo.ts`**

```ts
export const SITE_ORIGIN = "https://www.my-pokedex.com";
export const SITE_NAME = "My Pokédex";
export const SITE_LOCALE = "en_US";

export const DEFAULT_TITLE = "Pokédex — Search Every Pokémon by Type, Stats, Weakness & Evolution";
export const DEFAULT_DESCRIPTION =
  "Explore every Pokémon by type, weakness, ability and evolution. Search by name or National Pokédex number and compare base stats and type matchups.";
export const DEFAULT_OG_IMAGE = "/images/og-default.png";

// Absolute URLs for canonical/OG. Already-absolute inputs (e.g. remote artwork)
// pass through untouched; root-relative paths get the canonical origin prefixed.
export const absoluteUrl = (path: string): string =>
  /^https?:\/\//.test(path) ? path : `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
```

- [ ] **Step 2: Add a temporary assertion for `absoluteUrl` and run it**

Run:
```bash
npx tsc --noEmit && node --input-type=module -e "
import { absoluteUrl, SITE_ORIGIN } from './constants/Seo.ts';
" 2>/dev/null || true
node --input-type=module -e "
const { absoluteUrl } = await import('./constants/Seo.ts').catch(()=>({absoluteUrl:(p)=>/^https?:\/\//.test(p)?p:'https://www.my-pokedex.com'+(p.startsWith('/')?p:'/'+p)}));
const f = (p)=>/^https?:\/\//.test(p)?p:'https://www.my-pokedex.com'+(p.startsWith('/')?p:'/'+p);
if (f('/details/1')!=='https://www.my-pokedex.com/details/1') throw new Error('relative');
if (f('https://x.com/a.png')!=='https://x.com/a.png') throw new Error('absolute passthrough');
console.log('absoluteUrl OK');
"
```
Expected: prints `absoluteUrl OK` (Node can't import `.ts` directly, so this asserts the algorithm; the real import is type-checked by `tsc`).

- [ ] **Step 3: Replace `ui/components/Header/Header.tsx`**

```tsx
import Head from "next/head";
import {
  SITE_NAME,
  SITE_LOCALE,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from "../../../constants/Seo";

type JsonLd = Record<string, unknown>;

interface IProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  ogType?: string;
  jsonLd?: JsonLd | JsonLd[];
}

const Header = ({
  title,
  description,
  canonicalPath = "/",
  image = DEFAULT_OG_IMAGE,
  ogType = "website",
  jsonLd,
}: IProps) => {
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = absoluteUrl(image);
  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <meta name="theme-color" content="#b91c1c" />
      <link rel="icon" href="/surprised-pikachu.png" />
      <link rel="apple-touch-icon" href="/icons/icon-512.png" />

      <link rel="preload" href="/fonts/pixelPokemonFont.ttf" as="font" crossOrigin="" />
      <link rel="preload" href="/fonts/hdPokemonFont.woff" as="font" crossOrigin="" />
      <link rel="preload" href="/fonts/hdPokemonFont-bold.woff" as="font" crossOrigin="" />

      {jsonLdItems.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Head>
  );
};

export default Header;
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0 (existing `Header` call sites still type-check — new props are optional).

- [ ] **Step 5: Commit**

```bash
git add constants/Seo.ts ui/components/Header/Header.tsx
git commit -m "feat: add SEO config and emit canonical/OG/Twitter/JSON-LD from Header"
```

---

### Task 3: Generate OG banner + app icon (one-shot sharp script)

**Files:**
- Create: `scripts/generateAssets.mjs`
- Create (output, committed): `public/images/og-default.png`, `public/icons/icon-512.png`

**Interfaces:**
- Consumes: `public/images/surprised-pikachu-hd.png` (530×555, exists).
- Produces: a 1200×630 default share image and a 512×512 icon referenced by `Header` (`DEFAULT_OG_IMAGE`, `apple-touch-icon`) and `organizationJsonLd` (Task 5).

- [ ] **Step 1: Create `scripts/generateAssets.mjs`**

```js
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/images", { recursive: true });
mkdirSync("public/icons", { recursive: true });

const banner = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="80" y="300" font-family="Arial, sans-serif" font-size="92" font-weight="800" fill="#ffffff">My Pokédex</text>
  <text x="82" y="372" font-family="Arial, sans-serif" font-size="40" fill="#fde68a">Stats · Types · Weaknesses · Evolutions</text>
</svg>`;

async function run() {
  const pikachu = await sharp("public/images/surprised-pikachu-hd.png")
    .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(Buffer.from(banner))
    .composite([{ input: pikachu, top: 150, left: 800 }])
    .png()
    .toFile("public/images/og-default.png");

  await sharp("public/images/surprised-pikachu-hd.png")
    .resize(512, 512, { fit: "contain", background: { r: 185, g: 28, b: 28, alpha: 1 } })
    .png()
    .toFile("public/icons/icon-512.png");

  console.log("Wrote public/images/og-default.png and public/icons/icon-512.png");
}

run();
```

- [ ] **Step 2: Run it**

Run: `node scripts/generateAssets.mjs`
Expected: prints the "Wrote …" line; both files exist.

- [ ] **Step 3: Verify dimensions**

Run: `node -e "const s=require('sharp');Promise.all([s('public/images/og-default.png').metadata(),s('public/icons/icon-512.png').metadata()]).then(([a,b])=>console.log(a.width+'x'+a.height, b.width+'x'+b.height))"`
Expected: `1200x630 512x512`

- [ ] **Step 4: Commit**

```bash
git add scripts/generateAssets.mjs public/images/og-default.png public/icons/icon-512.png
git commit -m "feat: generate default OG banner and app icon"
```

---

### Task 4: Titles, descriptions, and alt-text polish

**Files:**
- Modify: `pages/index.tsx` (home `Header` call)
- Modify: `pages/details/[id].tsx` (detail `Header` call + hero `alt`)
- Modify: `ui/components/Pokemon/Pokemon.tsx` (card `alt` x2)

**Interfaces:**
- Consumes: `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION` from `constants/Seo.ts`; `capitalizeFirstLetter`, `formatNumberToMatchLength` (already imported in those files).
- Produces: keyword-rich titles, descriptive alt text. (JSON-LD wiring is Task 5.)

- [ ] **Step 1: Home — use the optimized title/description + canonical**

In `pages/index.tsx`, add to the existing imports:
```tsx
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "../constants/Seo";
```
Replace the `<Header ... />` element with:
```tsx
<Header title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} canonicalPath="/" />
```
(This also fixes the stray newline/whitespace previously embedded in the inline description string.)

- [ ] **Step 2: Detail — keyword-rich title, real description, canonical, og:image, alt**

In `pages/details/[id].tsx`, replace the `<Header ... />` element with:
```tsx
<Header
  title={`${capitalizeFirstLetter(name)} (#${formatNumberToMatchLength(id)}) — Stats, Types, Weaknesses & Evolution | Pokédex`}
  description={`${capitalizeFirstLetter(name)} is a ${types
    .split(",")
    .map(capitalizeFirstLetter)
    .join("/")}-type Pokémon (#${formatNumberToMatchLength(id)}). See base stats, type weaknesses and resistances, abilities, and its full evolution line.`}
  canonicalPath={`/details/${id}`}
  image={hdImageUrl}
  ogType="article"
/>
```
And change the hero image `alt`:
```tsx
<img className={styles.heroImg} src={imageUrl} alt={`${capitalizeFirstLetter(name)} official artwork`} />
```

- [ ] **Step 3: Card — descriptive alt text**

In `ui/components/Pokemon/Pokemon.tsx`, change the hero image alt from `alt={`${name}-pic`}` to:
```tsx
alt={`${name} artwork`}
```
and the evo-badge image alt from `alt={`${evolvesFrom.name}-pic`}` to:
```tsx
alt={`${evolvesFrom.name} artwork`}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add pages/index.tsx pages/details/[id].tsx ui/components/Pokemon/Pokemon.tsx
git commit -m "feat: keyword-rich titles/descriptions and descriptive alt text"
```

---

### Task 5: Structured data (WebSite + Organization + BreadcrumbList)

**Files:**
- Create: `utils/structuredData.ts`
- Modify: `pages/index.tsx` (add home JSON-LD)
- Modify: `pages/details/[id].tsx` (add breadcrumb JSON-LD)

**Interfaces:**
- Consumes: `SITE_ORIGIN`, `SITE_NAME`, `absoluteUrl` from `constants/Seo.ts`.
- Produces:
  - `websiteJsonLd(): JsonLd` — `WebSite` + `SearchAction` (target `${SITE_ORIGIN}/?name={search_term_string}`; the home page already filters on `?name=`).
  - `organizationJsonLd(): JsonLd` — `Organization` with logo `/icons/icon-512.png`.
  - `breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd` — `BreadcrumbList`.
  - `JsonLd = Record<string, unknown>` (matches `Header`'s `jsonLd` prop element type).

- [ ] **Step 1: Create `utils/structuredData.ts`**

```ts
import { SITE_ORIGIN, SITE_NAME, absoluteUrl } from "../constants/Seo";

type JsonLd = Record<string, unknown>;

export const websiteJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_ORIGIN,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_ORIGIN}/?name={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export const organizationJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_ORIGIN,
  logo: absoluteUrl("/icons/icon-512.png"),
});

export const breadcrumbJsonLd = (items: Array<{ name: string; path: string }>): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});
```

- [ ] **Step 2: Wire home JSON-LD**

In `pages/index.tsx` add import:
```tsx
import { websiteJsonLd, organizationJsonLd } from "../utils/structuredData";
```
Update the home `<Header ... />` to add the prop:
```tsx
jsonLd={[websiteJsonLd(), organizationJsonLd()]}
```

- [ ] **Step 3: Wire detail breadcrumb**

In `pages/details/[id].tsx` add import:
```tsx
import { breadcrumbJsonLd } from "../../utils/structuredData";
```
Add to the detail `<Header ... />`:
```tsx
jsonLd={breadcrumbJsonLd([
  { name: "Pokédex", path: "/" },
  { name: capitalizeFirstLetter(name), path: `/details/${id}` },
])}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add utils/structuredData.ts pages/index.tsx pages/details/[id].tsx
git commit -m "feat: add WebSite/Organization/Breadcrumb JSON-LD"
```

---

### Task 6: Indexable type pages (~171) + shared matchup component

**Files:**
- Create: `utils/typeSlug.ts`
- Create: `utils/pokemonTypes/matchups.ts`
- Create: `ui/components/TypeMatchups/TypeMatchups.tsx`
- Create: `pages/type-interactions/[combo].tsx`
- Modify: `ui/components/TypePicker/TypePicker.tsx` (navigate to slug pages; accept `selected` prop)
- Modify: `pages/type-interactions/index.tsx` (use shared component + canonical + breadcrumb)
- Create (test): `utils/typeSlug.test.mjs`

**Interfaces:**
- Produces (`utils/typeSlug.ts`):
  - `toTypeSlug(types: string[]): string` — lowercased, sorted, hyphen-joined.
  - `parseTypeSlug(slug: string): string[]` — sorted type list, or `[]` if any part is not one of the 18 types or length ∉ {1,2}.
  - `allTypeSlugs(): string[]` — 18 singles + 153 pairs = 171.
- Produces (`utils/pokemonTypes/matchups.ts`): `MatchupRow = { type: string; mult: number }`; `defendingRows(selected: string[]): MatchupRow[]`; `attackingRows(selected: string[]): MatchupRow[]`.
- Produces (`TypeMatchups`): default-export component, props `{ selected: string[] }`.
- Produces (`TypePicker`): default-export component, props `{ selected?: string[] }` (falls back to `?types=` query when omitted).
- Consumes: `incomingFactor`, `bestDamage` from `utils/pokemonTypes/effectiveness`; `constants/Types`; `Header`, `breadcrumbJsonLd`, `TypePicker`, `Page`.

- [ ] **Step 1: Write the failing slug test**

Create `utils/typeSlug.test.mjs` (pure-logic mirror of `typeSlug.ts`, runnable without a TS loader):
```js
import { test } from "node:test";
import assert from "node:assert/strict";

const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];
const toTypeSlug = (types) => [...types].map((t) => t.toLowerCase()).sort().join("-");
const parseTypeSlug = (slug) => {
  const parts = slug.split("-");
  return parts.length >= 1 && parts.length <= 2 && parts.every((p) => TYPES.includes(p)) ? [...parts].sort() : [];
};
const allTypeSlugs = () => {
  const pairs = [];
  for (let i = 0; i < TYPES.length; i++) for (let j = i + 1; j < TYPES.length; j++) pairs.push(toTypeSlug([TYPES[i], TYPES[j]]));
  return [...TYPES, ...pairs];
};

test("slug is alphabetical", () => assert.equal(toTypeSlug(["water", "fire"]), "fire-water"));
test("parse rejects unknown types", () => assert.deepEqual(parseTypeSlug("fire-banana"), []));
test("parse rejects 3 types", () => assert.deepEqual(parseTypeSlug("fire-water-grass"), []));
test("parse accepts single + pair", () => {
  assert.deepEqual(parseTypeSlug("fire"), ["fire"]);
  assert.deepEqual(parseTypeSlug("water-fire"), ["fire", "water"]);
});
test("171 slugs, unique", () => {
  const s = allTypeSlugs();
  assert.equal(s.length, 171);
  assert.equal(new Set(s).size, 171);
});
```

- [ ] **Step 2: Run the test to confirm it passes against the reference algorithm**

Run: `node --test utils/typeSlug.test.mjs`
Expected: 5 tests pass. (This locks the algorithm the TS file must match.)

- [ ] **Step 3: Create `utils/typeSlug.ts`**

```ts
import * as Types from "../constants/Types";

const ALL_TYPES = Object.values(Types);

export const toTypeSlug = (types: string[]): string =>
  [...types].map((type) => type.toLowerCase()).sort().join("-");

export const parseTypeSlug = (slug: string): string[] => {
  const parts = slug.split("-");
  const valid = parts.length >= 1 && parts.length <= 2 && parts.every((part) => ALL_TYPES.includes(part));
  return valid ? [...parts].sort() : [];
};

export const allTypeSlugs = (): string[] => {
  const pairs: string[] = [];
  for (let i = 0; i < ALL_TYPES.length; i++) {
    for (let j = i + 1; j < ALL_TYPES.length; j++) {
      pairs.push(toTypeSlug([ALL_TYPES[i], ALL_TYPES[j]]));
    }
  }
  return [...ALL_TYPES, ...pairs];
};
```

- [ ] **Step 4: Create `utils/pokemonTypes/matchups.ts`**

```ts
import * as Types from "../../constants/Types";
import { incomingFactor, bestDamage } from "./effectiveness";

export interface MatchupRow {
  type: string;
  mult: number;
}

const ALL_TYPES = Object.values(Types);

// Non-neutral matchups only, strongest first (mirrors the old in-page logic).
const rows = (score: (type: string) => number): MatchupRow[] =>
  ALL_TYPES.map((type) => ({ type, mult: score(type) }))
    .filter((row) => row.mult !== 1)
    .sort((a, b) => b.mult - a.mult);

export const defendingRows = (selected: string[]): MatchupRow[] =>
  rows((type) => incomingFactor(selected, type));

export const attackingRows = (selected: string[]): MatchupRow[] =>
  rows((type) => bestDamage(selected, [type]));
```

- [ ] **Step 5: Create `ui/components/TypeMatchups/TypeMatchups.tsx`**

Reuses the existing `TypeInteractions.module.css` so no styles move (CSS modules import fine from anywhere in Next).
```tsx
import styles from "../../../pages/type-interactions/TypeInteractions.module.css";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { defendingRows, attackingRows, MatchupRow } from "../../../utils/pokemonTypes/matchups";

const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

const MAX_FACTOR = 4;
const TIER_CLASS: Record<number, string> = { 4: "t4", 2: "t2", 0.5: "th", 0.25: "tq", 0: "t0" };

interface IProps {
  selected: string[];
}

const TypeMatchups = ({ selected }: IProps) => {
  const combo = selected.map(capitalizeFirstLetter).join(" / ");
  const defending = selected.length ? defendingRows(selected) : [];
  const attacking = selected.length ? attackingRows(selected) : [];

  const renderBars = (icon: string, title: string, description: string, data: MatchupRow[]) => (
    <section className={styles.block}>
      <div className={styles.secHead}>
        <span className={styles.ic} aria-hidden="true">
          {icon}
        </span>
        <h2 className={styles.blockTitle}>{title}</h2>
      </div>
      <p className={styles.secDesc}>{description}</p>
      <div className={styles.panel}>
        {data.length === 0 ? (
          <p className={styles.empty}>Only neutral matchups for this selection.</p>
        ) : (
          data.map(({ type, mult }) => (
            <div key={type} className={`${styles.row} ${styles[TIER_CLASS[mult]]}`}>
              <span className={styles.typeChip} style={{ background: typeColor(type) }}>
                {capitalizeFirstLetter(type)}
              </span>
              <span className={styles.track}>
                <span className={styles.fill} style={{ width: `${(mult / MAX_FACTOR) * 100}%` }} />
              </span>
              <span className={styles.mult}>x{mult}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );

  if (!selected.length) {
    return <p className={styles.prompt}>Select a type (or two) above to see its matchups.</p>;
  }

  return (
    <>
      {renderBars("🛡️", "Defending", `Damage ${combo} takes from each attacking type, worst matchups first.`, defending)}
      {renderBars("⚔️", "Attacking", `Damage ${combo} deals to each type with its best move, best matchups first.`, attacking)}
    </>
  );
};

export default TypeMatchups;
```

- [ ] **Step 6: Update `ui/components/TypePicker/TypePicker.tsx` to navigate to slug pages**

Replace the file with (changes: accept optional `selected`, navigate to `/type-interactions/{slug}` instead of `?types=`):
```tsx
import { type CSSProperties } from "react";
import { useRouter } from "next/router";

import * as FilteringTypes from "../../../constants/Types";
import { TYPE_INTERACTIONS } from "../../../constants/Routes";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import { toTypeSlug } from "../../../utils/typeSlug";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./TypePicker.module.css";

const OPTIONS = Object.values(FilteringTypes);
const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

interface IProps {
  selected?: string[];
}

// Pill selector for the Type Interactions dossier. Caps selection at two and
// navigates to the canonical static slug page so every matchup has one indexable URL.
const TypePicker = ({ selected: selectedProp }: IProps) => {
  const router = useRouter();
  const querySelected = usePokemonTypesFromQuery().split(",").filter(Boolean);
  const selected = selectedProp ?? querySelected;

  const toggle = (type: string) => {
    const next = selected.includes(type)
      ? selected.filter((current) => current !== type)
      : [...selected, type].slice(-2);

    router.push(next.length ? `${TYPE_INTERACTIONS}/${toTypeSlug(next)}` : TYPE_INTERACTIONS);
  };

  return (
    <div className={styles.picker}>
      <div className={styles.label}>
        <span>Type(s)</span>
        <span className={styles.hint}>select up to 2</span>
      </div>
      <div className={styles.chips}>
        {OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            className={`${styles.chip} ${selected.includes(type) ? styles.on : ""}`}
            style={{ "--c": typeColor(type) } as CSSProperties}
            onClick={() => toggle(type)}
          >
            {capitalizeFirstLetter(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypePicker;
```

- [ ] **Step 7: Refactor `pages/type-interactions/index.tsx` to use the shared component**

Replace the file with (keeps the landing/picker; canonicalizes legacy `?types=` to the slug page; drops the now-shared row logic):
```tsx
import { memo } from "react";

import styles from "./TypeInteractions.module.css";
import Header from "../../ui/components/Header/Header";
import TypePicker from "../../ui/components/TypePicker/TypePicker";
import TypeMatchups from "../../ui/components/TypeMatchups/TypeMatchups";
import Page from "../../ui/templates/Page/Page";
import { usePokemonTypesFromQuery } from "../../hooks/useQueryParams";
import { toTypeSlug } from "../../utils/typeSlug";
import { breadcrumbJsonLd } from "../../utils/structuredData";

const TypeInteractionsPage = () => {
  const selected = usePokemonTypesFromQuery().split(",").filter(Boolean);
  const canonicalPath = selected.length ? `/type-interactions/${toTypeSlug(selected)}` : "/type-interactions";

  return (
    <>
      <Header
        title="Pokémon Type Interactions — Weakness & Strength Chart | Pokédex"
        description="Pick a type (or two) to see the damage it takes from and deals to every other type. Full Pokémon type effectiveness chart."
        canonicalPath={canonicalPath}
        jsonLd={breadcrumbJsonLd([
          { name: "Pokédex", path: "/" },
          { name: "Type Interactions", path: "/type-interactions" },
        ])}
      />
      <Page>
        <div className={styles.container}>
          <TypePicker selected={selected} />
          <TypeMatchups selected={selected} />
        </div>
      </Page>
    </>
  );
};

export default memo(TypeInteractionsPage);
```

- [ ] **Step 8: Create `pages/type-interactions/[combo].tsx`**

```tsx
import { memo } from "react";

import styles from "./TypeInteractions.module.css";
import Header from "../../ui/components/Header/Header";
import TypePicker from "../../ui/components/TypePicker/TypePicker";
import TypeMatchups from "../../ui/components/TypeMatchups/TypeMatchups";
import Page from "../../ui/templates/Page/Page";
import { allTypeSlugs, parseTypeSlug } from "../../utils/typeSlug";
import { breadcrumbJsonLd } from "../../utils/structuredData";
import { capitalizeFirstLetter } from "../../utils/stringManipulation";

interface IProps {
  combo: string;
  types: string[];
}

const ComboPage = ({ combo, types }: IProps) => {
  const label = types.map(capitalizeFirstLetter).join(" / ");
  const noun = types.length > 1 ? "Types" : "Type";

  return (
    <>
      <Header
        title={`${label} ${noun} — Weaknesses, Resistances & Best Matchups | Pokédex`}
        description={`Type effectiveness for ${label}: which types it is weak to, which it resists, and which it deals the most damage against.`}
        canonicalPath={`/type-interactions/${combo}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Pokédex", path: "/" },
          { name: "Type Interactions", path: "/type-interactions" },
          { name: `${label} ${noun}`, path: `/type-interactions/${combo}` },
        ])}
      />
      <Page>
        <div className={styles.container}>
          <TypePicker selected={types} />
          <TypeMatchups selected={types} />
        </div>
      </Page>
    </>
  );
};

export default memo(ComboPage);

export async function getStaticPaths() {
  const paths = allTypeSlugs().map((combo) => ({ params: { combo } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { combo: string } }) {
  const types = parseTypeSlug(params.combo);
  if (!types.length) {
    return { notFound: true };
  }
  return { props: { combo: params.combo, types } };
}
```

- [ ] **Step 9: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 10: Commit**

```bash
git add utils/typeSlug.ts utils/typeSlug.test.mjs utils/pokemonTypes/matchups.ts ui/components/TypeMatchups/TypeMatchups.tsx ui/components/TypePicker/TypePicker.tsx pages/type-interactions/index.tsx pages/type-interactions/[combo].tsx
git commit -m "feat: statically generate 171 indexable type-matchup pages"
```

---

### Task 7: Build-time sitemap generator

**Files:**
- Create: `scripts/generateSitemap.mjs`
- Create (test): `scripts/generateSitemap.test.mjs`
- Modify: `package.json` (`predev`/`prebuild` chains; add `sitemap` script)
- Regenerate (output, committed): `public/sitemap.xml`

**Interfaces:**
- Produces (`generateSitemap.mjs`, all exported for the test): `typeSlugs(): string[]` (171), `buildUrls(): string[]` (1198, root-relative paths), `buildSitemap(lastmod: string): string` (XML). Writes `public/sitemap.xml` only when run directly.
- Consumes: nothing (ids derived from the fixed `1..1025` range; types are the fixed 18).

- [ ] **Step 1: Write the failing sitemap test**

Create `scripts/generateSitemap.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { typeSlugs, buildUrls } from "./generateSitemap.mjs";

test("171 type slugs", () => assert.equal(typeSlugs().length, 171));
test("pairs alphabetical + unique", () => {
  const s = typeSlugs();
  assert.ok(s.includes("fire-water"));
  assert.ok(!s.includes("water-fire"));
  assert.equal(new Set(s).size, s.length);
});
test("total urls = 2 + 1025 + 171", () => assert.equal(buildUrls().length, 1198));
test("includes home, type hub, a detail page, a type page", () => {
  const urls = buildUrls();
  ["/", "/type-interactions", "/details/1", "/details/1025", "/type-interactions/fire"].forEach((u) =>
    assert.ok(urls.includes(u), `missing ${u}`)
  );
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test scripts/generateSitemap.test.mjs`
Expected: FAIL — `Cannot find module './generateSitemap.mjs'`.

- [ ] **Step 3: Create `scripts/generateSitemap.mjs`**

```js
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORIGIN = "https://www.my-pokedex.com";
const MAX_POKEMON_ID = 1025;
// Mirror of constants/Types.ts — Pokémon's 18 types are fixed.
const TYPES = ["normal","fire","water","electric","grass","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"];

const toSlug = (types) => [...types].sort().join("-");

export const typeSlugs = () => {
  const pairs = [];
  for (let i = 0; i < TYPES.length; i++) {
    for (let j = i + 1; j < TYPES.length; j++) {
      pairs.push(toSlug([TYPES[i], TYPES[j]]));
    }
  }
  return [...TYPES, ...pairs];
};

export const buildUrls = () => {
  const urls = ["/", "/type-interactions"];
  for (let id = 1; id <= MAX_POKEMON_ID; id++) urls.push(`/details/${id}`);
  typeSlugs().forEach((slug) => urls.push(`/type-interactions/${slug}`));
  return urls;
};

export const buildSitemap = (lastmod) => {
  const body = buildUrls()
    .map((path) => `  <url>\n    <loc>${ORIGIN}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

// Write only when executed directly, so the test can import the helpers safely.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
  writeFileSync(out, buildSitemap(lastmod));
  console.log(`Wrote ${buildUrls().length} URLs to public/sitemap.xml`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/generateSitemap.test.mjs`
Expected: 4 tests pass.

- [ ] **Step 5: Generate the sitemap**

Run: `node scripts/generateSitemap.mjs`
Expected: `Wrote 1198 URLs to public/sitemap.xml`.

- [ ] **Step 6: Verify it is well-formed and counted**

Run: `grep -c "<loc>" public/sitemap.xml`
Expected: `1198`.

- [ ] **Step 7: Wire into `package.json` scripts**

In `package.json`, replace the two prebuild/predev lines and add a standalone script:
```json
    "sitemap": "node scripts/generateSitemap.mjs",
    "predev": "node scripts/downloadPokemonImages.mjs && node scripts/generateSitemap.mjs",
    "prebuild": "node scripts/downloadPokemonImages.mjs && node scripts/generateSitemap.mjs",
```

- [ ] **Step 8: Commit**

```bash
git add scripts/generateSitemap.mjs scripts/generateSitemap.test.mjs package.json public/sitemap.xml
git commit -m "feat: generate sitemap (1198 urls) at build time"
```

---

### Task 8: Host canonicalization doc + full verification pass

**Files:**
- Create: `docs/superpowers/deploy-seo-checklist.md`
- No code changes.

**Interfaces:**
- Consumes: everything above (full build).
- Produces: a documented manual Vercel step + a recorded verification result.

- [ ] **Step 1: Write the deploy checklist**

Create `docs/superpowers/deploy-seo-checklist.md`:
```markdown
# SEO deploy checklist (manual, post-merge)

1. **Vercel primary domain:** Project → Settings → Domains. Set
   `www.my-pokedex.com` as **Primary**; confirm `my-pokedex.com` shows
   "Redirect to www.my-pokedex.com" (308). HTTPS is enforced by Vercel.
2. **Search Console:** Resubmit `https://www.my-pokedex.com/sitemap.xml`.
3. **Validate markup:** Run a home URL, a `/details/{id}` URL, and a
   `/type-interactions/{type}` URL through Google's Rich Results Test —
   expect a valid BreadcrumbList (and WebSite/Organization on home).
4. **Social preview:** Paste a detail URL into the Facebook Sharing
   Debugger / Twitter Card Validator — expect title, description, image.
```

- [ ] **Step 2: Typecheck + full build**

Run: `npx tsc --noEmit && yarn build`
Expected: build succeeds; output lists the new `/type-interactions/[combo]` route prerendering 171 paths and `/details/[id]` prerendering 1025. (Detail prerender hits PokéAPI and can take several minutes — existing behavior.)

- [ ] **Step 3: Assert head tags in built HTML**

Run:
```bash
for f in .next/server/pages/index.html .next/server/pages/details/1.html ".next/server/pages/type-interactions/fire.html"; do
  echo "== $f =="
  grep -c 'rel="canonical"' "$f"
  grep -o 'property="og:image"[^>]*' "$f" | head -1
  grep -c 'application/ld+json' "$f"
done
```
Expected: each file reports `1` canonical, an `og:image` meta, and ≥1 `ld+json` block.

- [ ] **Step 4: Assert robots + sitemap**

Run:
```bash
test -f public/robots.txt && echo "robots OK"
test ! -f public/robot.txt && echo "old robot.txt gone"
grep -c "<loc>" public/sitemap.xml
```
Expected: `robots OK`, `old robot.txt gone`, `1198`.

- [ ] **Step 5: Run all unit tests**

Run: `node --test scripts/*.test.mjs utils/*.test.mjs`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/deploy-seo-checklist.md
git commit -m "docs: post-deploy SEO verification checklist"
```

---

## Self-Review Notes

- **Spec coverage:** §1 Seo.ts → Task 2. §2 Header upgrade → Task 2. §3 JSON-LD → Task 5. §4 robots → Task 1. §5 sitemap → Task 7. §6 type pages → Task 6. §7 titles/alt → Task 4. §8 Vercel host → Task 8. og:image asset → Task 3. All spec sections map to a task.
- **Type consistency:** `JsonLd = Record<string, unknown>` is identical in `Header` (Task 2) and `structuredData.ts` (Task 5). `toTypeSlug`/`parseTypeSlug`/`allTypeSlugs` signatures match between `typeSlug.ts` (Task 6) and their `typeSlug.test.mjs` mirror. `TypePicker`'s `selected?: string[]` prop is consumed by index (Task 6 Step 7) and `[combo]` (Step 8). `MatchupRow` is shared by `matchups.ts` and `TypeMatchups`.
- **Counts:** 18 + 153 = 171 type slugs; 2 + 1025 + 171 = 1198 sitemap URLs — asserted by tests in Tasks 6 and 7.
- **No placeholders:** every code step contains full file contents or an exact diff.
