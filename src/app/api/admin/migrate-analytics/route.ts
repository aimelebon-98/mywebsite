import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type TEXT NOT NULL,
        path TEXT NOT NULL DEFAULT '',
        product_id UUID,
        product_name TEXT,
        post_id UUID,
        search_query TEXT,
        referrer TEXT DEFAULT '',
        visitor_id TEXT NOT NULL DEFAULT '',
        user_agent TEXT DEFAULT '',
        metadata TEXT DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events(visitor_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_product ON analytics_events(product_id);`);

    return NextResponse.json({ ok: true, message: "Analytics table + indexes created" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
