# Cookie Consent Gate — Design

**Date:** 2026-06-18
**Goal:** Raise the Lighthouse **Best Practices** score (currently 77) by ensuring no
Google third-party cookies are set unless the visitor explicitly consents.

## Problem

All flagged Lighthouse Best Practices issues trace to a single source — the Google
AdSense loader in `pages/_document.tsx`:

- **"Uses third-party cookies"** — `__mggpc__` from `pagead2.googlesyndication.com`.
- **"Issues logged in the Issues panel"** — four entries, all from
  `pagead2.googlesyndication.com` (`show_ads_impl_fy2021.js`, `zrt_lookup_fy2021.html`,
  `/pagead/ads?client=…`, `/bg/…js`).

These are inherent to AdSense: while `adsbygoogle.js` runs during the Lighthouse run,
the audits fail. There is no configuration that keeps the script loaded but stops it
from setting cookies. Google Analytics (loaded via `@next/third-parties` in `_app.tsx`)
sets a first-party `_ga` cookie and was **not** flagged, but it is in-scope for a proper
consent gate.

## Decision

Build a **custom lightweight consent gate** (no new dependencies, no extra third-party
scripts). Both AdSense and Google Analytics load **only after the visitor clicks
Accept**. Default state (including the no-interaction Lighthouse run) loads nothing from
Google, clearing the audits.

Approaches considered and rejected:
- **Google Consent Mode v2** — `adsbygoogle.js` still loads during the Lighthouse run, so
  the audits would not fully clear. Wrong fit for the score goal.
- **Off-the-shelf CMP (e.g. Cookiebot)** — a certified CMP is itself a third-party
  script and can reintroduce the issues; adds a dependency/cost. Overkill.

## Scope

- **In scope:** gate AdSense **and** Google Analytics behind consent.
- **Consent UX:** banner with **Reject** and **Accept** buttons, shown to all visitors
  until they choose.
- **Re-consent:** a "Cookie settings" control re-opens the banner so users can change
  their choice.

## Architecture

Follows the existing context + hook + CSS-module conventions in the codebase
(`ThemeContext`, `ResolutionContext`, per-component `*.module.css`).

### 1. Consent state & persistence

- **`context/ConsentContext.ts`** — provides `{ consent, setConsent }`.
  - `consent: "granted" | "denied" | "unset"`.
- **`hooks/useConsent.ts`** — owns the state and persistence.
  - Initial value is `"unset"` on the server and first client render (prevents hydration
    mismatch).
  - A `useEffect` reads `localStorage["cookie-consent"]` after mount and updates state.
  - `setConsent(value)` writes through to `localStorage` (`"granted"` / `"denied"`);
    setting `"unset"` removes the key (used to re-open the banner).
  - localStorage is first-party → never flagged by Lighthouse.

### 2. Conditional script loading

- **`pages/_document.tsx`**
  - Remove the AdSense `<script src="…adsbygoogle.js…">` and the
    `<meta name="google-adsense-account">` tag.
  - Keep the `preconnect` / `dns-prefetch` resource hints (they set no cookies and only
    warm connections used after consent).
  - Keep `<meta name="google-site-verification">`.
- **`ui/components/ConsentScripts/ConsentScripts.tsx`** — new client component.
  - Reads `consent` from context.
  - When `consent === "granted"`, renders:
    - `next/script` for `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3950888851778991`
      with `strategy="afterInteractive"` and `crossOrigin="anonymous"`.
    - `<GoogleAnalytics gaId="G-6FS0YBDE8T" />` (moved out of `_app.tsx`).
  - Renders nothing otherwise.
- **`pages/_app.tsx`**
  - Wrap the provider tree in `ConsentContext.Provider` (value from `useConsent`).
  - Remove the always-on `<GoogleAnalytics>`; render `<ConsentScripts />` instead.
  - Render `<CookieConsentBanner />` once, near the app root.

### 3. Banner & re-consent control

- **`ui/components/CookieConsentBanner/CookieConsentBanner.tsx`** (+ `.module.css`).
  - Fixed banner pinned to the bottom of the viewport, themed to match the app.
  - Short copy: site uses cookies for ads & analytics.
  - **Reject** → `setConsent("denied")`; **Accept** → `setConsent("granted")`.
  - Visible only when `consent === "unset"`.
- **`ui/components/NavigationBar/NavigationBar.tsx`**
  - Add a "Cookie settings" control inside `renderControls()` (already shared by the
    desktop control cluster and the mobile options sheet). Clicking it calls
    `setConsent("unset")`, which re-shows the banner.

## Data flow

1. First visit → `consent = "unset"` → banner shown, no Google scripts load.
2. **Accept** → `consent = "granted"`, persisted → `ConsentScripts` mounts AdSense + GA.
3. **Reject** → `consent = "denied"`, persisted → nothing loads; banner hidden.
4. **Cookie settings** → `consent = "unset"` → banner re-appears; scripts unmount if
   they were mounted.
5. Lighthouse / no interaction → stays `"unset"` → no Google cookies → audits clear.

## Out of scope

- Geo-targeting (banner shown to everyone, not just EEA/UK).
- Server-side consent enforcement (client-side gate only).
- Granular per-vendor toggles (single Accept/Reject for the whole bundle).

## Success criteria

- With no banner interaction, no requests to `pagead2.googlesyndication.com` or GA fire;
  Lighthouse Best Practices "third-party cookies" and "Issues panel" audits pass.
- After Accept, AdSense and GA load and function.
- Choice persists across reloads; "Cookie settings" re-opens the banner.
- No hydration warnings; no new third-party dependencies.
