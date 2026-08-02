import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function POST() {
  const results: string[] = [];
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL DEFAULT 'percent',
        value NUMERIC(10,2) NOT NULL DEFAULT 0,
        min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
        max_uses INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP,
        active BOOLEAN NOT NULL DEFAULT true,
        description TEXT NOT NULL DEFAULT '',
        description_fr TEXT,
        is_welcome BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    results.push("coupons table: OK");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        coupon_id UUID NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    results.push("customer_coupons table: OK");

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), results }, { status: 500 });
  }
}
