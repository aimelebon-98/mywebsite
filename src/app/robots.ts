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
          "/*?search=*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
