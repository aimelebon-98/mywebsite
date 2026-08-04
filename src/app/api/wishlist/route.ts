import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { customerSessions } from "@/db/schema";

// Get logged-in customer id from session cookie (returns null if not logged in)
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

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS wishlist (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      visitor_id text,
      customer_id uuid,
      product_id uuid NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `);
  // Add customer_id column if it doesn't exist (for older tables)
  await db.execute(sql`ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS customer_id uuid`);
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const customerId = await getCustomerId();
    const visitorId = req.nextUrl.searchParams.get("visitorId");

    // If logged in: return items linked to customer
    if (customerId) {
      const rows = await db.select({ productId: wishlist.productId })
        .from(wishlist)
        .where(eq(wishlist.customerId, customerId));
      return NextResponse.json({ ids: rows.map(r => r.productId) });
    }

    // Otherwise: return items linked to visitor
    if (!visitorId) return NextResponse.json({ ids: [] });
    const rows = await db.select({ productId: wishlist.productId })
      .from(wishlist)
      .where(eq(wishlist.visitorId, visitorId));
    return NextResponse.json({ ids: rows.map(r => r.productId) });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const { visitorId, productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const customerId = await getCustomerId();

    // Logged in: save under customer
    if (customerId) {
      const existing = await db.select().from(wishlist)
        .where(and(eq(wishlist.customerId, customerId), eq(wishlist.productId, productId)));
      if (existing.length === 0) {
        await db.insert(wishlist).values({ customerId, productId });
      }
      return NextResponse.json({ ok: true, scope: "customer" });
    }

    // Guest: save under visitor
    if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
    const existing = await db.select().from(wishlist)
      .where(and(eq(wishlist.visitorId, visitorId), eq(wishlist.productId, productId)));
    if (existing.length === 0) {
      await db.insert(wishlist).values({ visitorId, productId });
    }
    return NextResponse.json({ ok: true, scope: "visitor" });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureTable();
    const { visitorId, productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const customerId = await getCustomerId();

    if (customerId) {
      await db.delete(wishlist)
        .where(and(eq(wishlist.customerId, customerId), eq(wishlist.productId, productId)));
      return NextResponse.json({ ok: true });
    }

    if (!visitorId) return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
    await db.delete(wishlist)
      .where(and(eq(wishlist.visitorId, visitorId), eq(wishlist.productId, productId)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}