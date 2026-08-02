import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID`);
    await db.execute(sql`ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS customer_id UUID`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist(customer_id)`);
    return NextResponse.json({ ok: true, message: "customer_id columns + indexes added to orders + wishlist" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
