import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId");
  if (!visitorId) return NextResponse.json({ ids: [] });
  try {
    const rows = await db.select({ productId: wishlist.productId })
      .from(wishlist)
      .where(eq(wishlist.visitorId, visitorId));
    return NextResponse.json({ ids: rows.map(r => r.productId) });
  } catch {
    // Table may not exist yet - return empty gracefully
    return NextResponse.json({ ids: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { visitorId, productId } = await req.json();
    if (!visitorId || !productId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Ensure table exists (auto-migrate for Neon)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        visitor_id text NOT NULL,
        product_id uuid NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
    // Check existing
    const existing = await db.select().from(wishlist)
      .where(and(eq(wishlist.visitorId, visitorId), eq(wishlist.productId, productId)));
    if (existing.length === 0) {
      await db.insert(wishlist).values({ visitorId, productId });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { visitorId, productId } = await req.json();
    if (!visitorId || !productId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await db.delete(wishlist)
      .where(and(eq(wishlist.visitorId, visitorId), eq(wishlist.productId, productId)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
