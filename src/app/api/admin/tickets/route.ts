import { requireAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, customers } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    try {
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_admin boolean NOT NULL DEFAULT true`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS last_message_at timestamp DEFAULT now()`);
    } catch { /* ignore */ }

    const rows = await db
      .select({
        id: supportTickets.id,
        customerId: supportTickets.customerId,
        subject: supportTickets.subject,
        category: supportTickets.category,
        status: supportTickets.status,
        priority: supportTickets.priority,
        lastMessageAt: supportTickets.lastMessageAt,
        unreadByAdmin: supportTickets.unreadByAdmin,
        createdAt: supportTickets.createdAt,
        customerName: customers.name,
        customerEmail: customers.email,
      })
      .from(supportTickets)
      .leftJoin(customers, eq(supportTickets.customerId, customers.id))
      .orderBy(desc(supportTickets.createdAt));

    return NextResponse.json({ tickets: rows });
  } catch (e) {
    console.error("[Admin Tickets GET]", e);
    return NextResponse.json({ tickets: [], error: String(e) }, { status: 500 });
  }
}