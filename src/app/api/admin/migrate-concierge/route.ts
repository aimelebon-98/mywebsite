import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "concierge_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "vendor_id" uuid NOT NULL,
        "tier" text NOT NULL DEFAULT 'basic',
        "fee" numeric(10, 2) NOT NULL DEFAULT '0',
        "product_name" text NOT NULL,
        "product_brand" text NOT NULL DEFAULT '',
        "product_category" text NOT NULL DEFAULT 'sneakers',
        "product_price" numeric(10, 2) NOT NULL,
        "product_compare_price" numeric(10, 2),
        "product_material" text NOT NULL DEFAULT '',
        "product_sizes" text NOT NULL DEFAULT '[]',
        "product_colors" text NOT NULL DEFAULT '[]',
        "product_stock" integer NOT NULL DEFAULT 0,
        "source_images" text NOT NULL DEFAULT '[]',
        "notes" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "admin_note" text NOT NULL DEFAULT '',
        "vendor_response" text NOT NULL DEFAULT '',
        "created_product_id" uuid,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "completed_at" timestamp,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "concierge_debt" numeric(12, 2) NOT NULL DEFAULT '0';
    `);
    await db.execute(sql`
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "concierge_paid_total" numeric(12, 2) NOT NULL DEFAULT '0';
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_concierge_vendor" ON "concierge_requests" ("vendor_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_concierge_status" ON "concierge_requests" ("status");`);

    return NextResponse.json({ success: true, message: "Concierge tables ready" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}