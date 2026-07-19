import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customerName, rating, comment } = body;

    if (!productId || !customerName || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create review
    const newReview = await db.insert(reviews).values({
      productId,
      customerName,
      rating: Math.min(5, Math.max(1, rating)),
      comment: comment || "",
      avatar: customerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      verified: false,
    }).returning();

    // Update product review count and rating
    const productReviews = await db.select().from(reviews).where(eq(reviews.productId, productId));
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    await db.update(products).set({
      reviewCount: productReviews.length,
      rating: avgRating.toFixed(1),
    }).where(eq(products.id, productId));

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
