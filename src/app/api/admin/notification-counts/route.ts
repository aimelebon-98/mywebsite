import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, blogComments, reviews } from "@/db/schema";
import { eq, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    // Pending orders
    const pendingOrders = await db.select().from(orders).where(eq(orders.status, "pending"));

    // Pending comments (unapproved)
    const pendingComments = await db.select().from(blogComments).where(eq(blogComments.approved, false));

    // Reviews from last 7 days (treated as "new")
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReviews = await db.select().from(reviews).where(gte(reviews.createdAt, sevenDaysAgo));

    return NextResponse.json({
      orders: pendingOrders.length,
      comments: pendingComments.length,
      reviews: recentReviews.length,
    });
  } catch (error) {
    console.error("Error fetching notification counts:", error);
    return NextResponse.json({ orders: 0, comments: 0, reviews: 0 });
  }
}
