import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS focus_keyphrase text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_url text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS no_index boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title_fr text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description_fr text`);
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS focus_keyphrase_fr text`);

    return NextResponse.json({
      success: true,
      message: "SEO columns added successfully. You can now delete this route.",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
