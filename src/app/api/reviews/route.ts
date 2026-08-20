import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize";
import { z } from "zod";

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("") || "ND";
}

const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  customerName: z.string().trim().min(2, "Name required").max(100),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
  comment: z.string().trim().max(1000).optional().default(""),
  commentFr: z.string().trim().max(1000).optional().default(""),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const rows = await db.select().from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[Reviews GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ||
               req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") || "";

    if (isRateLimited(ip, 3, 60000)) {
      return NextResponse.json({ error: "Too many submissions. Please wait 1 minute." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { productId, customerName, rating, comment, commentFr } = parsed.data;

    const sanitizedName = sanitizeHtml(customerName);
    const sanitizedComment = comment ? sanitizeHtml(comment) : "";
    const sanitizedCommentFr = commentFr ? sanitizeHtml(commentFr) : "";
    const avatar = getInitials(sanitizedName);

    const [newReview] = await db.insert(reviews).values({
      productId,
      customerName: sanitizedName,
      rating,
      comment: sanitizedComment,
      commentFr: sanitizedCommentFr,
      avatar,
      verified: false,
    }).returning();

    // Recalculate product rating asynchronously
    try {
      const allProductReviews = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.productId, productId));
      if (allProductReviews.length > 0) {
        const sum = allProductReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / allProductReviews.length).toFixed(1);
        await db.update(products).set({
          rating: avg,
          reviewCount: allProductReviews.length,
        }).where(eq(products.id, productId));
      }
    } catch (calcErr) {
      console.warn("[Reviews] Rating re-calc skipped:", calcErr);
    }

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("[Reviews POST] Error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}