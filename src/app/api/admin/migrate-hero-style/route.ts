import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE settings 
      ADD COLUMN IF NOT EXISTS hero_style text NOT NULL DEFAULT 'classic';
    `);

    return NextResponse.json({
      success: true,
      message: "Database schema updated successfully! Column hero_style added to settings table."
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}