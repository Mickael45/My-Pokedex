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
};

export default nextConfig;
