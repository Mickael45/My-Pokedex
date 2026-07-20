# Phase 0 — AdSense & Compliance Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make My-Pokedex AdSense-eligible and legally compliant — legal/trust pages, an IP non-affiliation disclaimer, Google Consent Mode v2 wiring, and CLS-safe ad-slot infrastructure that is placed but disabled (`ADS_ENABLED=false`) — without rendering a single live ad.

**Architecture:** Three new self-contained units (`config/ads.ts` flag/config, `utils/consentMode.ts` gtag signals, `<AdSlot>` component) plus a site-wide `<Footer>` and four static legal pages built on a shared `LegalLayout`. Consent Mode v2 defaults emit deny-by-default from `_document`; the existing banner now drives `gtag('consent','update', …)` instead of merely gating script loads; GA4 moves to always-load under Consent Mode (cookieless until granted). Google Funding Choices is configured in the AdSense console at ad-enable time (owner runbook), not in this phase.

**Tech Stack:** Next.js 16.2.6 (pages router, SSG), React 19, TypeScript, `@next/third-parties` (GA4), Tailwind + CSS Modules, **Vitest + React Testing Library + jsdom** (added in Task 1). Package manager: **yarn**.

## Global Constraints

- AdSense publisher ID: **`ca-pub-3950888851778991`** (verbatim everywhere it appears).
- `ads.txt` already correct (`google.com, pub-3950888851778991, DIRECT, f08c47fec0942fa0`) — do not touch.
- **No live ads in this phase.** `ADS_ENABLED` ships as `false`. No `<ins>` unit may render with a real slot id.
- Consent Mode v2 default state is **denied** for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`; updated only on explicit user grant.
- Mirror existing code style: **relative imports** (not the `@/` alias), `const` arrow components, `IProps` interface naming, co-located `*.module.css`.
- `preconnect` to `pagead2.googlesyndication.com` already exists in `pages/_document.tsx:16` — do **not** re-add.
- Site origin/name come from `constants/Seo.ts` (`SITE_ORIGIN`, `SITE_NAME`); never hardcode the domain.
- All new pages render the existing `Header` (title + description + canonicalPath) and wrap content in the `Page` template, matching `pages/type-interactions/index.tsx`.

---

## File Structure

**New files:**
- `vitest.config.ts`, `vitest.setup.ts` — test harness.
- `config/ads.ts` — `ADS_ENABLED` flag, client id, named slot config.
- `utils/consentMode.ts` — `updateConsent(granted)` Consent Mode v2 helper.
- `ui/components/AdSlot/AdSlot.tsx` + `AdSlot.module.css` + `AdSlot.test.tsx`.
- `ui/components/Footer/Footer.tsx` + `Footer.module.css` + `Footer.test.tsx`.
- `ui/components/LegalLayout/LegalLayout.tsx` + `LegalLayout.module.css` — shared prose shell for legal pages.
- `pages/privacy.tsx`, `pages/about.tsx`, `pages/contact.tsx`, `pages/terms.tsx`.

**Modified files:**
- `package.json` — add `test` script + devDependencies.
- `constants/Routes.ts` — add legal routes.
- `pages/_document.tsx` — add Consent Mode v2 default-denied bootstrap.
- `pages/_app.tsx` — render `<Footer>`; push consent updates on change.
- `ui/components/ConsentScripts/ConsentScripts.tsx` — always-load GA under Consent Mode; gate AdSense loader on `ADS_ENABLED`.
- `pages/details/[id].tsx`, `pages/type-interactions/index.tsx`, `pages/index.tsx` — place disabled `<AdSlot>`s.

---

## Task 1: Test harness (Vitest + RTL + jsdom)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json:5-14` (scripts), `package.json:23-35` (devDependencies)

**Interfaces:**
- Produces: a `yarn test` command running `*.test.tsx` files in a jsdom environment with `@testing-library/jest-dom` matchers and CSS-module + JSX support.

- [ ] **Step 1: Install dev dependencies**

```bash
yarn add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add the `test` script** to `package.json` scripts block (after `"lint"`):

```json
    "lint": "next lint",
    "test": "vitest run"
```

- [ ] **Step 5: Add a smoke test** `vitest.smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run it**

Run: `yarn test`
Expected: PASS — 1 passed (`harness > runs`).

