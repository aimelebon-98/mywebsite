import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { eq, ilike, or, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    try {
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS customer_id uuid`);
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`);
    } catch { /* ignore */ }

    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cId = customer.id;
    const cName = customer.name?.trim() || "";

    const conditions = [];
    if (cId) conditions.push(eq(reviews.customerId, cId));
    if (cName) conditions.push(ilike(reviews.customerName, cName));

    if (conditions.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        customerName: reviews.customerName,
        rating: reviews.rating,
        comment: reviews.comment,
        commentFr: reviews.commentFr,
        verified: reviews.verified,
        approved: reviews.approved,
        createdAt: reviews.createdAt,
        productName: products.name,
        productImage: products.imageUrl,
        productSlug: products.slug,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(or(...conditions))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json({ reviews: rows });
  } catch (error) {
    console.error("[Customer Reviews GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}