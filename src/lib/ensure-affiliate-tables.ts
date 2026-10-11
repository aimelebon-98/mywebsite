import { db } from "@/db";
import { sql } from "drizzle-orm";

let tablesEnsured = false;

export async function ensureAffiliateTablesExist() {
  if (tablesEnsured) return;

  try {
    // 1. Ensure affiliates table columns
    await db.execute(sql`
      ALTER TABLE affiliates
      ADD COLUMN IF NOT EXISTS manual_override_activated_at TIMESTAMP;
    `);

    await db.execute(sql`
      ALTER TABLE affiliates
      ADD COLUMN IF NOT EXISTS manual_override_active BOOLEAN DEFAULT false;
    `);

    await db.execute(sql`
      ALTER TABLE affiliates
      ADD COLUMN IF NOT EXISTS parent_affiliate_id UUID;
    `);

    // 2. Ensure affiliate_payouts table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS affiliate_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
        amount VARCHAR(20) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        method VARCHAR(50) DEFAULT 'bank_transfer',
        reference VARCHAR(255),
        note TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        manual_override_active BOOLEAN DEFAULT false,
        requested_at TIMESTAMP DEFAULT NOW(),
        paid_at TIMESTAMP,
        processed_by VARCHAR(255)
      );
    `);

    tablesEnsured = true;
    console.log("Affiliate tables and columns verified successfully.");
  } catch (e) {
    console.error("Failed to ensure affiliate table columns:", e);
  }
}