import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products, blogPosts, authors } from "@/db/schema";
import { eq, isNotNull, and } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mywebsite-inky-gamma.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = ["", "/shop", "/blog", "/about", "/contact", "/faq", "/privacy", "/terms", "/shipping", "/returns"];
  const locales = ["en", "fr"];

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of staticPaths) {
      staticEntries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : path === "/blog" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : path === "/shop" ? 0.9 : path === "/blog" ? 0.9 : 0.6,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${path}`,
            fr: `${SITE_URL}/fr${path}`,
          },
        },
      });
    }
  }

  // Products
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const enProducts = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt, hasFr: products.nameFr })
      .from(products)
      .where(and(eq(products.active, true), eq(products.noIndex, false)));

    for (const p of enProducts) {
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

  // Blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt, publishedAt: blogPosts.publishedAt, hasFr: blogPosts.titleFr })
      .from(blogPosts)
      .where(and(eq(blogPosts.published, true), eq(blogPosts.noIndex, false)));

    for (const p of posts) {
      const lastMod = p.updatedAt || p.publishedAt || now;
      blogEntries.push({
        url: `${SITE_URL}/en/blog/${p.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            en: `${SITE_URL}/en/blog/${p.slug}`,
            ...(p.hasFr ? { fr: `${SITE_URL}/fr/blog/${p.slug}` } : {}),
          },
        },
      });
      if (p.hasFr) {
        blogEntries.push({
          url: `${SITE_URL}/fr/blog/${p.slug}`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.7,
          alternates: {
            languages: {
              en: `${SITE_URL}/en/blog/${p.slug}`,
              fr: `${SITE_URL}/fr/blog/${p.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("Sitemap blog fetch error:", err);
  }

  // Author pages
  let authorEntries: MetadataRoute.Sitemap = [];
  try {
    const authorList = await db
      .select({ slug: authors.slug })
      .from(authors)
      .where(eq(authors.active, true));

    for (const a of authorList) {
      for (const locale of locales) {
        authorEntries.push({
          url: `${SITE_URL}/${locale}/blog/author/${a.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.5,
          alternates: {
            languages: {
              en: `${SITE_URL}/en/blog/author/${a.slug}`,
              fr: `${SITE_URL}/fr/blog/author/${a.slug}`,
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("Sitemap author fetch error:", err);
  }

  return [...staticEntries, ...productEntries, ...blogEntries, ...authorEntries];
}