- [ ] **Step 7: Delete the smoke test and commit**

```bash
rm vitest.smoke.test.ts
git add package.json yarn.lock vitest.config.ts vitest.setup.ts
git commit -m "test: add vitest + react-testing-library harness"
```

---

## Task 2: Ad configuration module (`config/ads.ts`)

**Files:**
- Create: `config/ads.ts`, `config/ads.test.ts`

**Interfaces:**
- Produces:
  - `ADS_ENABLED: boolean` (ships `false`)
  - `ADSENSE_CLIENT: string` = `"ca-pub-3950888851778991"`
  - `AD_SLOTS: Record<AdSlotName, { slot: string; height: number }>`
  - `type AdSlotName = "detailBelowStats" | "typeChartBelowIntro" | "homeInGrid"`

- [ ] **Step 1: Write the failing test** `config/ads.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS } from "./ads";

describe("ads config", () => {
  it("ships with ads disabled", () => {
    expect(ADS_ENABLED).toBe(false);
  });

  it("uses the correct publisher id", () => {
    expect(ADSENSE_CLIENT).toBe("ca-pub-3950888851778991");
  });

  it("reserves a positive height for every slot and has no live slot ids yet", () => {
    const names = Object.keys(AD_SLOTS);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(AD_SLOTS[name as keyof typeof AD_SLOTS].height).toBeGreaterThan(0);
      expect(AD_SLOTS[name as keyof typeof AD_SLOTS].slot).toBe("");
    }
  });
});
```

- [ ] **Step 2: Run it to verify failure**

Run: `yarn test config/ads.test.ts`
Expected: FAIL — cannot resolve `./ads`.

- [ ] **Step 3: Create `config/ads.ts`**

```ts
// Master switch for AdSense. Flip to `true` AND assign each slot a real ad-unit
// id (created in the AdSense console) to start serving ads. Until then every
// <AdSlot> renders a reserved-height placeholder, so enabling causes zero CLS.
// See docs/superpowers/plans — "Owner runbook: enabling ads" before flipping.
export const ADS_ENABLED = false;

export const ADSENSE_CLIENT = "ca-pub-3950888851778991";

export interface AdSlotConfig {
  // AdSense ad-unit slot id; empty until the unit is created in the console.
  slot: string;
  // Reserved box height in px (CLS protection — must match the unit's size).
  height: number;
}

export const AD_SLOTS = {
  detailBelowStats: { slot: "", height: 280 },
  typeChartBelowIntro: { slot: "", height: 280 },
  homeInGrid: { slot: "", height: 280 },
} as const satisfies Record<string, AdSlotConfig>;

export type AdSlotName = keyof typeof AD_SLOTS;
```

- [ ] **Step 4: Run it to verify pass**

Run: `yarn test config/ads.test.ts`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
git add config/ads.ts config/ads.test.ts
git commit -m "feat: add disabled-by-default ad config + named slots"
```

---

## Task 3: Consent Mode v2 helper (`utils/consentMode.ts`)

**Files:**
- Create: `utils/consentMode.ts`, `utils/consentMode.test.ts`

**Interfaces:**
- Consumes: a global `window.gtag` (defined by the Task 6 `_document` bootstrap).
- Produces: `updateConsent(granted: boolean): void` — calls `gtag('consent','update', …)` setting all four v2 keys to `granted`/`denied`. No-op when `window.gtag` is absent (SSR / loader not ready).

- [ ] **Step 1: Write the failing test** `utils/consentMode.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateConsent } from "./consentMode";

