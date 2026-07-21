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
    // In LIVE/record builds each of the ~2,050 SSG pages fetches PokéAPI, so we cap
    // workers for network politeness. In REPLAY (the swarm/Pi build) there is no
    // network — pages read the promoted 72 MB snapshot, and each Next worker holds a
    // full ~460 MB parsed copy in RSS. Two workers (~1.2 GB) sit right at the Pi's
    // MemoryHigh cap and risk an OOM kill; one worker (~0.6 GB) is safe. So: 1 worker
    // in replay (slow-but-complete beats fast-and-crashy), 2 otherwise.
    cpus: process.env.POKEDEX_SNAPSHOT === "replay" ? 1 : 2,
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 2,
  },
};

export default nextConfig;
