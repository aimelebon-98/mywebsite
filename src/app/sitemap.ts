import { MetadataRoute } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://solevault.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Category pages
  const categories = ["sneakers", "running", "formal", "boots", "sandals", "casual"];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/shop?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const allProducts = await db
      .select({ id: products.id, slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.active, true))
      .orderBy(desc(products.updatedAt));

    productPages = allProducts.map((product) => ({
      url: `${baseUrl}/product/${product.slug || product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Tables might not exist yet
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
