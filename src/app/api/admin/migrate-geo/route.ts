import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  const authErr = await requireAdmin(); if (authErr) return authErr;
  const results: string[] = [];
  try {
    await db.execute(sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country text DEFAULT ''`);
    results.push("country");
    await db.execute(sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS region text DEFAULT ''`);
    results.push("region");
    await db.execute(sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS city text DEFAULT ''`);
    results.push("city");
    await db.execute(sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS ip_hash text DEFAULT ''`);
    results.push("ip_hash");
    await db.execute(sql`ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false`);
    results.push("is_bot");
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics_events(country)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_is_bot ON analytics_events(is_bot)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC)`);
    results.push("indexes");
    return NextResponse.json({ ok: true, added: results });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error), partial: results }, { status: 500 });
  }
}
