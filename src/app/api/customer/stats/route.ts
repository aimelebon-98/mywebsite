import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, wishlist } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  let orderCount = 0;
  let totalSpent = 0;
  let wishlistCount = 0;
  const ticketCount = 0;

  try {
    const [row] = await db.select({
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(total), 0)`,
    }).from(orders).where(eq(orders.customerId, customer.id));
    orderCount = Number(row?.count || 0);
    totalSpent = Number(row?.total || 0);
  } catch { /* ignore */ }

  try {
    const [row] = await db.select({ count: sql<number>`count(*)` })
      .from(wishlist).where(eq(wishlist.customerId, customer.id));
    wishlistCount = Number(row?.count || 0);
  } catch { /* customer_id column may not exist yet */ }

  return NextResponse.json({ orderCount, totalSpent, wishlistCount, ticketCount });
}