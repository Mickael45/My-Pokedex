# Scroll-spotlight on touch devices — design

## Problem

On desktop, hovering a Pokemon card lifts it and scales the hero sprite
(`.card:hover` in `Pokemon.module.css`). On a phone there is no hover, so the
list stays flat while scrolling. We want the same "pop" to happen on touch
devices as cards scroll past — a spotlight that follows the scroll.

## Behavior

- The card crossing the **vertical center** of the viewport is focused.
- It pops as it reaches center, holds while centered, and releases as it moves
  away (in the 28px gap before the next card takes over). Single-column on a
  phone (card is `17.5rem` / 280px wide), so exactly one card is focused at a
  time.
- The focused look is **identical to the existing desktop hover**: card
  `translateY(-5px)` + larger shadow, hero image `scale(1.07) translateY(-4px)`.
- **Touch devices only.** Desktop hover is untouched and runs no extra work.
- Respects `prefers-reduced-motion: reduce` — no pop for users who opt out.

## Mechanism

Per-card `IntersectionObserver` against a zero-height line at the viewport
center, via `rootMargin: "-50% 0px -50% 0px"`. A card intersects only while it
straddles that line. No scroll listeners — reuses the existing
`useIntersectionObserver` hook already used for infinite scroll.

Two independent locks keep it off desktop:

1. The observer only activates when
   `matchMedia("(hover: none) and (pointer: coarse)")` matches.
2. The `.cardFocused` CSS lives inside `@media (hover: none) and
   (pointer: coarse)`, so the class is inert on desktop even if applied.

## Components

- **`hooks/useCenterSpotlight.ts`** (new) — `useCenterSpotlight(ref)` wraps
  `useIntersectionObserver(ref, { rootMargin: "-50% 0px -50% 0px" })`. Returns
  `false` on non-touch (gated by `matchMedia`), otherwise
  `entry?.isIntersecting`.
- **`ui/components/Pokemon/Pokemon.tsx`** — add a ref on the `<Link>` card,
  toggle `styles.cardFocused` from the hook. (Note: this file already takes a
  `priority` prop added separately — leave it intact.)
- **`ui/components/Pokemon/Pokemon.module.css`** — add `.card.cardFocused` rules
  inside `@media (hover: none) and (pointer: coarse)`, reusing the existing
  hover transform values; guarded by `prefers-reduced-motion`.

## Out of scope

- No proportional/distance-based scaling — binary focused/not.
- No change to desktop hover.
- No change to the multi-column desktop layout behavior.

## Testing / verification

Verify in headless Chrome via CDP (per project convention): emulate a touch
viewport, scroll the list, confirm the centered card has the focused transform
and others do not; confirm desktop (hover-capable) viewport shows no focused
class while scrolling.
