import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const [row] = await db.select({ c: sql<number>`count(*)` }).from(products);
    const sample = await db.select().from(products).limit(5);
    return NextResponse.json({
      totalProducts: Number(row?.c || 0),
      sample: sample.map(p => ({ id: p.id, name: p.name, slug: p.slug, active: p.active, slugFr: p.slugFr })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
