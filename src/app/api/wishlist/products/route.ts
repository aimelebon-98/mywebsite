import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist, products } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    const visitorId = req.nextUrl.searchParams.get("visitorId");

    let productIds: string[] = [];

    if (customer) {
      const rows = await db.select({ productId: wishlist.productId })
        .from(wishlist)
        .where(eq(wishlist.customerId, customer.id));
      productIds = rows.map(r => r.productId);
    } else if (visitorId) {
      const rows = await db.select({ productId: wishlist.productId })
        .from(wishlist)
        .where(eq(wishlist.visitorId, visitorId));
      productIds = rows.map(r => r.productId);
    } else {
      return NextResponse.json({ products: [] });
    }

    if (productIds.length === 0) return NextResponse.json({ products: [] });

    const items = await db.select().from(products).where(inArray(products.id, productIds));
    return NextResponse.json({ products: items });
  } catch {
    return NextResponse.json({ products: [] });
  }
}