import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products, adminSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
  } catch {
    return false;
  }
}

async function recalculateProductStats(productId: string) {
  const productReviews = await db.select().from(reviews).where(eq(reviews.productId, productId));
  const count = productReviews.length;
  let avgRating = "0";
  if (count > 0) {
    const sum = productReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    avgRating = (sum / count).toFixed(1);
  }
  await db.update(products)
    .set({ reviewCount: count, rating: avgRating })
    .where(eq(products.id, productId));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const admin = searchParams.get("admin") === "true";

    if (admin) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const all = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
      return NextResponse.json(all);
    }

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const result = await db.select().from(reviews)
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
    const { productId, customerName, rating, comment, commentFr } = body;

    if (!productId || !customerName || !rating) {
      return NextResponse.json({ error: "productId, customerName, and rating are required" }, { status: 400 });
    }

    const avatar = String(customerName)
      .split(" ")
      .map(w => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");

    const result = await db.insert(reviews).values({
      productId: String(productId),
      customerName: String(customerName),
      rating: parseInt(String(rating)),
      comment: comment ? String(comment) : "",
      commentFr: commentFr ? String(commentFr) : null,
      avatar,
      verified: false,
    }).returning();

    await recalculateProductStats(String(productId));

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// PUT - admin only: update a review (typically for commentFr translations)
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.customerName !== undefined) updates.customerName = String(body.customerName);
    if (body.comment !== undefined) updates.comment = String(body.comment);
    if (body.commentFr !== undefined) updates.commentFr = body.commentFr ? String(body.commentFr) : null;
    if (body.rating !== undefined) updates.rating = parseInt(String(body.rating));
    if (body.verified !== undefined) updates.verified = Boolean(body.verified);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const result = await db.update(reviews).set(updates).where(eq(reviews.id, id)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // If rating changed, recalculate product stats
    if (body.rating !== undefined) {
      await recalculateProductStats(result[0].productId);
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const existing = await db.select().from(reviews).where(eq(reviews.id, id));
    if (existing.length === 0) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    const productId = existing[0].productId;

    await db.delete(reviews).where(eq(reviews.id, id));
    await recalculateProductStats(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
