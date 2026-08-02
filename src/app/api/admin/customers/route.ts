import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select({
      id: customers.id,
      email: customers.email,
      name: customers.name,
      phone: customers.phone,
      locale: customers.locale,
      verified: customers.verified,
      createdAt: customers.createdAt,
    }).from(customers).orderBy(desc(customers.createdAt));

    // Count orders per customer
    const withOrders = await Promise.all(all.map(async (c) => {
      try {
        const [row] = await db.select({ count: sql<number>`count(*)` }).from(orders)
          .where(eq(orders.customerId, c.id));
        return { ...c, orderCount: Number(row?.count || 0) };
      } catch {
        return { ...c, orderCount: 0 };
      }
    }));

    return NextResponse.json({ customers: withOrders });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
