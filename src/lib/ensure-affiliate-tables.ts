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
    `);

    // Add security, OTP & Google 2FA columns dynamically
    await db.execute(sql`
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "password_hash" varchar(255);
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "reset_token" varchar(255);
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "reset_token_expires_at" timestamp;
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "parent_affiliate_id" uuid;
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "totp_secret" varchar(255);
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "totp_enabled" boolean DEFAULT false;
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "login_otp_code" varchar(10);
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "login_otp_expires_at" timestamp;
      ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "trusted_devices" text;
    `);

    tablesEnsured = true;
  } catch (e) {
    console.error("ensureAffiliateTablesExist error:", e);
  }
}