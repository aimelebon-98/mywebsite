import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { bundles } from "@/db/schema";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bundles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        name_fr TEXT,
        description TEXT DEFAULT '',
        description_fr TEXT,
        min_items INTEGER NOT NULL DEFAULT 2,
        discount_percent INTEGER NOT NULL DEFAULT 10,
        category TEXT DEFAULT '',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        priority INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const existing = await db.select().from(bundles);
    let seeded = 0;

    if (existing.length === 0) {
      const seeds = [
        {
          name: "Buy 2 Get 15% Off",
          nameFr: "Achetez 2 - 15% de reduction",
          description: "Add any 2 items to your cart and get 15% off automatically",
          descriptionFr: "Ajoutez 2 articles au panier et obtenez 15% de reduction automatiquement",
          minItems: 2,
          discountPercent: 15,
          category: "",
          priority: 1,
        },
        {
          name: "Buy 3 Get 25% Off",
          nameFr: "Achetez 3 - 25% de reduction",
          description: "Add any 3 items to your cart and get 25% off automatically",
          descriptionFr: "Ajoutez 3 articles au panier et obtenez 25% de reduction automatiquement",
          minItems: 3,
          discountPercent: 25,
          category: "",
          priority: 2,
        },
      ];

      for (const s of seeds) {
        await db.insert(bundles).values(s);
        seeded++;
      }
    }

    return NextResponse.json({ ok: true, seeded, existingCount: existing.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
