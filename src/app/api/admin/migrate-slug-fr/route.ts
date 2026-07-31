import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS slug_fr TEXT
    `);
    // Add unique index for FR slug (allows nulls)
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_fr_idx ON blog_posts(slug_fr) WHERE slug_fr IS NOT NULL
    `);
    return NextResponse.json({ ok: true, message: "slug_fr column + unique index added" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
