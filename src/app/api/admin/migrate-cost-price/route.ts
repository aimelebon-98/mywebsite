import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0;
    `);
    return NextResponse.json({ success: true, message: "cost_price column added" });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}