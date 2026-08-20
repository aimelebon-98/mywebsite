import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || "ND").toUpperCase();
}

function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customerName: z.string().trim().min(1, "Name required").max(100),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(""),
  commentFr: z.string().trim().max(2000).optional().default(""),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }
    // Only fetch APPROVED reviews for public product display
    const rows = await db.select().from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.approved, true)))
      .orderBy(desc(reviews.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("[Reviews GET]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const sanitizedName = cleanText(customerName);
    if (!sanitizedName) {
      return NextResponse.json({ error: "Please enter a valid name" }, { status: 400 });
    }

    const rawComment = (comment || "").trim();
    const rawCommentFr = (commentFr || "").trim();
    const sanitizedComment = cleanText(rawComment || rawCommentFr);
    const sanitizedCommentFr = cleanText(rawCommentFr || rawComment);
    const avatar = getInitials(customerName);

    // Requires admin approval before appearing publicly
    const [newReview] = await db.insert(reviews).values({
      productId,
      customerName: sanitizedName,
      rating,
      comment: sanitizedComment || "Verified Review",
      commentFr: sanitizedCommentFr || "Avis Vérifié",
      avatar,
      verified: false,
      approved: false,
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully! It will appear once approved by admin.",
      review: newReview,
    }, { status: 201 });
  } catch (error) {
    console.error("[Reviews POST]", error);
    const msg = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}