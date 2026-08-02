import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/_next/",
          "/cart",
          "/checkout",
          "/wishlist",
          "/account/",
          "/en/cart",
          "/en/checkout",
          "/en/wishlist",
          "/en/account/",
          "/fr/cart",
          "/fr/checkout",
          "/fr/wishlist",
          "/fr/account/",
          // Old / test / setup endpoints
          "/api/",
          // Do not index search result pages with query params (thin content)
          "/*?search=*",
        ],
      },
      // Block AI scraping bots
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
