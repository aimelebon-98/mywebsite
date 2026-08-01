import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, blogPosts } from "@/db/schema";
import { and, isNotNull, or, isNull, eq, sql } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  const results = { products: 0, blogPosts: 0, errors: [] as string[] };

  // ==========================================================
  // BACKFILL PRODUCTS
  // ==========================================================
  try {
    const emptyFrProducts = await db
      .select()
      .from(products)
      .where(
        and(
          isNotNull(products.nameFr),
          or(isNull(products.slugFr), eq(products.slugFr, ""))
        )
      );

    for (const p of emptyFrProducts) {
      if (!p.nameFr) continue;
      const newSlugFr = generateSlug(p.nameFr);
      if (!newSlugFr) continue;

      try {
        await db.update(products).set({ slugFr: newSlugFr }).where(eq(products.id, p.id));
        results.products++;
      } catch (err) {
        // Might fail on unique constraint - append number
        try {
          const uniqueSlug = `${newSlugFr}-${p.id.slice(0, 6)}`;
          await db.update(products).set({ slugFr: uniqueSlug }).where(eq(products.id, p.id));
          results.products++;
        } catch (err2) {
          results.errors.push(`Product ${p.name}: ${String(err2)}`);
        }
      }
    }
  } catch (err) {
    results.errors.push(`Products query: ${String(err)}`);
  }

  // ==========================================================
  // BACKFILL BLOG POSTS
  // ==========================================================
  try {
    const emptyFrPosts = await db
      .select()
      .from(blogPosts)
      .where(
        and(
          isNotNull(blogPosts.titleFr),
          or(isNull(blogPosts.slugFr), eq(blogPosts.slugFr, ""))
        )
      );

    for (const p of emptyFrPosts) {
      if (!p.titleFr) continue;
      const newSlugFr = generateSlug(p.titleFr);
      if (!newSlugFr) continue;

      try {
        await db.update(blogPosts).set({ slugFr: newSlugFr }).where(eq(blogPosts.id, p.id));
        results.blogPosts++;
      } catch (err) {
        try {
          const uniqueSlug = `${newSlugFr}-${p.id.slice(0, 6)}`;
          await db.update(blogPosts).set({ slugFr: uniqueSlug }).where(eq(blogPosts.id, p.id));
          results.blogPosts++;
        } catch (err2) {
          results.errors.push(`Blog post ${p.title}: ${String(err2)}`);
        }
      }
    }
  } catch (err) {
    results.errors.push(`Blog query: ${String(err)}`);
  }

  return NextResponse.json({
    ok: true,
    message: `Backfilled ${results.products} products and ${results.blogPosts} blog posts`,
    ...results,
  });
}
