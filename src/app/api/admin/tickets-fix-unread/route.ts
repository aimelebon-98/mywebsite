import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_admin boolean NOT NULL DEFAULT true`);
    // Mark non-closed tickets that never got the flag as unread once
    await db.execute(sql`
      UPDATE support_tickets
      SET unread_by_admin = true
      WHERE status IN ('open', 'in_progress')
        AND (unread_by_admin IS NULL OR unread_by_admin = false)
        AND created_at > now() - interval '30 days'
    `);
    return NextResponse.json({ ok: true, message: "Recent active tickets marked unread if needed" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}