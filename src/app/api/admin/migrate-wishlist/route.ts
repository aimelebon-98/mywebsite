import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const MIGRATION_KEY = "run-wishlist-migration-2024";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== MIGRATION_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    await db.execute(sql`ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS customer_id uuid`);
    results.push("Added customer_id column");
  } catch (e) {
    results.push("customer_id error: " + String(e));
  }

  try {
    await db.execute(sql`ALTER TABLE wishlist ALTER COLUMN visitor_id DROP NOT NULL`);
    results.push("Made visitor_id nullable");
  } catch (e) {
    results.push("visitor_id error: " + String(e));
  }

  return NextResponse.json({ success: true, results });
}
