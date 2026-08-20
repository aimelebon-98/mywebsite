import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { eq, ilike, or, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cName = customer.name?.trim() || "";
    const cEmail = customer.email?.trim() || "";

    if (!cName && !cEmail) {
      return NextResponse.json({ reviews: [] });
    }

    // Join products table to get image, name, slug
    const conditions = [];
    if (cName) conditions.push(ilike(reviews.customerName, cName));

    const rows = await db
      .select({
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
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json({ reviews: rows });
  } catch (error) {
    console.error("[Customer Reviews GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}