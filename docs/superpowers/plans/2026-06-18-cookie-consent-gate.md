# Cookie Consent Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load Google AdSense and Google Analytics only after the visitor clicks "Accept", so the default (no-interaction) page sets no Google third-party cookies and the Lighthouse Best Practices audits pass.

**Architecture:** A `ConsentContext` (mirroring the existing `ThemeContext`/`ResolutionContext` pattern) holds `"granted" | "denied" | "unset"`, persisted to `localStorage` via a `useConsent` hook. A `ConsentScripts` component renders the AdSense `next/script` and `<GoogleAnalytics>` only when consent is granted. A `CookieConsentBanner` collects the choice; a "Cookie settings" control in the nav re-opens it. The AdSense `<script>` is removed from `_document.tsx`.

**Tech Stack:** Next.js 16 (pages router), React 19, TypeScript, `@next/third-parties`, `next/script`, CSS Modules.

## Global Constraints

- No new npm dependencies. (No test runner exists in this repo; verification is `next build` typecheck + headless-Chrome network/cookie inspection.)
- AdSense client id is `ca-pub-3950888851778991`; GA id is `G-6FS0YBDE8T` — copy verbatim.
- Follow existing conventions: contexts in `context/` using `createContext` with an `IContextProps` interface; components in `ui/components/<Name>/<Name>.tsx` with a sibling `<Name>.module.css`; constants in `constants/`.
- Consent values are the exact strings `"granted"`, `"denied"`, `"unset"`. localStorage key is exactly `cookie-consent`.
- Initial consent on server + first client render MUST be `"unset"` (no localStorage read during render) to avoid hydration mismatches; read localStorage in a `useEffect`.
- Keep `<meta name="google-site-verification" content="Frk8KQk9JRTwCY5Sz2HlwbSwTdIZPlsu6lcC7M1AMrY" />` and the `preconnect`/`dns-prefetch` hints in `_document.tsx`. Only remove the AdSense `<script>` and the `google-adsense-account` meta.

---

### Task 1: Consent constants + context

**Files:**
- Create: `constants/Consent.ts`
- Create: `context/ConsentContext.ts`

**Interfaces:**
- Produces:
  - `constants/Consent.ts`: `GRANTED = "granted"`, `DENIED = "denied"`, `UNSET = "unset"`, `CONSENT_STORAGE_KEY = "cookie-consent"`; type `CONSENT = "granted" | "denied" | "unset"`.
  - `context/ConsentContext.ts`: default export `createContext<{ consent: CONSENT; setConsent: (c: CONSENT) => void }>` with default `{ consent: UNSET, setConsent: () => {} }`.

- [ ] **Step 1: Create the constants file**

```ts
// constants/Consent.ts
export const GRANTED = "granted";
export const DENIED = "denied";
export const UNSET = "unset";

export const CONSENT_STORAGE_KEY = "cookie-consent";

export type CONSENT = typeof GRANTED | typeof DENIED | typeof UNSET;
```

- [ ] **Step 2: Create the context**

```ts
// context/ConsentContext.ts
import { createContext } from "react";
import { CONSENT, UNSET } from "../constants/Consent";

interface IContextProps {
  consent: CONSENT;
  setConsent: (consent: CONSENT) => void;
}

export default createContext<IContextProps>({
  consent: UNSET,
  setConsent: () => {},
});
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 4: Commit**

```bash
git add constants/Consent.ts context/ConsentContext.ts
git commit -m "feat: add consent constants and context"
```

---

### Task 2: useConsent hook (state + localStorage persistence)

**Files:**
- Create: `hooks/useConsent.ts`

**Interfaces:**
- Consumes: `CONSENT`, `GRANTED`, `DENIED`, `UNSET`, `CONSENT_STORAGE_KEY` from `constants/Consent`.
- Produces: default export `useConsent(): { consent: CONSENT; setConsent: (c: CONSENT) => void }`. `setConsent(UNSET)` removes the localStorage key; other values are written through.

- [ ] **Step 1: Create the hook**

```ts
// hooks/useConsent.ts
import { useEffect, useState } from "react";
import { CONSENT, CONSENT_STORAGE_KEY, GRANTED, DENIED, UNSET } from "../constants/Consent";

const isValid = (value: string | null): value is CONSENT =>
  value === GRANTED || value === DENIED;

const useConsent = () => {
  // Always start UNSET so server and first client render match (no hydration drift).
  const [consent, setConsentState] = useState<CONSENT>(UNSET);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (isValid(stored)) {
      setConsentState(stored);
    }
  }, []);

  const setConsent = (next: CONSENT) => {
    setConsentState(next);
    if (next === UNSET) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
    }
  };

  return { consent, setConsent };
};

