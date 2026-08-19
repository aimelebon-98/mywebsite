import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Create vendors table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" text NOT NULL UNIQUE,
        "password_hash" text NOT NULL,
        "store_name" text NOT NULL,
        "store_slug" text NOT NULL UNIQUE,
        "store_description" text NOT NULL DEFAULT '',
        "store_description_fr" text NOT NULL DEFAULT '',
        "logo" text NOT NULL DEFAULT '',
        "banner" text NOT NULL DEFAULT '',
        "trust_tagline" text NOT NULL DEFAULT '2+ years selling premium footwear',
        "trust_tagline_fr" text NOT NULL DEFAULT '2+ ans de vente de chaussures premium',
        "contact_name" text NOT NULL DEFAULT '',
        "phone" text NOT NULL DEFAULT '',
        "whatsapp" text NOT NULL DEFAULT '',
        "country" text NOT NULL DEFAULT 'NG',
        "city" text NOT NULL DEFAULT '',
        "bank_name" text NOT NULL DEFAULT '',
        "bank_account" text NOT NULL DEFAULT '',
        "bank_account_name" text NOT NULL DEFAULT '',
        "commission_rate" numeric(5, 2) NOT NULL DEFAULT '10.00',
        "status" text NOT NULL DEFAULT 'pending',
        "fulfillment_rate" numeric(5, 2) NOT NULL DEFAULT '100.00',
        "total_sales" integer NOT NULL DEFAULT 0,
        "total_earnings" numeric(12, 2) NOT NULL DEFAULT '0',
        "pending_payout" numeric(12, 2) NOT NULL DEFAULT '0',
        "total_paid_out" numeric(12, 2) NOT NULL DEFAULT '0',
        "admin_note" text NOT NULL DEFAULT '',
        "approved_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create vendor_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendor_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "token" text NOT NULL UNIQUE,
        "vendor_id" uuid NOT NULL,
        "ip_address" text NOT NULL DEFAULT '',
        "user_agent" text NOT NULL DEFAULT '',
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create vendor_applications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendor_applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "applicant_name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text NOT NULL DEFAULT '',
        "whatsapp" text NOT NULL DEFAULT '',
        "store_name" text NOT NULL,
        "store_description" text NOT NULL DEFAULT '',
        "product_categories" text NOT NULL DEFAULT '[]',
        "country" text NOT NULL DEFAULT 'NG',
        "city" text NOT NULL DEFAULT '',
        "instagram_url" text NOT NULL DEFAULT '',
        "website_url" text NOT NULL DEFAULT '',
        "additional_info" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "admin_note" text NOT NULL DEFAULT '',
        "reviewed_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create vendor_products table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendor_products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL UNIQUE,
        "vendor_id" uuid NOT NULL,
        "status" text NOT NULL DEFAULT 'pending',
        "admin_note" text NOT NULL DEFAULT '',
        "submitted_at" timestamp DEFAULT now() NOT NULL,
        "approved_at" timestamp
      );
    `);

    // Create vendor_orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendor_orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "vendor_id" uuid NOT NULL,
        "items" text NOT NULL DEFAULT '[]',
        "subtotal" numeric(12, 2) NOT NULL DEFAULT '0',
        "commission_rate" numeric(5, 2) NOT NULL DEFAULT '10.00',
        "commission_amount" numeric(12, 2) NOT NULL DEFAULT '0',
        "vendor_earning" numeric(12, 2) NOT NULL DEFAULT '0',
        "currency" text NOT NULL DEFAULT 'USD',
        "status" text NOT NULL DEFAULT 'pending',
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create vendor_payouts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vendor_payouts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "vendor_id" uuid NOT NULL,
        "amount" numeric(12, 2) NOT NULL,
        "currency" text NOT NULL DEFAULT 'USD',
        "method" text NOT NULL DEFAULT 'bank_transfer',
        "reference" text NOT NULL DEFAULT '',
        "note" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "requested_at" timestamp DEFAULT now() NOT NULL,
        "paid_at" timestamp,
        "processed_by" text NOT NULL DEFAULT ''
      );
    `);

    // Indexes for performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendor_sessions_token" ON "vendor_sessions" ("token");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendor_sessions_vendor" ON "vendor_sessions" ("vendor_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendor_products_vendor" ON "vendor_products" ("vendor_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendor_orders_vendor" ON "vendor_orders" ("vendor_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_vendor" ON "vendor_payouts" ("vendor_id");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendors_slug" ON "vendors" ("store_slug");`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_vendors_status" ON "vendors" ("status");`);

    return NextResponse.json({
      success: true,
      message: "Multi-vendor tables created successfully",
      tables: [
        "vendors",
        "vendor_sessions",
        "vendor_applications",
        "vendor_products",
        "vendor_orders",
        "vendor_payouts"
      ]
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}