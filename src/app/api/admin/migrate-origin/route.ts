import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// One-time migration: add origin_country + origin_city to products table.
// Idempotent - safe to run multiple times.
export async function GET() {
  try {
    // Add columns if not exist
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS origin_country TEXT NOT NULL DEFAULT 'NG'
    `);
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS origin_city TEXT NOT NULL DEFAULT 'Abuja'
    `);

    // Backfill any NULL rows (defensive)
    const updated = await db.execute(sql`
      UPDATE products
      SET origin_country = 'NG', origin_city = 'Abuja'
      WHERE origin_country IS NULL OR origin_country = ''
    `);

    return NextResponse.json({
      success: true,
      message: "origin_country and origin_city columns added. Existing products default to NG/Abuja.",
      rowsBackfilled: updated.rowCount ?? 0,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}