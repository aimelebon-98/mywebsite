import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogCategories } from "@/db/schema";
import { sql } from "drizzle-orm";

const SEEDS = [
  { slug: "style-tips",      name: "Style Tips",       nameFr: "Conseils de style",      color: "bg-purple-100 text-purple-700",  sortOrder: 1 },
  { slug: "product-reviews", name: "Product Reviews",  nameFr: "Tests produits",         color: "bg-blue-100 text-blue-700",      sortOrder: 2 },
  { slug: "sneaker-news",    name: "Sneaker News",     nameFr: "Actualites sneaker",     color: "bg-red-100 text-red-700",        sortOrder: 3 },
  { slug: "care-guides",     name: "Care Guides",      nameFr: "Guides d'entretien",     color: "bg-emerald-100 text-emerald-700",sortOrder: 4 },
  { slug: "buying-guides",   name: "Buying Guides",    nameFr: "Guides d'achat",         color: "bg-amber-100 text-amber-700",    sortOrder: 5 },
  { slug: "brand-stories",   name: "Brand Stories",    nameFr: "Histoires de marques",   color: "bg-pink-100 text-pink-700",      sortOrder: 6 },
  { slug: "business",        name: "Business",         nameFr: "Business",               color: "bg-indigo-100 text-indigo-700",  sortOrder: 7 },
];

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        name_fr TEXT,
        color TEXT NOT NULL DEFAULT 'bg-gray-100 text-gray-700',
        sort_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    let inserted = 0;
    for (const s of SEEDS) {
      const result = await db.execute(sql`
        INSERT INTO blog_categories (slug, name, name_fr, color, sort_order, active)
        VALUES (${s.slug}, ${s.name}, ${s.nameFr}, ${s.color}, ${s.sortOrder}, true)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id;
      `);
      const rows = (result as unknown as { rows?: unknown[] }).rows;
      if (rows && rows.length > 0) inserted++;
    }

    const all = await db.select().from(blogCategories);
    return NextResponse.json({ ok: true, message: `Table ready. Seeded ${inserted} new (${all.length} total)`, categories: all });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
