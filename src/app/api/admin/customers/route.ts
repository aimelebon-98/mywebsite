import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orders, customerAddresses } from "@/db/schema";
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

    const withDetails = await Promise.all(all.map(async (c) => {
      try {
        const [orderRow] = await db.select({
          count: sql<number>`count(*)`,
          total: sql<number>`coalesce(sum(cast(total as numeric)), 0)`,
          lastOrder: sql<string>`max(created_at)`,
        }).from(orders).where(eq(orders.customerId, c.id));

        const [addrRow] = await db.select({
          count: sql<number>`count(*)`,
        }).from(customerAddresses).where(eq(customerAddresses.customerId, c.id));

        return {
          ...c,
          orderCount: Number(orderRow?.count || 0),
          totalSpent: Number(orderRow?.total || 0),
          lastOrderAt: orderRow?.lastOrder || null,
          addressCount: Number(addrRow?.count || 0),
        };
      } catch {
        return { ...c, orderCount: 0, totalSpent: 0, lastOrderAt: null, addressCount: 0 };
      }
    }));

    return NextResponse.json({ customers: withDetails });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}