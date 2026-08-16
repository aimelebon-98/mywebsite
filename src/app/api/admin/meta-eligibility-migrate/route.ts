import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { shouldExcludeFromMeta } from "@/lib/meta-brand-blocklist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Runs schema migration + backfills existing products
export async function GET() {
  try {
    // Step 1: Add columns if they don't exist (safe idempotent SQL)
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS meta_eligible BOOLEAN NOT NULL DEFAULT true
    `);
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS meta_exclusion_reason TEXT DEFAULT ''
    `);

    // Step 2: Backfill - scan all products, auto-mark branded ones
    const allProducts = await db.select().from(products);
    let excluded = 0;
    let kept = 0;
    const excludedItems: Array<{ name: string; brand: string; reason: string }> = [];

    for (const p of allProducts) {
      const check = shouldExcludeFromMeta(p.brand, p.name);
      if (check.excluded) {
        await db.execute(sql`
          UPDATE products
          SET meta_eligible = false, meta_exclusion_reason = ${check.reason}
          WHERE id = ${p.id}
        `);
        excluded++;
        excludedItems.push({
          name: p.name || "",
          brand: p.brand || "",
          reason: check.reason,
        });
      } else {
        await db.execute(sql`
          UPDATE products
          SET meta_eligible = true, meta_exclusion_reason = ''
          WHERE id = ${p.id}
        `);
        kept++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration + backfill complete",
      total: allProducts.length,
      excluded_from_meta: excluded,
      kept_in_meta: kept,
      excluded_items: excludedItems,
    });
  } catch (err) {
    console.error("Meta migration error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}