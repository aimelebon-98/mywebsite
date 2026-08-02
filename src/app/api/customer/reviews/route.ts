import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Match reviews by customerName since reviews table has no customerId
    const rows = await db.select({
      id: reviews.id,
      productId: reviews.productId,
      customerName: reviews.customerName,
      rating: reviews.rating,
      comment: reviews.comment,
      commentFr: reviews.commentFr,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
      productName: products.name,
      productImage: products.imageUrl,
      productSlug: products.slug,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.customerName, customer.name))
    .orderBy(desc(reviews.createdAt));

    return NextResponse.json({ reviews: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Verify review belongs to this customer (by name)
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (review.customerName !== customer.name) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    // Recalculate product stats
    const remaining = await db.select().from(reviews).where(eq(reviews.productId, review.productId));
    const count = remaining.length;
    const avg = count > 0
      ? (remaining.reduce((s, r) => s + r.rating, 0) / count).toFixed(1)
      : "0";
    await db.update(products).set({ reviewCount: count, rating: avg }).where(eq(products.id, review.productId));

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
