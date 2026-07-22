import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews, adminSessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
  } catch {
    return false;
  }
}

export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all products
    const allProducts = await db.select().from(products);

    let updated = 0;
    for (const product of allProducts) {
      // Count real reviews for this product
      const productReviews = await db.select().from(reviews).where(eq(reviews.productId, product.id));
      const count = productReviews.length;

      // Compute average rating (from real reviews only)
      let avgRating = "0";
      if (count > 0) {
        const sum = productReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        avgRating = (sum / count).toFixed(1);
      }

      // Only update if values differ (avoids needless writes)
      if (product.reviewCount !== count || product.rating !== avgRating) {
        await db.update(products)
          .set({ reviewCount: count, rating: avgRating })
          .where(eq(products.id, product.id));
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${updated} products (out of ${allProducts.length}). Review counts and ratings now match actual reviews.`,
      totalProducts: allProducts.length,
      productsUpdated: updated,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST to this endpoint (as admin) to recalculate all product review counts and ratings from actual reviews table.",
  });
}
