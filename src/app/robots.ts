import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/product",
          "/product/",
          "/shop",
          "/about",
          "/contact",
          "/faq",
          "/en/product",
          "/en/shop",
          "/en/about",
          "/en/contact",
          "/en/faq",
          "/fr/product",
          "/fr/shop",
          "/fr/about",
          "/fr/contact",
          "/fr/faq",
          "/admin",
          "/admin/",
          "/api/",
          "/_next/",
          "/wishlist",
          "/cart",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
