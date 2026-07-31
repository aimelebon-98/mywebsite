import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS cover_image_alt TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS cover_image_alt_fr TEXT DEFAULT ''
    `);
    return NextResponse.json({ ok: true, message: "Cover image alt columns added" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
