import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE "vendors"
      ADD COLUMN IF NOT EXISTS "must_change_password" boolean NOT NULL DEFAULT true;
    `);
    return NextResponse.json({ success: true, message: "Added must_change_password column" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}