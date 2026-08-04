import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

// Merge guest visitor wishlist into logged-in customer wishlist
export async function POST(req: NextRequest) {
  try {
    const { visitorId } = await req.json();
    if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });

    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const guestItems = await db.select().from(wishlist).where(eq(wishlist.visitorId, visitorId));

    let mergedCount = 0;
    for (const item of guestItems) {
      const existing = await db.select().from(wishlist)
        .where(and(eq(wishlist.customerId, customer.id), eq(wishlist.productId, item.productId)));
      if (existing.length === 0) {
        await db.insert(wishlist).values({ customerId: customer.id, productId: item.productId });
        mergedCount++;
      }
    }

    await db.delete(wishlist).where(eq(wishlist.visitorId, visitorId));

    return NextResponse.json({ ok: true, merged: mergedCount, total: guestItems.length });
  } catch (err) {
    return NextResponse.json({ error: "Merge failed", detail: String(err) }, { status: 500 });
  }
}