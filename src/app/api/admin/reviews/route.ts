import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    // Auto-approve existing historical reviews if they were created before moderation was enabled
    try {
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`);
    } catch { /* ignore */ }

    const rows = await db.select({
      id: reviews.id,
      productId: reviews.productId,
      productName: products.name,
      customerName: reviews.customerName,
      rating: reviews.rating,
      comment: reviews.comment,
      commentFr: reviews.commentFr,
      avatar: reviews.avatar,
      verified: reviews.verified,
      approved: reviews.approved,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt));

    let filtered = rows;
    if (filter === "pending") {
      filtered = rows.filter(r => !r.approved);
    } else if (filter === "approved") {
      filtered = rows.filter(r => r.approved);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("[Admin Reviews GET]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}