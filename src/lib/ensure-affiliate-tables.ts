import { db } from "@/db";
import { sql } from "drizzle-orm";

let tablesEnsured = false;

export async function ensureAffiliateTablesExist() {
  if (tablesEnsured) return;

  try {
    // 1. Ensure affiliates table has manual_override_activated_at column
    await db.execute(sql`
      ALTER TABLE affiliates
      ADD COLUMN IF NOT EXISTS manual_override_activated_at TIMESTAMP;
    `);

    // 2. Ensure manual_override_active column exists
    await db.execute(sql`
      ALTER TABLE affiliates
      ADD COLUMN IF NOT EXISTS manual_override_active BOOLEAN DEFAULT false;
    `);

    // 3. Ensure parent_affiliate_id column exists
    await db.execute(sql`
      ALTER TABLE affiliates
      ADD COLUMN IF NOT EXISTS parent_affiliate_id UUID;
    `);

    tablesEnsured = true;
    console.log("Affiliate table columns verified successfully.");
  } catch (e) {
    console.error("Failed to ensure affiliate table columns:", e);
  }
}