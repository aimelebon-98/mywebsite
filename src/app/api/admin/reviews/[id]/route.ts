import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function recalcProductRating(productId: string) {
  try {
    const approvedReviews = await db.select({ rating: reviews.rating })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.approved, true)));

    if (approvedReviews.length > 0) {
      const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = (sum / approvedReviews.length).toFixed(1);
      await db.update(products).set({
        rating: avg,
        reviewCount: approvedReviews.length,
      }).where(eq(products.id, productId));
    } else {
      await db.update(products).set({
        rating: "0.0",
        reviewCount: 0,
      }).where(eq(products.id, productId));
    }
  } catch (err) {
    console.warn("[Admin Review] Recalc skipped:", err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    // Ensure Postgres column exists
    try {
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`);
    } catch { /* ignore */ }

    const { id } = await params;
    const body = await req.json();

    const [existing] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.approved === "boolean") updates.approved = body.approved;
    if (typeof body.verified === "boolean") updates.verified = body.verified;
    if (typeof body.comment === "string") updates.comment = body.comment;
    if (typeof body.commentFr === "string") updates.commentFr = body.commentFr;

    const [updated] = await db.update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();

    await recalcProductRating(existing.productId);

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("[Admin Review PUT]", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const [existing] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await db.delete(reviews).where(eq(reviews.id, id));
    await recalcProductRating(existing.productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Review DELETE]", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}