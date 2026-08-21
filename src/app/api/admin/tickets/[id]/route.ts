import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages, customers } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let step = "INIT";
  try {
    step = "PARAMS";
    const resolvedParams = await params;
    const id = String(resolvedParams?.id || "").trim();

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Invalid or missing ticket ID" }, { status: 400 });
    }

    step = "FETCH_TICKET_DRIZZLE";
    let ticket: any = null;

    try {
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
          customerPhone: customers.phone,
        })
        .from(supportTickets)
        .leftJoin(customers, eq(supportTickets.customerId, customers.id))
        .where(eq(supportTickets.id, id))
        .limit(1);

      if (rows && rows.length > 0) {
        ticket = rows[0];
      }
    } catch (drizzleErr: any) {
      console.warn("[Admin Ticket GET Drizzle failed, falling back to SQL]", drizzleErr?.message);
    }

    step = "FETCH_TICKET_SQL_FALLBACK";
    if (!ticket) {
      try {
        const rawRes = await db.execute(sql`
          SELECT
            t.id::text as id,
            t.customer_id::text as "customerId",
            t.subject,
            t.category,
            t.status,
            COALESCE(t.priority, 'normal') as priority,
            COALESCE(t.last_message_at, t.created_at) as "lastMessageAt",
            COALESCE(t.unread_by_admin, false) as "unreadByAdmin",
            t.created_at as "createdAt",
            COALESCE(c.name, 'Customer') as "customerName",
            COALESCE(c.email, '') as "customerEmail",
            COALESCE(c.phone, '') as "customerPhone"
          FROM support_tickets t
          LEFT JOIN customers c ON t.customer_id = c.id
          WHERE t.id::text = ${id}
          LIMIT 1
        `);
        const rows = (rawRes as any).rows || (Array.isArray(rawRes) ? rawRes : []);
        if (rows && rows.length > 0) {
          ticket = rows[0];
        }
      } catch (sqlErr: any) {
        console.error("[Admin Ticket GET SQL fallback error]", sqlErr);
        return NextResponse.json(
          { error: `SQL Error at ${step}: ` + (sqlErr?.message || String(sqlErr)) },
          { status: 500 }
        );
      }
    }

    if (!ticket) {
      return NextResponse.json({ error: `Ticket not found for ID: ${id}` }, { status: 404 });
    }

    step = "MARK_READ";
    try {
      await db
        .update(supportTickets)
        .set({ unreadByAdmin: false })
        .where(eq(supportTickets.id, id));
    } catch {
      try {
        await db.execute(sql`UPDATE support_tickets SET unread_by_admin = false WHERE id::text = ${id}`);
      } catch { /* non-critical */ }
    }

    step = "FETCH_MESSAGES";
    let messages: any[] = [];
    try {
      messages = await db
        .select({
          id: supportMessages.id,
          senderType: supportMessages.senderType,
          senderName: supportMessages.senderName,
          message: supportMessages.message,
          createdAt: supportMessages.createdAt,
        })
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, id))
        .orderBy(asc(supportMessages.createdAt));
    } catch {
      try {
        const msgsRes = await db.execute(sql`
          SELECT
            id::text as id,
            sender_type as "senderType",
            sender_name as "senderName",
            message,
            created_at as "createdAt"
          FROM support_messages
          WHERE ticket_id::text = ${id}
          ORDER BY created_at ASC
        `);
        messages = (msgsRes as any).rows || (Array.isArray(msgsRes) ? msgsRes : []);
      } catch {
        messages = [];
      }
    }

    return NextResponse.json({
      ticket: { ...ticket, unreadByAdmin: false },
      messages,
    });
  } catch (error: any) {
    console.error(`[Admin Ticket GET error at step ${step}]`, error);
    return NextResponse.json(
      { error: `[Step: ${step}] ` + (error?.message || String(error) || "Failed to load ticket") },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();
    const message = stripHtml(String(body.message || "")).trim().slice(0, 5000);
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    await db.execute(sql`
      INSERT INTO support_messages (ticket_id, sender_type, sender_name, message)
      VALUES (${id}::uuid, 'admin', 'Support', ${message})
    `);

    await db.execute(sql`
      UPDATE support_tickets
      SET last_message_at = NOW(),
          unread_by_admin = false,
          unread_by_customer = true,
          status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
      WHERE id::text = ${id}
    `);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Ticket POST reply error]", error);
    return NextResponse.json({ error: error?.message || "Failed to send reply" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();

    if (typeof body.status === "string") {
      await db.execute(sql`UPDATE support_tickets SET status = ${body.status} WHERE id::text = ${id}`);
    }

    if (typeof body.priority === "string") {
      await db.execute(sql`UPDATE support_tickets SET priority = ${body.priority} WHERE id::text = ${id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Ticket PUT error]", error);
    return NextResponse.json({ error: error?.message || "Failed to update ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(req, { params });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    try {
      await db.execute(sql`DELETE FROM support_messages WHERE ticket_id::text = ${id}`);
    } catch { /* ignore */ }
    await db.execute(sql`DELETE FROM support_tickets WHERE id::text = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete ticket" }, { status: 500 });
  }
}