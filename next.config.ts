// BUILD-MARKER: 2026-08-07T21:44:25.5425433+00:00
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Tighter sizes for better mobile optimization
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 150, 200, 256, 300, 384],
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/react",
      "@tiptap/starter-kit",
    ]
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/(.*)\\.(woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // CACHE_HTML_PAGES_RULE - force CDN cache on dynamic HTML pages
      // Cache-Control is respected by browsers
      // CDN-Cache-Control is Vercel-specific (overrides dynamic no-store)
      // Cloudflare-CDN-Cache-Control is CF-specific
      // Excludes: cart, checkout, wishlist, account (personalized), api, admin
      {
        source: "/((?!_next|api|admin|cart|checkout|wishlist|account|.*\\.).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=60, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=86400" },
          { key: "Cloudflare-CDN-Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=86400" },
          { key: "Vary", value: "Cookie, Accept-Language, cf-ipcountry" },
        ],
      },

      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
