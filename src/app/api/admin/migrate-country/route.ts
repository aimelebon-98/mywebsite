import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await db.execute(sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country text DEFAULT ''`);
    return NextResponse.json({ ok: true, message: "country column added (or already existed)" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}