export default useConsent;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add hooks/useConsent.ts
git commit -m "feat: add useConsent hook with localStorage persistence"
```

---

### Task 3: ConsentScripts component (conditional AdSense + GA)

**Files:**
- Create: `ui/components/ConsentScripts/ConsentScripts.tsx`

**Interfaces:**
- Consumes: `ConsentContext` (default export from `context/ConsentContext`), `GRANTED` from `constants/Consent`.
- Produces: default export `ConsentScripts` (no props). Renders the AdSense script + `<GoogleAnalytics>` only when `consent === GRANTED`, else `null`.

- [ ] **Step 1: Create the component**

```tsx
// ui/components/ConsentScripts/ConsentScripts.tsx
import { useContext } from "react";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import ConsentContext from "../../../context/ConsentContext";
import { GRANTED } from "../../../constants/Consent";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3950888851778991";

const ConsentScripts = () => {
  const { consent } = useContext(ConsentContext);

  if (consent !== GRANTED) {
    return null;
  }

  return (
    <>
      <Script
        id="adsbygoogle-init"
        src={ADSENSE_SRC}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <GoogleAnalytics gaId="G-6FS0YBDE8T" />
    </>
  );
};

export default ConsentScripts;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add ui/components/ConsentScripts/ConsentScripts.tsx
git commit -m "feat: add ConsentScripts to load ads/analytics only when granted"
```

---

### Task 4: CookieConsentBanner component

**Files:**
- Create: `ui/components/CookieConsentBanner/CookieConsentBanner.tsx`
- Create: `ui/components/CookieConsentBanner/CookieConsentBanner.module.css`

**Interfaces:**
- Consumes: `ConsentContext`, `GRANTED`, `DENIED`, `UNSET` from `constants/Consent`.
- Produces: default export `CookieConsentBanner` (no props). Renders a fixed bottom banner only when `consent === UNSET`; Accept → `setConsent(GRANTED)`, Reject → `setConsent(DENIED)`.

- [ ] **Step 1: Create the styles**

```css
/* ui/components/CookieConsentBanner/CookieConsentBanner.module.css */
.banner {
  position: fixed;
  left: 50%;
  bottom: max(16px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  width: min(680px, calc(100vw - 32px));
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(20, 20, 24, 0.92);
  color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.text {
  flex: 1 1 240px;
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.button {
  border: 0;
  border-radius: 9px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.accept {
  background: #ffcb05;
  color: #2a2a2a;
}

.reject {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Keep clear of the mobile bottom tab bar. */
@media screen and (max-width: 800px) {
  .banner {
    bottom: calc(72px + env(safe-area-inset-bottom));
  }
}
```

- [ ] **Step 2: Create the component**

```tsx
// ui/components/CookieConsentBanner/CookieConsentBanner.tsx
import { useContext } from "react";
import ConsentContext from "../../../context/ConsentContext";
import { GRANTED, DENIED, UNSET } from "../../../constants/Consent";
import styles from "./CookieConsentBanner.module.css";

const CookieConsentBanner = () => {
  const { consent, setConsent } = useContext(ConsentContext);

  if (consent !== UNSET) {
    return null;
  }

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p className={styles.text}>
        We use cookies for ads and analytics. Accept to support the site, or reject to
        browse without them.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.reject}`}
          onClick={() => setConsent(DENIED)}
        >
          Reject
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.accept}`}
          onClick={() => setConsent(GRANTED)}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add ui/components/CookieConsentBanner/
git commit -m "feat: add cookie consent banner"
```

---

### Task 5: Wire context, scripts, and banner into _app.tsx

**Files:**
- Modify: `pages/_app.tsx`

**Interfaces:**
- Consumes: `useConsent` (Task 2), `ConsentContext` (Task 1), `ConsentScripts` (Task 3), `CookieConsentBanner` (Task 4).
- Produces: nothing for later tasks.

- [ ] **Step 1: Edit `pages/_app.tsx`**

Replace the GoogleAnalytics import and usage. Remove:

```tsx
import { GoogleAnalytics } from "@next/third-parties/google";
```

Add these imports alongside the other imports:

```tsx
import ConsentContext from "../context/ConsentContext";
import useConsent from "../hooks/useConsent";
import ConsentScripts from "../ui/components/ConsentScripts/ConsentScripts";
import CookieConsentBanner from "../ui/components/CookieConsentBanner/CookieConsentBanner";
```

In the component body, add (next to the other `useState` lines):

```tsx
  const { consent, setConsent } = useConsent();
```

Replace the returned JSX so the tree is wrapped in `ConsentContext.Provider`, the always-on `<GoogleAnalytics>` is gone, and `<ConsentScripts />` + `<CookieConsentBanner />` are rendered:

```tsx
  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      <ConsentScripts />
      <div data-resolution={resolution} className={styles.container} data-theme={theme}>
        <ResolutionContext.Provider value={{ resolution, setResolution }}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            <ErrorContext.Provider value={{ error, setError }}>
              <LoadingContext.Provider value={{ loading, setLoading }}>
                <PokemonContext.Provider value={{ filteredPokemons, pokemons, setPokemons }}>
                  <>
                    <NavigationBar />
                    <main>
                      <Component {...pageProps} />
                    </main>
                    <CookieConsentBanner />
                  </>
                </PokemonContext.Provider>
              </LoadingContext.Provider>
            </ErrorContext.Provider>
          </ThemeContext.Provider>
        </ResolutionContext.Provider>
      </div>
    </ConsentContext.Provider>
  );
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add pages/_app.tsx
git commit -m "feat: gate ads/analytics behind consent in _app"
```

---

### Task 6: Remove AdSense script from _document.tsx

**Files:**
- Modify: `pages/_document.tsx`

**Interfaces:**
- Consumes: nothing. Produces: nothing.

- [ ] **Step 1: Edit `pages/_document.tsx`**

Delete these two lines (the AdSense loader and its account meta):

```tsx
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3950888851778991"
          crossOrigin="anonymous"></script>
        <meta name="google-adsense-account" content="ca-pub-3950888851778991"></meta>
```

Keep everything else: the `preconnect`/`dns-prefetch` hints in `<Head>`, the `google-site-verification` meta, and the `<body>` with `<Main />`/`<NextScript />`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add pages/_document.tsx
git commit -m "refactor: remove always-on AdSense loader from _document"
```

---

### Task 7: "Cookie settings" control in NavigationBar

**Files:**
- Modify: `ui/components/NavigationBar/NavigationBar.tsx`
- Modify: `ui/components/NavigationBar/NavigationBar.module.css`

**Interfaces:**
- Consumes: `ConsentContext`, `UNSET` from `constants/Consent`.
- Produces: nothing.

- [ ] **Step 1: Add imports to `NavigationBar.tsx`**

```tsx
import { useContext } from "react";
import ConsentContext from "../../../context/ConsentContext";
import { UNSET } from "../../../constants/Consent";
```

(Merge `useContext` into the existing `react` import rather than duplicating it.)

- [ ] **Step 2: Read consent setter in the component body**

Just after `const router = useRouter();`:

```tsx
  const { setConsent } = useContext(ConsentContext);
```

- [ ] **Step 3: Add the control to `renderControls()`**

`renderControls()` is rendered in both the desktop cluster and the mobile sheet, so adding it once covers both. Update it to:

```tsx
  const renderControls = () => (
    <>
      {isHome && <ListSortingDropdown />}
      <ThemeToggleSwitch />
      <ResolutionToggleSwitch />
      <button
        type="button"
        className={styles.cookieBtn}
        onClick={() => setConsent(UNSET)}
      >
        Cookie settings
      </button>
    </>
  );
```

- [ ] **Step 4: Add minimal styling**

Append to `NavigationBar.module.css`:

```css
.cookieBtn {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  padding: 4px 6px;
  white-space: nowrap;
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add ui/components/NavigationBar/NavigationBar.tsx ui/components/NavigationBar/NavigationBar.module.css
git commit -m "feat: add Cookie settings control to re-open consent banner"
```

---

### Task 8: Behavioral verification (build + headless Chrome)

**Files:** none (verification only).

**Interfaces:** Consumes the running app. Produces: nothing.

- [ ] **Step 1: Production build**

Run: `yarn build`
Expected: build succeeds with no type errors.

- [ ] **Step 2: Start the production server**

Run: `yarn start` (serves on http://localhost:3000)

- [ ] **Step 3: Verify NO Google requests fire by default**

Open the site in headless Chrome via CDP (or DevTools Network tab) without touching the banner. Filter network requests.
Expected: **zero** requests to `pagead2.googlesyndication.com`, `googlesyndication.com`, or `google-analytics.com` / `googletagmanager.com`. The consent banner is visible. No `__mggpc__` cookie present.

- [ ] **Step 4: Verify scripts load after Accept**

Click **Accept**. Reload network view.
Expected: `adsbygoogle.js` and the GA script now load; banner disappears; `cookie-consent=granted` in localStorage.

- [ ] **Step 5: Verify Reject path**

Clear `localStorage`, reload, click **Reject**.
Expected: banner disappears, still no Google requests, `cookie-consent=denied` in localStorage.

- [ ] **Step 6: Verify re-consent**

Click **Cookie settings** in the nav (desktop cluster or mobile sheet).
Expected: banner re-appears.

- [ ] **Step 7: Re-run Lighthouse Best Practices**

Run Lighthouse against the default (no-interaction) page.
Expected: "Uses third-party cookies" and "Issues panel" audits no longer fire; Best Practices score rises from 77.

- [ ] **Step 8: Commit (if any verification-driven fixes were made)**

```bash
git add -A
git commit -m "test: verify consent gate blocks Google scripts until accepted"
```

---

## Self-Review

**Spec coverage:**
- Gate AdSense + GA → Tasks 3, 5, 6. ✓
- Reject/Accept banner for everyone → Task 4. ✓
- Re-consent control → Task 7. ✓
- localStorage persistence, `"unset"` initial, no hydration mismatch → Task 2. ✓
- Remove AdSense from `_document`, keep hints + site-verification → Task 6. ✓
- Lighthouse audits clear → Task 8 (verification). ✓
- Out of scope (geo, server-side, per-vendor toggles) → not implemented, as specified. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. ✓

**Type consistency:** `CONSENT`, `GRANTED`/`DENIED`/`UNSET`, `CONSENT_STORAGE_KEY`, `useConsent`, `ConsentContext`, `ConsentScripts`, `CookieConsentBanner` used identically across tasks. ✓
