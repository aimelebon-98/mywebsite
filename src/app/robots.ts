import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

export default function robots(): MetadataRoute.Robots {
  const commonDisallow = [
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
    "/*?search=*",
  ];

  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallow,
      },
      // Googlebot - explicit priority rule
      {
        userAgent: "Googlebot",
        allow: ["/", "/en/", "/fr/"],
        disallow: commonDisallow,
      },
      // Google Image bot - allow product images
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Bingbot - explicit
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: commonDisallow,
      },
      // AI crawlers - opt in to be cited by ChatGPT, Claude, Perplexity
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/account/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/account/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/account/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/account/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/api/", "/account/"],
      },
      // Block bad bots that waste crawl budget
      {
        userAgent: "AhrefsBot",
        disallow: "/",
      },
      {
        userAgent: "SemrushBot",
        disallow: "/",
      },
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
      {
        userAgent: "DotBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}