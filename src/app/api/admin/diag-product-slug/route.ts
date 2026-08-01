import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select({
      id: products.id,
      name: products.name,
      nameFr: products.nameFr,
      slug: products.slug,
      slugFr: products.slugFr,
    }).from(products).limit(10);
    return NextResponse.json({ count: all.length, products: all });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
