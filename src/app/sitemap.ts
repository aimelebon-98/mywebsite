import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, isNotNull, and } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mywebsite-inky-gamma.vercel.app";

// Revalidate every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes for both locales
  const staticPaths = ["", "/shop", "/about", "/contact", "/faq"];
  const locales = ["en", "fr"];

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of staticPaths) {
      staticEntries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : path === "/shop" ? 0.9 : 0.6,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${path}`,
            fr: `${SITE_URL}/fr${path}`,
          },
        },
      });
    }
  }

  // Product routes - EN (all active, non-noindex)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const enProducts = await db
      .select({
        slug: products.slug,
        updatedAt: products.updatedAt,
        hasFr: products.nameFr,
      })
      .from(products)
      .where(and(eq(products.active, true), eq(products.noIndex, false)));

    for (const p of enProducts) {
      // English URL always
      productEntries.push({
        url: `${SITE_URL}/en/product/${p.slug}`,
        lastModified: p.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/product/${p.slug}`,
            ...(p.hasFr ? { fr: `${SITE_URL}/fr/product/${p.slug}` } : {}),
          },
        },
      });

      // French URL only if translated
      if (p.hasFr) {
        productEntries.push({
          url: `${SITE_URL}/fr/product/${p.slug}`,
          lastModified: p.updatedAt || now,
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: {
              en: `${SITE_URL}/en/product/${p.slug}`,
              fr: `${SITE_URL}/fr/product/${p.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("Sitemap product fetch error:", err);
  }

  return [...staticEntries, ...productEntries];
}
