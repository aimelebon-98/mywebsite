import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, ilike } from "drizzle-orm";

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
        slug: products.slug,
      })
      .from(products)
      .where(
        and(
          eq(products.active, true),
          ilike(products.name, `%${query.trim()}%`)
        )
      )
      .limit(6);

    return NextResponse.json({ suggestions: results });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
