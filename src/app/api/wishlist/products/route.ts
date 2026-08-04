import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist, products, customerSessions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";

async function getCustomerId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_session")?.value;
    if (!token) return null;
    const sessions = await db.select().from(customerSessions).where(eq(customerSessions.token, token));
    if (sessions.length === 0) return null;
    const session = sessions[0];
    if (session.expiresAt < new Date()) return null;
    return session.customerId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerId();
    const visitorId = req.nextUrl.searchParams.get("visitorId");

    let productIds: string[] = [];

    if (customerId) {
      // Logged in: use customer wishlist
      const rows = await db.select({ productId: wishlist.productId })
        .from(wishlist)
        .where(eq(wishlist.customerId, customerId));
      productIds = rows.map(r => r.productId);
    } else if (visitorId) {
      // Guest: use visitor wishlist
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