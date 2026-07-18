import { allTypeSlugs } from "./typeSlug";
import { allFrTypeSlugs } from "./frTypeSlug";

// A single crawlable internal link: absolute-from-root href + visible label.
export interface BrowseItem {
  href: string;
  label: string;
}

// "fire-water" → "Fire / Water", "fire" → "Fire", "eau-feu" → "Eau / Feu".
// Locale-agnostic: it just title-cases each dash-separated part, so it reads the
// same for the English type slugs and the already-French FR slugs.
export const typeSlugLabel = (slug: string): string =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");

// Every single + two-type matchup page, EN. Mirrors the sitemap's typeSlugs().
export const enTypeComboItems = (): BrowseItem[] =>
  allTypeSlugs().map((slug) => ({ href: `/type-interactions/${slug}`, label: typeSlugLabel(slug) }));

// Every single + two-type matchup page, FR. Index-aligned with enTypeComboItems.
export const frTypeComboItems = (): BrowseItem[] =>
  allFrTypeSlugs().map((slug) => ({ href: `/fr/type-interactions/${slug}`, label: typeSlugLabel(slug) }));

// Map the SSG Pokémon list to detail-page links. Entries missing a slug are
// skipped (they have no reachable detail URL). `frName` is preferred when present
// so the FR index shows French species names; the href always uses `slug`, which
// the fetch layer already localizes per locale.
export const pokemonBrowseItems = (
  pokemons: Array<{ slug?: string; name: string; frName?: string }>,
  base: "/pokemon/" | "/fr/pokemon/",
  preferFrName = false,
): BrowseItem[] =>
  pokemons
    .filter((p) => p.slug)
    .map((p) => ({
      href: `${base}${p.slug}`,
      label: (preferFrName ? p.frName : undefined) ?? p.name,
    }));
