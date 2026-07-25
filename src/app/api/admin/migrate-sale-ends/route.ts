import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMP;
    `);
    return NextResponse.json({ ok: true, message: "sale_ends_at column added to products" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
