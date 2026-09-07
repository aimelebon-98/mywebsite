import { db } from "@/db";
import { sql } from "drizzle-orm";

let tablesEnsured = false;

export async function ensureAffiliateTablesExist() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "affiliates" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password_hash" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "code" varchar(50) NOT NULL UNIQUE,
        "commission_rate" varchar(10) DEFAULT '5.00',
        "status" varchar(20) DEFAULT 'pending',
        "total_clicks" integer DEFAULT 0,
        "total_orders" integer DEFAULT 0,
        "total_earnings" varchar(20) DEFAULT '0.00',
        "pending_payout" varchar(20) DEFAULT '0.00',
        "total_paid_out" varchar(20) DEFAULT '0.00',
        "bank_name" varchar(255),
        "bank_account" varchar(100),
        "bank_account_name" varchar(255),
        "country" varchar(10),
        "city" varchar(100),
        "phone" varchar(50),
        "whatsapp" varchar(50),
        "preferred_currency" varchar(10) DEFAULT 'USD',
        "must_change_password" boolean DEFAULT true,
        "admin_note" text,
        "approved_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "affiliate_sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "token" varchar(255) NOT NULL UNIQUE,
        "affiliate_id" uuid NOT NULL REFERENCES "affiliates"("id") ON DELETE CASCADE,
        "ip_address" varchar(100),
        "user_agent" text,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "affiliate_applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "applicant_name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "phone" varchar(50),
        "whatsapp" varchar(50),
        "country" varchar(10),
        "city" varchar(100),
        "website_url" varchar(500),
        "social_media_url" varchar(500),
        "marketing_plan" text,
        "status" varchar(20) DEFAULT 'pending',
        "admin_note" text,
        "reviewed_at" timestamp,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "affiliate_orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" varchar(255) NOT NULL,
        "affiliate_id" uuid NOT NULL REFERENCES "affiliates"("id") ON DELETE CASCADE,
        "subtotal" varchar(20) NOT NULL,
        "commission_rate" varchar(10) NOT NULL,
        "commission_amount" varchar(20) NOT NULL,
        "currency" varchar(10) DEFAULT 'USD',
        "status" varchar(20) DEFAULT 'pending',
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "affiliate_payouts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "affiliate_id" uuid NOT NULL REFERENCES "affiliates"("id") ON DELETE CASCADE,
        "amount" varchar(20) NOT NULL,
        "currency" varchar(10) DEFAULT 'USD',
        "method" varchar(50) DEFAULT 'bank_transfer',
        "reference" varchar(255),
        "note" text,
        "status" varchar(20) DEFAULT 'pending',
        "requested_at" timestamp DEFAULT now(),
        "paid_at" timestamp,
        "processed_by" varchar(255)
      );

      CREATE TABLE IF NOT EXISTS "affiliate_clicks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "affiliate_id" uuid NOT NULL REFERENCES "affiliates"("id") ON DELETE CASCADE,
        "ip_address" varchar(100),
        "user_agent" text,
        "referer_url" text,
        "landing_url" text,
        "country" varchar(10),
        "created_at" timestamp DEFAULT now()
      );
    `);
    tablesEnsured = true;
  } catch (e) {
    console.error("ensureAffiliateTablesExist error:", e);
  }
}