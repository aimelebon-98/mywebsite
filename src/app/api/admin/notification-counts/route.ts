import { requireAdmin } from "@/lib/admin-auth";
// v5 - includes vendor products + payouts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, blogComments, reviews, newsletter, vendorApplications, conciergeRequests, vendorProducts, vendorPayouts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  let orderCount = 0, commentCount = 0, reviewCount = 0, newsletterCount = 0;
  let vendorAppsCount = 0, conciergeCount = 0, vendorProdsCount = 0, vendorPayoutsCount = 0;

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
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(vendorProducts).where(eq(vendorProducts.status, "pending"));
    vendorProdsCount = Number(r?.count || 0);
  } catch {}
  try {
    const [r] = await db.select({ count: sql<number>`count(*)` }).from(vendorPayouts).where(eq(vendorPayouts.status, "pending"));
    vendorPayoutsCount = Number(r?.count || 0);
  } catch {}

  return NextResponse.json({
    orders: orderCount,
    comments: commentCount,
    reviews: reviewCount,
    newsletter: newsletterCount,
    vendorApplications: vendorAppsCount,
    conciergeRequests: conciergeCount,
    vendorProducts: vendorProdsCount,
    vendorPayouts: vendorPayoutsCount,
  });
}