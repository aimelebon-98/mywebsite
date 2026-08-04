import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

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
  await db.execute(sql`ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS customer_id uuid`);
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const customer = await getCurrentCustomer();
    const visitorId = req.nextUrl.searchParams.get("visitorId");

    if (customer) {
      const rows = await db.select({ productId: wishlist.productId })
        .from(wishlist)
        .where(eq(wishlist.customerId, customer.id));
      return NextResponse.json({ ids: rows.map(r => r.productId) });
    }

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

    const customer = await getCurrentCustomer();

    if (customer) {
      const existing = await db.select().from(wishlist)
        .where(and(eq(wishlist.customerId, customer.id), eq(wishlist.productId, productId)));
      if (existing.length === 0) {
        await db.insert(wishlist).values({ customerId: customer.id, productId });
      }
      return NextResponse.json({ ok: true, scope: "customer" });
    }

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

    const customer = await getCurrentCustomer();

    if (customer) {
      await db.delete(wishlist)
        .where(and(eq(wishlist.customerId, customer.id), eq(wishlist.productId, productId)));
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