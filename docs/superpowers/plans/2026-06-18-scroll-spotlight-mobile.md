# Mobile Scroll-Spotlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On touch devices, the Pokemon card crossing the viewport's vertical center "pops" with the same lift/scale as the existing desktop hover, following the scroll.

**Architecture:** A new `useCenterSpotlight(ref)` hook wraps the existing `useIntersectionObserver` with a zero-height center-line `rootMargin`, gated to touch devices via `matchMedia`. `Pokemon.tsx` toggles a `.cardFocused` class from the hook. The CSS for `.cardFocused` reuses the hover transform values and lives inside `@media (hover: none) and (pointer: coarse)`.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules. No JS test framework in this repo — verification is by headless Chrome (CDP) per project convention, plus `yarn lint`.

## Global Constraints

- Desktop (hover-capable) behavior must be unchanged — no extra runtime work, no visual change.
- Touch gate: `(hover: none) and (pointer: coarse)`.
- Center-line detection: `rootMargin: "-50% 0px -50% 0px"`.
- Reuse existing hover transform values verbatim: card `translateY(-5px)` + `box-shadow: 0 24px 46px rgba(0,0,0,0.55)`; hero `scale(1.07) translateY(-4px)`.
- Respect `prefers-reduced-motion: reduce`.
- Follow existing code style: CSS Modules, `memo`, TS interfaces, no new dependencies.

---

### Task 1: `useCenterSpotlight` hook

**Files:**
- Create: `hooks/useCenterSpotlight.ts`
- Reference (do not modify): `hooks/useIntersectionObserver.ts`

**Interfaces:**
- Consumes: `useIntersectionObserver(elementRef, { rootMargin })` → returns `IntersectionObserverEntry | undefined`.
- Produces: `useCenterSpotlight(ref: RefObject<Element | null>): boolean` — `true` only when the element straddles the viewport center AND the device is touch; `false` otherwise (including SSR and desktop).

- [ ] **Step 1: Create the hook**

Create `hooks/useCenterSpotlight.ts`:

```ts
import { RefObject, useEffect, useState } from "react";
import useIntersectionObserver from "./useIntersectionObserver";

// A zero-height line at the viewport's vertical center. An element "intersects"
// only while it straddles this line.
const CENTER_LINE_MARGIN = "-50% 0px -50% 0px";

const isTouchDevice = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

// Returns true while `ref` is centered in the viewport, on touch devices only.
// Used to mirror the desktop hover "pop" as the user scrolls the list.
const useCenterSpotlight = (ref: RefObject<Element | null>): boolean => {
  // Evaluated once after mount (avoids SSR/client mismatch and desktop work).
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(isTouchDevice()), []);

  const entry = useIntersectionObserver(ref, { rootMargin: CENTER_LINE_MARGIN });

  return touch && !!entry?.isIntersecting;
};

export default useCenterSpotlight;
```

Note: `useIntersectionObserver` already no-ops when there is no IO support or no node, and disconnects on unmount. The observer is created regardless of `touch`, but `touch` gates the returned boolean, so desktop gets the class never applied. (Per-card IO is cheap; this keeps the hook simple and matches the existing infinite-scroll pattern.)

- [ ] **Step 2: Type-check / lint the new file**

Run: `yarn lint`
Expected: PASS (no errors for `hooks/useCenterSpotlight.ts`).

- [ ] **Step 3: Commit**

```bash
git add hooks/useCenterSpotlight.ts
git commit -m "feat: add useCenterSpotlight hook for mobile scroll-spotlight"
```

---

### Task 2: Wire the hook into the card + CSS

**Files:**
- Modify: `ui/components/Pokemon/Pokemon.tsx`
- Modify: `ui/components/Pokemon/Pokemon.module.css`

**Interfaces:**
- Consumes: `useCenterSpotlight(ref)` from Task 1.
- Produces: a `.cardFocused` CSS-module class applied to the `<Link>` card when centered on touch.

