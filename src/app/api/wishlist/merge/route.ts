import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist, customerSessions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

// Merge visitor wishlist into logged-in customer wishlist
// Called after login/register to preserve guest wishlist items
export async function POST(req: NextRequest) {
  try {
    const { visitorId } = await req.json();
    if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get("customer_session")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const sessions = await db.select().from(customerSessions).where(eq(customerSessions.token, token));
    if (sessions.length === 0 || sessions[0].expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const customerId = sessions[0].customerId;

    // Get all guest wishlist items
    const guestItems = await db.select().from(wishlist).where(eq(wishlist.visitorId, visitorId));

    let mergedCount = 0;
    for (const item of guestItems) {
      // Check if already in customer wishlist
      const existing = await db.select().from(wishlist)
        .where(and(eq(wishlist.customerId, customerId), eq(wishlist.productId, item.productId)));
      if (existing.length === 0) {
        // Add to customer wishlist
        await db.insert(wishlist).values({ customerId, productId: item.productId });
        mergedCount++;
      }
    }

    // Delete guest items after merging
    await db.delete(wishlist).where(eq(wishlist.visitorId, visitorId));

    return NextResponse.json({ ok: true, merged: mergedCount, total: guestItems.length });
  } catch (err) {
    return NextResponse.json({ error: "Merge failed", detail: String(err) }, { status: 500 });
  }
}