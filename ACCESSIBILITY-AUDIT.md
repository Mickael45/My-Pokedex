# Accessibility (WCAG 2.2 AA)

my-pokedex conforms to **WCAG 2.2 AA** against all automated and agent-executable
manual checks. Screen-reader and legal-conformance verification remain human tasks
(see the latest run's Handover section).

**Latest run:** [`audits/web-accessibility/2026-07-18-report.md`](audits/web-accessibility/2026-07-18-report.md)
· sidecar `audits/web-accessibility/latest.json` (validated).

## How it's tested

- **axe-core** over CDP (headless Chrome, no Playwright dependency) against a
  snapshot-replay `next dev` server — 13 representative EN/FR routes/states at
  desktop (1280) and mobile (320), plus a reduced-motion pass. 0 violations.
- **Reflow** measured at a true 320 px layout viewport.
- **Contrast** that axe returns *incomplete* (text over gradients/glass) is
  hand-measured by sampling rendered pixels with `sharp`.
- **ESLint** (`jsx-a11y` via `next/core-web-vitals`) — 0 errors.

Re-run the audit with the `web-accessibility` skill. The harness scripts are not
committed (they live in the session scratchpad); the method is documented in the
dated report.

## Durable invariants (don't regress)

- **Type chips / cards / detail hero fill with `getTypeChipColor`** (AA-safe
  deepened type colour), not the raw type colour — white text needs it.
- **`box-sizing` is `content-box` site-wide** (Tailwind Preflight disabled): any
  `width:100%` + padding element needs explicit `box-sizing:border-box` or it
  overflows 320 px.
- **Skip link** (`a.skipLink` → `<main id="main" tabindex="-1">`) must stay the
  first focusable element.
- **`.srOnly`** and the global `prefers-reduced-motion` block live in
  `styles/globals.css`.
- Interactive type chips are `<button aria-pressed>` with an `aria-label` (the
  visible label is `display:none` on mobile).

## Not applicable

No video/audio (captions N/A); the only form is a free-text site search (no
error-association or autocomplete tokens).
