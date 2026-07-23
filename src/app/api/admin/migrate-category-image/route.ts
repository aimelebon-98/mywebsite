import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Add column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS image_product_id uuid
    `);
    return NextResponse.json({ success: true, message: "Column image_product_id ensured" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
