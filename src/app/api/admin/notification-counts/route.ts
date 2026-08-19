// v4 - includes concierge count
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, blogComments, reviews, newsletter, vendorApplications, conciergeRequests } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  let orderCount = 0, commentCount = 0, reviewCount = 0, newsletterCount = 0, vendorAppsCount = 0, conciergeCount = 0;

  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
    orderCount = Number(r?.count || 0);
  } catch {}
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(blogComments).where(eq(blogComments.approved, false));
    commentCount = Number(r?.count || 0);
  } catch {}
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
    reviewCount = Number(r?.count || 0);
  } catch {}
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(newsletter);
    newsletterCount = Number(r?.count || 0);
  } catch {}
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(vendorApplications).where(eq(vendorApplications.status, "pending"));
    vendorAppsCount = Number(r?.count || 0);
  } catch {}
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(conciergeRequests).where(eq(conciergeRequests.status, "pending"));
    conciergeCount = Number(r?.count || 0);
  } catch {}

  return NextResponse.json({
    orders: orderCount,
    comments: commentCount,
    reviews: reviewCount,
    newsletter: newsletterCount,
    vendorApplications: vendorAppsCount,
    conciergeRequests: conciergeCount,
  });
}