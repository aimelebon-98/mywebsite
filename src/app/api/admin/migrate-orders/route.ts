import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        order_number text NOT NULL UNIQUE,
        customer_name text NOT NULL,
        customer_phone text NOT NULL,
        customer_email text NOT NULL DEFAULT '',
        customer_address text NOT NULL,
        items text NOT NULL DEFAULT '[]',
        item_count integer NOT NULL DEFAULT 0,
        subtotal numeric(10, 2) NOT NULL DEFAULT '0',
        discount_amount numeric(10, 2) NOT NULL DEFAULT '0',
        discount_code text NOT NULL DEFAULT '',
        shipping_cost numeric(10, 2) NOT NULL DEFAULT '0',
        total numeric(10, 2) NOT NULL,
        currency text NOT NULL DEFAULT '$',
        status text NOT NULL DEFAULT 'pending',
        tracking_number text NOT NULL DEFAULT '',
        tracking_carrier text NOT NULL DEFAULT '',
        shipped_at timestamp,
        delivered_at timestamp,
        admin_notes text NOT NULL DEFAULT '',
        customer_notes text NOT NULL DEFAULT '',
        locale text NOT NULL DEFAULT 'en',
        ip_address text NOT NULL DEFAULT '',
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC)`);

    return NextResponse.json({ success: true, message: "Orders table created" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
