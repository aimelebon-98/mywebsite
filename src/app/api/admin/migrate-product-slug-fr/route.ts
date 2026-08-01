import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug_fr TEXT`);
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS products_slug_fr_idx ON products(slug_fr) WHERE slug_fr IS NOT NULL`);
    return NextResponse.json({ ok: true, message: "products.slug_fr column + unique index added" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
