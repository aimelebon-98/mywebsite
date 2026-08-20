import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize";
import { z } from "zod";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || "ND").toUpperCase();
}

const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
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
    const rows = await db.select().from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("[Reviews GET]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ||
               req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") || "anonymous-client";

    if (isRateLimited(ip, "reviews", 10, 60000)) {
      return NextResponse.json({ error: "Too many submissions. Please wait 1 minute before trying again." }, { status: 429 });
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
    
    // Check product exists
    const [prod] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
    if (!prod) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const cleanName = (sanitizeHtml(customerName) || customerName).trim().slice(0, 100);
    const rawComment = (comment || "").trim();
    const rawCommentFr = (commentFr || "").trim();
    const cleanComment = rawComment ? (sanitizeHtml(rawComment) || rawComment).slice(0, 2000) : "";
    const cleanCommentFr = rawCommentFr ? (sanitizeHtml(rawCommentFr) || rawCommentFr).slice(0, 2000) : "";
    const avatar = getInitials(cleanName);

    const [newReview] = await db.insert(reviews).values({
      productId,
      customerName: cleanName,
      rating,
      comment: cleanComment || cleanCommentFr || "Verified Review",
      commentFr: cleanCommentFr || cleanComment || "Avis Vérifié",
      avatar,
      verified: false,
    }).returning();

    // Recalculate average rating & review count
    try {
      const all = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.productId, productId));
      if (all.length > 0) {
        const sum = all.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / all.length).toFixed(1);
        await db.update(products).set({
          rating: avg,
          reviewCount: all.length,
        }).where(eq(products.id, productId));
      }
    } catch (calcErr) {
      console.warn("[Reviews] rating recalc skipped:", calcErr);
    }

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("[Reviews POST]", error);
    const msg = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}