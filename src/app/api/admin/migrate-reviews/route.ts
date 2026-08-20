import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true`);
    return NextResponse.json({ ok: true, message: "reviews table approved column added or confirmed" });
  } catch (error) {
    console.error("[Migrate Reviews Error]", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}