import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages, customers } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

async function ensureTables() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id uuid NOT NULL,
        subject text NOT NULL,
        category text NOT NULL DEFAULT 'general',
        status text NOT NULL DEFAULT 'open',
        priority text NOT NULL DEFAULT 'normal',
        last_message_at timestamp DEFAULT now() NOT NULL,
        unread_by_admin boolean NOT NULL DEFAULT true,
        unread_by_customer boolean NOT NULL DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id uuid NOT NULL,
        sender_type text NOT NULL DEFAULT 'customer',
        sender_name text NOT NULL DEFAULT '',
        message text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_admin boolean NOT NULL DEFAULT true`);
    await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_customer boolean NOT NULL DEFAULT false`);
    await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'`);
    await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS last_message_at timestamp DEFAULT now()`);
  } catch (e) {
    console.error("[Ensure support tables error]", e);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    await ensureTables();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    // 1. Fetch ticket details safely with Drizzle query
    let ticketRow: any = null;
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
        .where(sql`${supportTickets.id}::text = ${id}`)
        .limit(1);

      if (rows.length > 0) {
        ticketRow = rows[0];
      }
    } catch (err) {
      console.error("[Admin Ticket GET fetch error]", err);
    }

    // Direct SQL fallback if Drizzle query didn't yield
    if (!ticketRow) {
      try {
        const rawRes = await db.execute(sql`
          SELECT
            t.id,
            t.customer_id as "customerId",
            t.subject,
            t.category,
            t.status,
            COALESCE(t.priority, 'normal') as priority,
            COALESCE(t.last_message_at, t.created_at) as "lastMessageAt",
            COALESCE(t.unread_by_admin, false) as "unreadByAdmin",
            t.created_at as "createdAt",
            c.name as "customerName",
            c.email as "customerEmail",
            c.phone as "customerPhone"
          FROM support_tickets t
          LEFT JOIN customers c ON t.customer_id = c.id
          WHERE t.id::text = ${id}
          LIMIT 1
        `);
        const rawRows = (rawRes as any).rows || (Array.isArray(rawRes) ? rawRes : []);
        if (rawRows.length > 0) {
          ticketRow = rawRows[0];
        }
      } catch (rawErr) {
        console.error("[Admin Ticket GET raw query fallback error]", rawErr);
      }
    }

    if (!ticketRow) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Mark as read by admin
    try {
      await db.execute(sql`
        UPDATE support_tickets
        SET unread_by_admin = false
        WHERE id::text = ${id}
      `);
    } catch (uErr) {
      console.error("[Admin Ticket mark read error]", uErr);
    }

    // Fetch conversation messages safely
    let messages: any[] = [];
    try {
      const msgRows = await db
        .select({
          id: supportMessages.id,
          senderType: supportMessages.senderType,
          senderName: supportMessages.senderName,
          message: supportMessages.message,
          createdAt: supportMessages.createdAt,
        })
        .from(supportMessages)
        .where(sql`${supportMessages.ticketId}::text = ${id}`)
        .orderBy(asc(supportMessages.createdAt));

      messages = msgRows;
    } catch {
      try {
        const rawMsgs = await db.execute(sql`
          SELECT
            id,
            sender_type as "senderType",
            sender_name as "senderName",
            message,
            created_at as "createdAt"
          FROM support_messages
          WHERE ticket_id::text = ${id}
          ORDER BY created_at ASC
        `);
        messages = (rawMsgs as any).rows || (Array.isArray(rawMsgs) ? rawMsgs : []);
      } catch {
        messages = [];
      }
    }

    return NextResponse.json({
      ticket: { ...ticketRow, unreadByAdmin: false },
      messages,
    });
  } catch (error: any) {
    console.error("[Admin Ticket GET error]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load ticket" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    await ensureTables();
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
    await ensureTables();
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
    await ensureTables();
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