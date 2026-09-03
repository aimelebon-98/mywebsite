import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId parameter is required" }, { status: 400 });
    }

    // Ensure approved column exists in DB if added recently
    try {
      await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved boolean DEFAULT true`);
    } catch { /* ignore */ }

    // Public storefront ONLY sees approved reviews (approved = true or approved IS NOT FALSE)
    const list = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.productId, productId),
          sql`(${reviews.approved} IS TRUE OR ${reviews.approved} IS NULL)`
        )
      )
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json({ success: true, reviews: list });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many reviews submitted. Please wait a minute." }, { status: 429 });
    }

    if (!await verifyRequestOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const customerName = typeof body.customerName === "string" ? stripHtml(body.customerName).trim().slice(0, 100) : "Anonymous";
    const comment = typeof body.comment === "string" ? stripHtml(body.comment).trim().slice(0, 1000) : "";
    const rating = Math.min(5, Math.max(1, parseInt(body.rating) || 5));

    if (!productId || !comment) {
      return NextResponse.json({ error: "Product ID and review comment are required" }, { status: 400 });
    }

    // Get 2-letter initials ONLY for avatar rule
    const parts = customerName.split(" ").filter(Boolean);
    const avatar = parts.map(p => p[0]?.toUpperCase() || "").slice(0, 2).join("") || "ND";

    // New customer reviews are explicitly pending approval (approved = false)
    const [inserted] = await db
      .insert(reviews)
      .values({
        productId,
        customerName,
        rating,
        comment,
        avatar,
        verified: false,
        approved: false,
        createdAt: new Date(),
      } as typeof reviews.$inferInsert)
      .returning();

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully and is pending approval.",
      review: inserted,
    });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}