import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// One-time migration: add supplier_price + supplier_currency to products.
// Backfill: existing products default to (supplier_price = cost_price, supplier_currency = "NGN")
// Except for Nike SB Dunk Black Pigeon which was seeded from Togo supplier at 9000 XOF.
// Idempotent - safe to run multiple times.
export async function GET() {
  try {
    // Add columns if not exist
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS supplier_price NUMERIC(12,2) NOT NULL DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS supplier_currency TEXT NOT NULL DEFAULT 'NGN'
    `);

    // Backfill all NGN suppliers: supplier_price = cost_price (they were all in NGN before)
    const ngnBackfill = await db.execute(sql`
      UPDATE products
      SET supplier_price = cost_price,
          supplier_currency = 'NGN'
      WHERE supplier_price = 0
        AND origin_country = 'NG'
    `);

    // Special case: Nike SB Dunk Black Pigeon - was seeded from Togo supplier at 9000 XOF
    const dunkBackfill = await db.execute(sql`
      UPDATE products
      SET supplier_price = 9000,
          supplier_currency = 'XOF'
      WHERE slug = 'nike-sb-dunk-low-black-pigeon'
    `);

    // Fallback: any other TG-origin product with no supplier_price set,
    // convert cost_price back to XOF using approximate rate (600 XOF/USD, 1364 NGN/USD)
    // supplier_xof = cost_ngn * (XOF/USD) / (NGN/USD) = cost_ngn * 600 / 1364
    const tgBackfill = await db.execute(sql`
      UPDATE products
      SET supplier_price = ROUND(cost_price::numeric * 600 / 1364, 0),
          supplier_currency = 'XOF'
      WHERE supplier_price = 0
        AND origin_country = 'TG'
        AND slug != 'nike-sb-dunk-low-black-pigeon'
    `);

    return NextResponse.json({
      success: true,
      message: "supplier_price + supplier_currency columns added and existing products backfilled",
      ngnRowsUpdated: ngnBackfill.rowCount ?? 0,
      dunkRowsUpdated: dunkBackfill.rowCount ?? 0,
      tgFallbackRowsUpdated: tgBackfill.rowCount ?? 0,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}