describe("updateConsent", () => {
  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete window.gtag;
    vi.restoreAllMocks();
  });

  it("pushes granted for all four Consent Mode v2 keys when granted", () => {
    const gtag = vi.fn();
    // @ts-expect-error test global
    window.gtag = gtag;

    updateConsent(true);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  });

  it("pushes denied for all four keys when not granted", () => {
    const gtag = vi.fn();
    // @ts-expect-error test global
    window.gtag = gtag;

    updateConsent(false);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });

  it("is a no-op when gtag is unavailable", () => {
    expect(() => updateConsent(true)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify failure**

Run: `yarn test utils/consentMode.test.ts`
Expected: FAIL — cannot resolve `./consentMode`.

- [ ] **Step 3: Create `utils/consentMode.ts`**

```ts
// Google Consent Mode v2. The deny-by-default state is emitted from _document
// before any tag loads; this updates it after the user decides via the banner.
type ConsentValue = "granted" | "denied";

interface Gtag {
  (...args: unknown[]): void;
}

const getGtag = (): Gtag | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: Gtag };
  return typeof w.gtag === "function" ? w.gtag : null;
};

export const updateConsent = (granted: boolean): void => {
  const gtag = getGtag();
  if (!gtag) return;
  const value: ConsentValue = granted ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
};
```

- [ ] **Step 4: Run it to verify pass**

Run: `yarn test utils/consentMode.test.ts`
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

```bash
git add utils/consentMode.ts utils/consentMode.test.ts
git commit -m "feat: add Consent Mode v2 update helper"
```

---

## Task 4: `<AdSlot>` component

**Files:**
- Create: `ui/components/AdSlot/AdSlot.tsx`, `ui/components/AdSlot/AdSlot.module.css`, `ui/components/AdSlot/AdSlot.test.tsx`

**Interfaces:**
- Consumes: `ADS_ENABLED`, `ADSENSE_CLIENT`, `AD_SLOTS`, `AdSlotName` from `config/ads` (Task 2).
- Produces: `<AdSlot name={AdSlotName} />`. When inactive (ads disabled or slot id empty) renders a reserved-height placeholder `<div data-ad-slot={name} aria-hidden="true">`. When active renders `<ins class="adsbygoogle">` with the client/slot and pushes to `window.adsbygoogle`.

- [ ] **Step 1: Create the CSS module** `ui/components/AdSlot/AdSlot.module.css`

```css
.placeholder {
  display: block;
  width: 100%;
}

.unit {
  display: block;
  width: 100%;
}
```

- [ ] **Step 2: Write the failing test** `ui/components/AdSlot/AdSlot.test.tsx`

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

afterEach(() => vi.resetModules());

describe("AdSlot (ads disabled — default)", () => {
  it("renders a reserved-height placeholder, not an ad unit", async () => {
    const { default: AdSlot } = await import("./AdSlot");
    const { container } = render(<AdSlot name="detailBelowStats" />);

    const placeholder = container.querySelector('[data-ad-slot="detailBelowStats"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({ minHeight: "280px" });
    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
  });
});

describe("AdSlot (ads enabled + slot id)", () => {
  it("renders a real adsbygoogle ins unit with the publisher id", async () => {
    vi.doMock("../../../config/ads", () => ({
      ADS_ENABLED: true,
      ADSENSE_CLIENT: "ca-pub-3950888851778991",
      AD_SLOTS: { detailBelowStats: { slot: "1234567890", height: 280 } },
    }));
    // @ts-expect-error test global
    window.adsbygoogle = [];

    const { default: AdSlot } = await import("./AdSlot");
    const { container } = render(<AdSlot name={"detailBelowStats" as never} />);

    const ins = container.querySelector("ins.adsbygoogle");
    expect(ins).toBeInTheDocument();
    expect(ins).toHaveAttribute("data-ad-client", "ca-pub-3950888851778991");
    expect(ins).toHaveAttribute("data-ad-slot", "1234567890");
  });
});
```

- [ ] **Step 3: Run it to verify failure**

Run: `yarn test ui/components/AdSlot/AdSlot.test.tsx`
Expected: FAIL — cannot resolve `./AdSlot`.

- [ ] **Step 4: Create `ui/components/AdSlot/AdSlot.tsx`**

```tsx
import { useEffect } from "react";
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS, AdSlotName } from "../../../config/ads";
import styles from "./AdSlot.module.css";

interface IProps {
  name: AdSlotName;
}

// CLS-safe: reserves `height` at all times. Renders a live <ins> ad unit only
// when ads are enabled AND the slot has a real id; otherwise an empty reserved box.
const AdSlot = ({ name }: IProps) => {
  const { slot, height } = AD_SLOTS[name];
  const active = ADS_ENABLED && slot !== "";

  useEffect(() => {
    if (!active) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // loader not present yet — no-op
    }
  }, [active]);

  if (!active) {
    return (
      <div
        className={styles.placeholder}
        style={{ minHeight: height }}
        data-ad-slot={name}
        aria-hidden="true"
      />
    );
  }

  return (
    <ins
      className={`adsbygoogle ${styles.unit}`}
      style={{ display: "block", minHeight: height }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSlot;
```

- [ ] **Step 5: Run it to verify pass**

Run: `yarn test ui/components/AdSlot/AdSlot.test.tsx`
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

```bash
git add ui/components/AdSlot
git commit -m "feat: add CLS-safe AdSlot (placeholder while disabled)"
```

---

## Task 5: Legal routes + Footer with IP disclaimer

**Files:**
- Modify: `constants/Routes.ts`
- Create: `ui/components/Footer/Footer.tsx`, `ui/components/Footer/Footer.module.css`, `ui/components/Footer/Footer.test.tsx`
- Modify: `pages/_app.tsx:36-42`

**Interfaces:**
- Consumes: `Link` from `next/link`; new route constants.
- Produces: route constants `ABOUT`, `PRIVACY`, `CONTACT`, `TERMS`; a site-wide `<Footer>` rendering those four links, the non-affiliation disclaimer, and a copyright line.

- [ ] **Step 1: Add routes to `constants/Routes.ts`**

```ts
export const HOME = "/";
export const DETAILS = "/details/";
export const TYPE_INTERACTIONS = "/type-interactions";
export const ABOUT = "/about";
export const PRIVACY = "/privacy";
export const CONTACT = "/contact";
export const TERMS = "/terms";
```

- [ ] **Step 2: Create the CSS module** `ui/components/Footer/Footer.module.css`

```css
.footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1.5rem 1rem 5rem;
  text-align: center;
  font-size: 0.8rem;
  line-height: 1.5;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.disclaimer {
  max-width: 60ch;
  margin: 0 auto 0.5rem;
  opacity: 0.75;
}
```

- [ ] **Step 3: Write the failing test** `ui/components/Footer/Footer.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("links to all four legal pages", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /terms/i })).toHaveAttribute("href", "/terms");
  });

  it("shows a Pokémon non-affiliation disclaimer", () => {
    render(<Footer />);
    expect(screen.getByText(/not affiliated with|nintendo|game freak/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run it to verify failure**

Run: `yarn test ui/components/Footer/Footer.test.tsx`
Expected: FAIL — cannot resolve `./Footer`.

- [ ] **Step 5: Create `ui/components/Footer/Footer.tsx`**

```tsx
import Link from "next/link";
import { ABOUT, PRIVACY, CONTACT, TERMS } from "../../../constants/Routes";
import { SITE_NAME } from "../../../constants/Seo";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <nav className={styles.links} aria-label="Footer">
      <Link href={ABOUT}>About</Link>
      <Link href={PRIVACY}>Privacy</Link>
      <Link href={CONTACT}>Contact</Link>
      <Link href={TERMS}>Terms</Link>
    </nav>
    <p className={styles.disclaimer}>
      {SITE_NAME} is an unofficial fan-made reference. It is not affiliated with,
      endorsed by, or sponsored by Nintendo, Game Freak, or The Pokémon Company.
      Pokémon and Pokémon character names are trademarks of Nintendo. All
      stat tables and type-matchup data on this site are independently compiled facts.
    </p>
    <p>© {SITE_NAME}</p>
  </footer>
);

export default Footer;
```

- [ ] **Step 6: Run it to verify pass**

Run: `yarn test ui/components/Footer/Footer.test.tsx`
Expected: PASS — 2 passed.

- [ ] **Step 7: Render the footer site-wide** in `pages/_app.tsx`. Add the import near the other `ui/components` imports:

```tsx
import Footer from "../ui/components/Footer/Footer";
```

Then change the block at `pages/_app.tsx:36-42` from:

```tsx
                  <>
                    <NavigationBar />
                    <main>
                      <Component {...pageProps} />
                    </main>
                    <CookieConsentBanner />
                  </>
```

to:

```tsx
                  <>
                    <NavigationBar />
                    <main>
                      <Component {...pageProps} />
                    </main>
                    <Footer />
                    <CookieConsentBanner />
                  </>
```

- [ ] **Step 8: Verify the app still type-checks/builds**

Run: `yarn lint`
Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add constants/Routes.ts ui/components/Footer pages/_app.tsx
git commit -m "feat: add site-wide footer with legal links + IP disclaimer"
```

---

## Task 6: Consent Mode v2 default-denied bootstrap + GA always-on

**Files:**
- Modify: `pages/_document.tsx:13-26` (add bootstrap inside `<Head>`)
- Modify: `ui/components/ConsentScripts/ConsentScripts.tsx` (rewrite)
- Modify: `pages/_app.tsx` (push consent updates on change)

**Interfaces:**
- Consumes: `updateConsent` (Task 3), `ADS_ENABLED` (Task 2), `GRANTED`/`DENIED` from `constants/Consent`.
- Produces: a global `window.gtag` with Consent Mode v2 defaults set to `denied`; GA4 loaded unconditionally (cookieless until granted); AdSense loader gated on `ADS_ENABLED` (so it does not load this phase).

- [ ] **Step 1: Add the default-denied bootstrap** to `pages/_document.tsx`. Insert this block inside `<Head>`, immediately after the existing `<meta name="google-site-verification" … />` line (currently line 25), before `</Head>`:

```tsx
          {/* Consent Mode v2 — deny by default before any tag loads. The cookie
              banner calls gtag('consent','update',…) once the user decides.
              Must stay ABOVE GA/AdSense in load order (this is in the initial HTML). */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "window.dataLayer=window.dataLayer||[];" +
                "function gtag(){dataLayer.push(arguments);}" +
                "window.gtag=gtag;" +
                "gtag('consent','default',{" +
                "ad_storage:'denied'," +
                "ad_user_data:'denied'," +
                "ad_personalization:'denied'," +
                "analytics_storage:'denied'," +
                "wait_for_update:500});",
            }}
          />
```

- [ ] **Step 2: Rewrite `ui/components/ConsentScripts/ConsentScripts.tsx`** so GA always loads (under Consent Mode) and AdSense is gated on the flag:

```tsx
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ADS_ENABLED, ADSENSE_CLIENT } from "../../../config/ads";

const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

// GA4 loads unconditionally and runs in Consent Mode (cookieless until the user
// grants). The AdSense loader only loads once ads are enabled (Phase 0 ships off).
const ConsentScripts = () => (
  <>
    {ADS_ENABLED && (
      <Script
        id="adsbygoogle-init"
        src={ADSENSE_SRC}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    )}
    <GoogleAnalytics gaId="G-6FS0YBDE8T" />
  </>
);

export default ConsentScripts;
```

- [ ] **Step 3: Push consent updates from `pages/_app.tsx`.** Add imports near the top (with the other hook/constant imports):

```tsx
import { useEffect } from "react";
import { updateConsent } from "../utils/consentMode";
import { GRANTED, DENIED } from "../constants/Consent";
```

Note `useState` is already imported from `react` at line 3 — extend that import to include `useEffect` instead of adding a duplicate `react` import:

```tsx
import { useState, useEffect } from "react";
```

Then, inside the `App` component, after the `const { consent, setConsent } = useConsent();` line (currently line 25), add:

```tsx
  // Mirror the banner decision into Consent Mode v2 (covers both a fresh click
  // and a granted/denied value restored from localStorage on load).
  useEffect(() => {
    if (consent === GRANTED) updateConsent(true);
    else if (consent === DENIED) updateConsent(false);
  }, [consent]);
```

- [ ] **Step 4: Verify the build compiles**

Run: `yarn build`
Expected: build succeeds (Compiled successfully); no type errors in `_document`, `_app`, or `ConsentScripts`.

- [ ] **Step 5: Verify the default-denied signal ships in HTML**

Run: `grep -c "consent','default'" .next/server/pages/index.html 2>/dev/null || yarn build && grep -rl "consent','default'" .next/server/pages/*.html | head`
Expected: the inline bootstrap string is present in the rendered `<head>` of built pages.

- [ ] **Step 6: Commit**

```bash
git add pages/_document.tsx ui/components/ConsentScripts/ConsentScripts.tsx pages/_app.tsx
git commit -m "feat: wire Consent Mode v2 (deny-by-default + update on consent)"
```

---

## Task 7: Legal pages (Privacy, About, Contact, Terms)

**Files:**
- Create: `ui/components/LegalLayout/LegalLayout.tsx`, `ui/components/LegalLayout/LegalLayout.module.css`
- Create: `pages/privacy.tsx`, `pages/about.tsx`, `pages/contact.tsx`, `pages/terms.tsx`

**Interfaces:**
- Consumes: `Header`, `Page` template, `SITE_NAME`.
- Produces: four indexable pages, each rendering `Header` (unique title/description/canonicalPath) + a `LegalLayout` heading + prose. About carries the IP non-affiliation statement and publisher identity; Privacy discloses Google/third-party ad + analytics cookies and opt-outs.

- [ ] **Step 1: Create the CSS module** `ui/components/LegalLayout/LegalLayout.module.css`

```css
.wrap {
  max-width: 70ch;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  line-height: 1.6;
}

.wrap h1 {
  margin-bottom: 0.5rem;
}

.wrap h2 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.updated {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}
```

- [ ] **Step 2: Create `ui/components/LegalLayout/LegalLayout.tsx`**

```tsx
import { ReactNode } from "react";
import styles from "./LegalLayout.module.css";

interface IProps {
  heading: string;
  updated: string;
  children: ReactNode;
}

const LegalLayout = ({ heading, updated, children }: IProps) => (
  <article className={styles.wrap}>
    <h1>{heading}</h1>
    <p className={styles.updated}>Last updated: {updated}</p>
    {children}
  </article>
);

export default LegalLayout;
```

- [ ] **Step 3: Create `pages/privacy.tsx`**

```tsx
import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";

const PrivacyPage = () => (
  <>
    <Header
      title={`Privacy Policy | ${SITE_NAME}`}
      description={`How ${SITE_NAME} handles cookies, advertising, and analytics data.`}
      canonicalPath="/privacy"
    />
    <Page>
      <LegalLayout heading="Privacy Policy" updated="June 19, 2026">
        <p>
          This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;, &quot;us&quot;)
          handles information when you visit this site.
        </p>

        <h2>Cookies &amp; advertising</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on
          your prior visits to this and other websites. Google&apos;s use of
          advertising cookies enables it and its partners to serve ads to you based
          on your visit to this and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">
            Google Ads Settings
          </a>
          . You can also opt out of a third-party vendor&apos;s use of cookies for
          personalized advertising at{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
            aboutads.info
          </a>{" "}
          and, in the EU, at{" "}
          <a href="https://www.youronlinechoices.eu/" rel="noopener noreferrer" target="_blank">
            youronlinechoices.eu
          </a>
          .
        </p>

        <h2>Analytics</h2>
        <p>
          We use Google Analytics to understand site usage. Analytics and
          advertising storage are denied by default and are only enabled after you
          consent via the cookie banner (Google Consent Mode v2). You can change
          your choice at any time using the &quot;Cookie settings&quot; control.
        </p>

        <h2>Your choices</h2>
        <p>
          Declining consent means we do not store advertising or analytics cookies;
          the site remains fully usable.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? See our <a href="/contact">contact page</a>.
        </p>
      </LegalLayout>
    </Page>
  </>
);

export default PrivacyPage;
```

- [ ] **Step 4: Create `pages/about.tsx`** (carries the IP statement + publisher identity — the §13 disclaimer and an E-E-A-T signal):

```tsx
import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";

const AboutPage = () => (
  <>
    <Header
      title={`About | ${SITE_NAME}`}
      description={`What ${SITE_NAME} is, who makes it, and its relationship to the Pokémon franchise.`}
      canonicalPath="/about"
    />
    <Page>
      <LegalLayout heading={`About ${SITE_NAME}`} updated="June 19, 2026">
        <p>
          {SITE_NAME} is an independent, fan-made reference for exploring Pokémon by
          type, base stats, abilities, weaknesses, and evolution. Every stat table
          and type-effectiveness chart on this site is independently compiled from
          public game data.
        </p>

        <h2>Who makes this</h2>
        <p>
          {SITE_NAME} is built and maintained by an independent developer. For
          questions, corrections, or feedback, see our{" "}
          <a href="/contact">contact page</a>.
        </p>

        <h2>Trademark &amp; affiliation</h2>
        <p>
          {SITE_NAME} is not affiliated with, endorsed by, or sponsored by Nintendo,
          Game Freak, or The Pokémon Company. Pokémon, Pokémon character names, and
          related marks are trademarks of Nintendo. They are used here nominatively,
          to identify the factual game data this site documents. No copyright or
          trademark infringement is intended.
        </p>
      </LegalLayout>
    </Page>
  </>
);

export default AboutPage;
```

- [ ] **Step 5: Create `pages/contact.tsx`**

```tsx
import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";

const ContactPage = () => (
  <>
    <Header
      title={`Contact | ${SITE_NAME}`}
      description={`How to reach the ${SITE_NAME} team for questions, corrections, or feedback.`}
      canonicalPath="/contact"
    />
    <Page>
      <LegalLayout heading="Contact" updated="June 19, 2026">
        <p>
          For questions, data corrections, or feedback about {SITE_NAME}, email{" "}
          <a href="mailto:mickaelgomesconsulting@gmail.com">
            mickaelgomesconsulting@gmail.com
          </a>
          .
        </p>
        <p>We aim to respond within a few business days.</p>
      </LegalLayout>
    </Page>
  </>
);

export default ContactPage;
```

- [ ] **Step 6: Create `pages/terms.tsx`**

```tsx
import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";

const TermsPage = () => (
  <>
    <Header
      title={`Terms of Use | ${SITE_NAME}`}
      description={`The terms governing your use of ${SITE_NAME}.`}
      canonicalPath="/terms"
    />
    <Page>
      <LegalLayout heading="Terms of Use" updated="June 19, 2026">
        <p>
          By using {SITE_NAME} you agree to these terms. The site is provided
          &quot;as is&quot;, for personal, non-commercial reference, with no warranty
          as to accuracy or availability.
        </p>

        <h2>Content &amp; intellectual property</h2>
        <p>
          Pokémon and related marks are trademarks of Nintendo, Game Freak, and The
          Pokémon Company; {SITE_NAME} is unaffiliated (see our{" "}
          <a href="/about">About page</a>). Independently compiled data on this site
          may be referenced with attribution.
        </p>

        <h2>Advertising</h2>
        <p>
          This site may display third-party advertising. See our{" "}
          <a href="/privacy">Privacy Policy</a> for how advertising cookies are
          handled.
        </p>

        <h2>Liability</h2>
        <p>
          {SITE_NAME} is not liable for any damages arising from use of the site or
          reliance on its data.
        </p>
      </LegalLayout>
    </Page>
  </>
);

export default TermsPage;
```

- [ ] **Step 7: Build and verify all four pages render server-side with content**

Run: `yarn build`
Expected: build succeeds and lists `/about`, `/privacy`, `/contact`, `/terms` among the generated static pages.

- [ ] **Step 8: Verify the disclaimer + opt-out links are in the static HTML**

Run: `grep -l "not affiliated" .next/server/pages/about.html && grep -l "aboutads.info" .next/server/pages/privacy.html`
Expected: both files match (content is server-rendered, not JS-gated — so AI crawlers and Googlebot see it).

- [ ] **Step 9: Commit**

```bash
git add ui/components/LegalLayout pages/privacy.tsx pages/about.tsx pages/contact.tsx pages/terms.tsx
git commit -m "feat: add Privacy, About, Contact, Terms pages + IP disclaimer"
```

---

## Task 8: Place disabled `<AdSlot>`s in the page layouts

**Files:**
- Modify: `pages/details/[id].tsx` (insert one `<AdSlot name="detailBelowStats" />` after the stats block, ~line 177)
- Modify: `pages/type-interactions/index.tsx:32` (insert `<AdSlot name="typeChartBelowIntro" />` after `<TypeIntro />`)
- Modify: `pages/index.tsx` (insert `<AdSlot name="homeInGrid" />` below the hero/grid)

**Interfaces:**
- Consumes: `<AdSlot>` (Task 4).
- Produces: reserved (placeholder) ad boxes on the three primary templates. No visual ad until `ADS_ENABLED` is flipped.

- [ ] **Step 1: Add the import + slot to `pages/type-interactions/index.tsx`.** Add the import with the other `ui/components` imports:

```tsx
import AdSlot from "../../ui/components/AdSlot/AdSlot";
```

Then place the slot after `<TypeIntro selected={selected} />` (currently line 32):

```tsx
          <TypeIntro selected={selected} />
          <AdSlot name="typeChartBelowIntro" />
          <TypePicker selected={selected} />
```

- [ ] **Step 2: Add the import + slot to `pages/details/[id].tsx`.** Add the import with the other component imports near the top:

```tsx
import AdSlot from "../../ui/components/AdSlot/AdSlot";
```

Then, immediately after the base-stats table block closes (the stats `</section>`/closing tag around line 177 — locate the stats table rendered at lines 169–177 and place the slot directly after it):

```tsx
        <AdSlot name="detailBelowStats" />
```

Verify by reading the surrounding lines first so the JSX nests correctly (the slot must be a sibling inside the same parent container as the stats block, not inside a `<table>`).

- [ ] **Step 3: Add the import + slot to `pages/index.tsx`.** Add the import with the other component imports, then place the slot as a sibling below the main grid container (read the file first to find the grid's closing tag; the slot goes after the grid, inside the page's root fragment/container):

```tsx
import AdSlot from "../ui/components/AdSlot/AdSlot";
```

```tsx
        <AdSlot name="homeInGrid" />
```

- [ ] **Step 4: Build and verify placeholders render, with no `<ins>` ad markup**

Run: `yarn build && yarn test`
Expected: build succeeds; all tests pass.

- [ ] **Step 5: Verify reserved boxes ship but no ad unit does**

Run: `grep -rl 'data-ad-slot=' .next/server/pages/type-interactions.html && ! grep -rq 'class="adsbygoogle' .next/server/pages/*.html && echo "OK: reserved, no live ad"`
Expected: prints `OK: reserved, no live ad` (placeholder present; no `adsbygoogle` `<ins>` because `ADS_ENABLED` is false).

- [ ] **Step 6: Commit**

```bash
git add pages/details/[id].tsx pages/type-interactions/index.tsx pages/index.tsx
git commit -m "feat: place disabled CLS-safe ad slots on detail, type-chart, home"
```

---

## Owner runbook: enabling ads (NOT part of this phase)

Do these only when you decide to go live — kept here so the flip is mechanical:

1. **AdSense console** → create ad units for each slot; copy their slot ids into `AD_SLOTS` in `config/ads.ts` (replace the empty `slot: ""`).
2. **AdSense console → Privacy & messaging** → create a **GDPR consent message** (Funding Choices). This is the Google-certified CMP / IAB TCF v2.3 integration required to serve personalized ads in EEA/UK/CH. Publish it. (It is delivered via the AdSense tag and will call `gtag('consent','update',…)` for regulated regions, superseding the custom banner there.)
3. Set `ADS_ENABLED = true` in `config/ads.ts`.
4. Re-deploy. Confirm in the browser: the consent message appears for EEA traffic; ad units fill the reserved boxes with **zero layout shift**; check field CLS in Search Console after a few days.
5. Apply for AdSense review only once Phase 3 content depth is in place (thin-content is the #1 rejection reason).

---

## Self-Review

**Spec coverage (Phase 0 of the design doc):**
- (1) Legal/trust pages → Task 7 (Privacy/About/Contact/Terms). ✓
- (2) IP non-affiliation disclaimer (footer + About) → Task 5 (footer) + Task 7 (About). ✓
- (3) Certified consent / Consent Mode v2 + fix GA gating → Task 3 (helper) + Task 6 (bootstrap, GA always-on, update wiring). Funding Choices is a console action → Owner runbook. ✓
- (4) Flag-gated ad infrastructure (CLS-safe AdSlot, placed, disabled) → Task 2 (config) + Task 4 (component) + Task 8 (placement). `preconnect` to pagead2 already present (noted in Global Constraints). ✓

**Placeholder scan:** No TBD/TODO. Every code step shows complete code. The empty `slot: ""` strings are intentional (documented) config, not plan placeholders.

**Type consistency:** `AdSlotName` defined in Task 2 and consumed identically in Tasks 4 & 8. `updateConsent(granted: boolean)` defined in Task 3, called with booleans in Task 6. `AD_SLOTS` keys (`detailBelowStats`, `typeChartBelowIntro`, `homeInGrid`) match between Task 2, the AdSlot tests (Task 4), and placement (Task 8). Route constants (`ABOUT`/`PRIVACY`/`CONTACT`/`TERMS`) defined in Task 5 and used by the Footer; legal pages use literal `canonicalPath` strings matching those routes.

**Note for the implementer:** Tasks 8 step 2/3 require reading the current `pages/details/[id].tsx` and `pages/index.tsx` JSX before inserting, because exact line numbers for the stats block and grid container may have drifted. Place each `<AdSlot>` as a sibling of the surrounding content block, never inside a `<table>` or list.
