import { db } from "@/db";
import { sql } from "drizzle-orm";

let ensured = false;

export async function ensureSubscriptionTablesExist() {
  if (ensured) return;
  try {
    await db.execute(sql`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_type" text NOT NULL DEFAULT 'physical';
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subscription_config" text DEFAULT '';
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" uuid,
        "order_number" text NOT NULL DEFAULT '',
        "product_id" uuid NOT NULL,
        "product_name" text NOT NULL DEFAULT '',
        "customer_email" text NOT NULL,
        "customer_name" text NOT NULL DEFAULT '',
        "customer_phone" text NOT NULL DEFAULT '',
        "months" integer NOT NULL DEFAULT 1,
        "monthly_price" numeric(10,2) NOT NULL DEFAULT 19.99,
        "discount_percent" numeric(5,2) NOT NULL DEFAULT 0,
        "discount_flat" numeric(10,2) NOT NULL DEFAULT 0,
        "total_paid" numeric(10,2) NOT NULL,
        "currency" text NOT NULL DEFAULT 'USD',
        "crypto_currency" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "starts_at" timestamp,
        "expires_at" timestamp,
        "payment_id" text NOT NULL DEFAULT '',
        "payment_provider" text NOT NULL DEFAULT 'nowpayments',
        "metadata" text NOT NULL DEFAULT '{}',
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "crypto_payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "subscription_id" uuid,
        "order_number" text NOT NULL DEFAULT '',
        "provider" text NOT NULL DEFAULT 'nowpayments',
        "provider_payment_id" text NOT NULL DEFAULT '',
        "provider_invoice_id" text NOT NULL DEFAULT '',
        "pay_address" text NOT NULL DEFAULT '',
        "pay_currency" text NOT NULL DEFAULT '',
        "pay_amount" text NOT NULL DEFAULT '',
        "price_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "price_currency" text NOT NULL DEFAULT 'USD',
        "status" text NOT NULL DEFAULT 'waiting',
        "actually_paid" text NOT NULL DEFAULT '',
        "outcome_amount" text NOT NULL DEFAULT '',
        "raw_ipn" text NOT NULL DEFAULT '',
        "expires_at" timestamp,
        "confirmed_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    ensured = true;
  } catch (e) {
    console.error("ensureSubscriptionTablesExist error:", e);
  }
}