**Note:** `Pokemon.tsx` already destructures a `priority` prop (added separately) — keep it. The card root is the `next/link` `<Link>`; attach the ref to it.

- [ ] **Step 1: Add the ref + hook in `Pokemon.tsx`**

Add the import near the other hook imports (line ~4):

```tsx
import { useRef } from "react";
import useCenterSpotlight from "../../../hooks/useCenterSpotlight";
```

(Merge `useRef` into the existing `react` import rather than duplicating — the file already imports from `"react"`. Keep `memo`, `useState`, `type CSSProperties`.)

Inside the component body, after `const [heroLoaded, setHeroLoaded] = useState(false);`:

```tsx
const cardRef = useRef<HTMLAnchorElement | null>(null);
const isFocused = useCenterSpotlight(cardRef);
```

Update the `<Link>` opening tag to attach the ref and toggle the class:

```tsx
<Link
  ref={cardRef}
  href={`${DETAILS}${id}`}
  prefetch
  className={`${styles.card} ${isFocused ? styles.cardFocused : ""}`}
  style={{ "--type": cardColor } as CSSProperties}
>
```

- [ ] **Step 2: Add the `.cardFocused` CSS in `Pokemon.module.css`**

Append to the end of `ui/components/Pokemon/Pokemon.module.css`:

```css
/* Mobile scroll-spotlight: the card crossing the viewport center gets the same
   "pop" as desktop hover. Touch-only — desktop drives this via :hover instead. */
@media (hover: none) and (pointer: coarse) {
  .card.cardFocused {
    transform: translateY(-5px);
    box-shadow: 0 24px 46px rgba(0, 0, 0, 0.55);
  }
  .card.cardFocused .heroImg {
    transform: scale(1.07) translateY(-4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card.cardFocused,
  .card.cardFocused .heroImg {
    transform: none;
  }
}
```

- [ ] **Step 3: Lint**

Run: `yarn lint`
Expected: PASS.

- [ ] **Step 4: Verify in headless Chrome (CDP) — touch viewport**

Start the dev server (`yarn dev`) and drive a headless Chrome via CDP:
- Emulate a touch device (e.g. `Emulation.setDeviceMetricsOverride` with mobile width ~390px, and `Emulation.setEmitTouchEventsForMouse` / a touch-capable UA so `(hover: none) and (pointer: coarse)` matches).
- Load `/`, scroll the list so a card sits at the vertical center.
- Assert the centered card's element has the `cardFocused` class and a non-identity `transform` (measure `getComputedStyle(...).transform` — expect a matrix reflecting `translateY(-5px)`), while off-center cards do not.

Expected: exactly the centered card is transformed; it changes as you scroll.

- [ ] **Step 5: Verify in headless Chrome (CDP) — desktop viewport**

Reload with a normal desktop viewport (hover-capable, `(pointer: fine)`):
- Scroll the list and confirm **no** card gets `cardFocused` / a scroll-driven transform.
- Confirm `:hover` still lifts a card when the pointer is over it.

Expected: desktop unchanged.

- [ ] **Step 6: Commit**

```bash
git add ui/components/Pokemon/Pokemon.tsx ui/components/Pokemon/Pokemon.module.css
git commit -m "feat: mobile scroll-spotlight pops the centered Pokemon card"
```

---

## Self-Review

- **Spec coverage:** center-crossing trigger (Task 1 `rootMargin`), single focused card on single-column mobile (zero-height line), reuse hover styling (Task 2 CSS), touch-only via two locks (`matchMedia` in hook + media query in CSS), reduced-motion guard (Task 2), browser verification (Task 2 steps 4–5). All spec sections mapped.
- **Placeholder scan:** none — all code and commands are concrete.
- **Type consistency:** `useCenterSpotlight(ref: RefObject<Element | null>): boolean` defined in Task 1 and consumed in Task 2; `cardRef` typed `HTMLAnchorElement | null` is assignable to `Element | null`. Class name `cardFocused` consistent across TSX and CSS.
