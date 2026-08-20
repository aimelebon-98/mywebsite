import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function recalcAffectedProducts(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  for (const pid of uniqueIds) {
    try {
      const approvedReviews = await db.select({ rating: reviews.rating })
        .from(reviews)
        .where(and(eq(reviews.productId, pid), eq(reviews.approved, true)));

      if (approvedReviews.length > 0) {
        const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / approvedReviews.length).toFixed(1);
        await db.update(products).set({
          rating: avg,
          reviewCount: approvedReviews.length,
        }).where(eq(products.id, pid));
      } else {
        await db.update(products).set({
          rating: "0.0",
          reviewCount: 0,
        }).where(eq(products.id, pid));
      }
    } catch (e) {
      console.warn("[Bulk Recalc Warning]", e);
    }
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const body = await req.json();
    const { ids, action } = body as { ids: string[]; action: "approve" | "unapprove" | "verify" | "unverify" | "delete" };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No review IDs provided" }, { status: 400 });
    }

    // Auto-ensure columns exist in Postgres
    try {
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS customer_id uuid`);
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`);
    } catch { /* ignore */ }

    // Fetch existing reviews to know affected product IDs
    const existing = await db.select({ id: reviews.id, productId: reviews.productId }).from(reviews).where(inArray(reviews.id, ids));
    const productIds = existing.map((r) => r.productId);

    if (action === "approve") {
      await db.update(reviews).set({ approved: true }).where(inArray(reviews.id, ids));
    } else if (action === "unapprove") {
      await db.update(reviews).set({ approved: false }).where(inArray(reviews.id, ids));
    } else if (action === "verify") {
      await db.update(reviews).set({ verified: true }).where(inArray(reviews.id, ids));
    } else if (action === "unverify") {
      await db.update(reviews).set({ verified: false }).where(inArray(reviews.id, ids));
    } else if (action === "delete") {
      await db.delete(reviews).where(inArray(reviews.id, ids));
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await recalcAffectedProducts(productIds);

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("[Admin Reviews Bulk Action Error]", error);
    return NextResponse.json({ error: "Bulk operation failed" }, { status: 500 });
  }
}