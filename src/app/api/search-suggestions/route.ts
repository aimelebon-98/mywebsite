import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        nameFr: products.nameFr,
        slug: products.slug,
        slugFr: products.slugFr,
        imageUrl: products.imageUrl,
        price: products.price,
        category: products.category,
      })
      .from(products)
      .where(
        and(
          eq(products.active, true),
          or(
            ilike(products.name, `%${query.trim()}%`),
            ilike(products.nameFr, `%${query.trim()}%`),
            ilike(products.brand, `%${query.trim()}%`),
            ilike(products.category, `%${query.trim()}%`)
          )
        )
      )
      .limit(6);

    return NextResponse.json({ suggestions: results });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
