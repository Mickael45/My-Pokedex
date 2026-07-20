import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export → ./out (static HTML/CSS/JS) for Cloudflare Pages.
  output: "export",
  // No runtime image optimizer in a static export (the app uses plain <img> with
  // self-hosted images under /public, so this is effectively a no-op safeguard).
  images: { unoptimized: true },
  // trailingSlash intentionally left at the default (false): the SEO layer
  // (canonical, hreflang, sitemap, language switcher) emits non-slash URLs, so
  // false keeps served URLs consistent with them. Setting it true would make every
  // self-canonical/hreflang point at a 301-redirecting URL.
  reactStrictMode: true,
  // Build-time throttle for the ~2,050 SSG pages that each fetch PokéAPI. Left
  // uncapped, Next spawns ~(cores-1) workers, each running FETCH_CONCURRENCY (see
  // constants/FetchPokemons) parallel fetches → hundreds of concurrent connections
  // to pokeapi.co → ECONNREFUSED/ETIMEDOUT (self-inflicted DoS). We deliberately
  // trade build speed for reliability: few workers, few pages in flight per worker,
  // plus a Next-level retry. Peak connections ≈ cpus × page-fetch fan-out stays polite.
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 2,
  },
};

export default nextConfig;
