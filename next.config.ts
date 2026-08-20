// BUILD-MARKER: 2026-08-07T21:44:25.5425433+00:00
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "newdealzone.com" },
      { protocol: "https", hostname: "www.newdealzone.com" },
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
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.facebook.com https://*.fbcdn.net https://challenges.cloudflare.com https://vitals.vercel-insights.com https://*.vercel.app https://*.newdealzone.com https://www.clarity.ms; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me https://api.whatsapp.com; upgrade-insecure-requests;" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
