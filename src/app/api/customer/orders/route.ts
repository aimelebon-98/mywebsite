import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, or, desc, sql } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

let orderColsChecked = false;
async function ensureOrderColumns() {
  if (orderColsChecked) return;
  try {
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id uuid`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS item_count integer NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) NOT NULL DEFAULT 0`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamp`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamp`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notes text NOT NULL DEFAULT ''`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en'`);
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address text NOT NULL DEFAULT ''`);
    orderColsChecked = true;
  } catch (e) {
    console.error("[Customer Orders] ensure columns failed:", e);
  }
}

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  try {
    await ensureOrderColumns();

    const conditions = [
      eq(orders.customerId, customer.id),
      eq(orders.customerEmail, customer.email),
    ];

    if (customer.phone && customer.phone.trim().length >= 5) {
      conditions.push(eq(orders.customerPhone, customer.phone.trim()));
    }

    const customerOrders = await db.select().from(orders)
      .where(or(...conditions))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: customerOrders });
  } catch (error) {
    console.error("[Customer Orders GET]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}