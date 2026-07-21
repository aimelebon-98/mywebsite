import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist, products } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ products: [] });
  try {
    const rows = await db.select({ productId: wishlist.productId })
      .from(wishlist)
      .where(eq(wishlist.visitorId, visitorId));
    const ids = rows.map(r => r.productId);
    if (ids.length === 0) return NextResponse.json({ products: [] });
    const items = await db.select().from(products).where(inArray(products.id, ids));
    return NextResponse.json({ products: items });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
