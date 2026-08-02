import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products, blogPosts, authors } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

export const revalidate = 3600;

interface StaticPageConfig {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

const STATIC_PAGES: StaticPageConfig[] = [
  { path: "",           priority: 1.0, changeFrequency: "daily" },
  { path: "/shop",      priority: 0.95, changeFrequency: "daily" },
  { path: "/blog",      priority: 0.9, changeFrequency: "daily" },
  { path: "/about",     priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact",   priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq",       priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy",   priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms",     priority: 0.3, changeFrequency: "yearly" },
  { path: "/shipping",  priority: 0.5, changeFrequency: "monthly" },
  { path: "/returns",   priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const locales = ["en", "fr"];
  const entries: MetadataRoute.Sitemap = [];

  // Static pages - both locales
  for (const cfg of STATIC_PAGES) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${cfg.path}`,
        lastModified: now,
        changeFrequency: cfg.changeFrequency,
        priority: cfg.priority,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${cfg.path}`,
            fr: `${SITE_URL}/fr${cfg.path}`,
            "x-default": `${SITE_URL}/en${cfg.path}`,
          },
        },
      });
    }
  }

  // Products - use slugFr when available for French URLs
  try {
    const enProducts = await db
      .select({
        slug: products.slug,
        slugFr: products.slugFr,
        updatedAt: products.updatedAt,
        nameFr: products.nameFr,
      })
      .from(products)
      .where(and(eq(products.active, true), eq(products.noIndex, false)));

    for (const p of enProducts) {
      const hasFr = Boolean(p.nameFr && p.nameFr.trim());
      const frSlug = (p.slugFr && p.slugFr.trim()) ? p.slugFr : p.slug;
      const lastMod = p.updatedAt || now;

      // English URL
      entries.push({
        url: `${SITE_URL}/en/product/${p.slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.85,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/product/${p.slug}`,
            ...(hasFr ? { fr: `${SITE_URL}/fr/product/${frSlug}` } : {}),
            "x-default": `${SITE_URL}/en/product/${p.slug}`,
          },
        },
      });

      // French URL (only if translation exists)
      if (hasFr) {
        entries.push({
          url: `${SITE_URL}/fr/product/${frSlug}`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.85,
          alternates: {
            languages: {
              en: `${SITE_URL}/en/product/${p.slug}`,
              fr: `${SITE_URL}/fr/product/${frSlug}`,
              "x-default": `${SITE_URL}/en/product/${p.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap] Product fetch error:", err);
  }

  // Blog posts - use slugFr when available
  try {
    const posts = await db
      .select({
        slug: blogPosts.slug,
        slugFr: blogPosts.slugFr,
        updatedAt: blogPosts.updatedAt,
        publishedAt: blogPosts.publishedAt,
        titleFr: blogPosts.titleFr,
      })
      .from(blogPosts)
      .where(and(eq(blogPosts.published, true), eq(blogPosts.noIndex, false)));

    for (const p of posts) {
      const hasFr = Boolean(p.titleFr && p.titleFr.trim());
      const frSlug = (p.slugFr && p.slugFr.trim()) ? p.slugFr : p.slug;
      const lastMod = p.updatedAt || p.publishedAt || now;

      entries.push({
        url: `${SITE_URL}/en/blog/${p.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/blog/${p.slug}`,
            ...(hasFr ? { fr: `${SITE_URL}/fr/blog/${frSlug}` } : {}),
            "x-default": `${SITE_URL}/en/blog/${p.slug}`,
          },
        },
      });

      if (hasFr) {
        entries.push({
          url: `${SITE_URL}/fr/blog/${frSlug}`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${SITE_URL}/en/blog/${p.slug}`,
              fr: `${SITE_URL}/fr/blog/${frSlug}`,
              "x-default": `${SITE_URL}/en/blog/${p.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap] Blog fetch error:", err);
  }

  // Author pages
  try {
    const authorList = await db
      .select({ slug: authors.slug })
      .from(authors)
      .where(eq(authors.active, true));

    for (const a of authorList) {
      for (const locale of locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/blog/author/${a.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.5,
          alternates: {
            languages: {
              en: `${SITE_URL}/en/blog/author/${a.slug}`,
              fr: `${SITE_URL}/fr/blog/author/${a.slug}`,
              "x-default": `${SITE_URL}/en/blog/author/${a.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap] Author fetch error:", err);
  }

  return entries;
}
