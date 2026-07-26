import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, blogComments, reviews, newsletter } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  let orderCount = 0;
  let commentCount = 0;
  let reviewCount = 0;
  let newsletterCount = 0;

  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
    orderCount = Number(r?.count || 0);
  } catch { /* ignore */ }

  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(blogComments).where(eq(blogComments.approved, false));
    commentCount = Number(r?.count || 0);
  } catch { /* ignore */ }

  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
    reviewCount = Number(r?.count || 0);
  } catch { /* ignore */ }

  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(newsletter);
    newsletterCount = Number(r?.count || 0);
  } catch { /* ignore */ }

  return NextResponse.json({
    orders: orderCount,
    comments: commentCount,
    reviews: reviewCount,
    newsletter: newsletterCount,
  });
}
