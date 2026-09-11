import { db } from "@/db";
import { sql } from "drizzle-orm";

let tablesEnsured = false;

export async function ensureBrokerClaimTablesExist() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "broker_claims" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "customer_name" varchar(255) NOT NULL,
        "customer_email" varchar(255) NOT NULL,
        "customer_phone" varchar(50),
        "broker_name" varchar(100) NOT NULL DEFAULT 'Exness',
        "broker_account_id" varchar(100) NOT NULL,
        "deposit_amount" varchar(50) DEFAULT '20.00',
        "proof_image" text,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "admin_note" text,
        "created_at" timestamp DEFAULT now(),
        "approved_at" timestamp
      );
    `);
    tablesEnsured = true;
  } catch (e) {
    console.error("ensureBrokerClaimTablesExist error:", e);
  }
}