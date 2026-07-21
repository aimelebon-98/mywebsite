import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews, settings } from "@/db/schema";
import { eq, inArray, asc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Require admin password via header for security
    const providedPassword = request.headers.get("x-admin-password");
    if (!providedPassword) {
      return NextResponse.json({ error: "Missing admin password" }, { status: 401 });
    }

    // Verify password against settings
    const settingsRows = await db.select().from(settings).where(eq(settings.id, 1));
    if (settingsRows.length === 0) {
      return NextResponse.json({ error: "Settings not found" }, { status: 500 });
    }
    const storedPassword = settingsRows[0].adminPassword;
    if (providedPassword !== storedPassword) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // Get all products ordered by createdAt (oldest first)
    const allProducts = await db.select().from(products).orderBy(asc(products.createdAt));

    // Group by name - keep the OLDEST of each group, mark rest as duplicates
    const seenNames = new Set<string>();
    const keepIds: string[] = [];
    const deleteIds: string[] = [];

    for (const product of allProducts) {
      if (seenNames.has(product.name)) {
        deleteIds.push(product.id);
      } else {
        seenNames.add(product.name);
        keepIds.push(product.id);
      }
    }

    if (deleteIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No duplicates found",
        totalBefore: allProducts.length,
        totalAfter: allProducts.length,
        deleted: 0,
        kept: allProducts.length,
      });
    }

    // Delete reviews associated with duplicate products first (to avoid orphans)
    let deletedReviewsCount = 0;
    if (deleteIds.length > 0) {
      const deletedReviews = await db.delete(reviews)
        .where(inArray(reviews.productId, deleteIds))
        .returning();
      deletedReviewsCount = deletedReviews.length;
    }

    // Delete the duplicate products
    const deletedProducts = await db.delete(products)
      .where(inArray(products.id, deleteIds))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Removed ${deletedProducts.length} duplicate products`,
      totalBefore: allProducts.length,
      totalAfter: keepIds.length,
      deleted: deletedProducts.length,
      kept: keepIds.length,
      orphanReviewsDeleted: deletedReviewsCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({
      error: "Cleanup failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
