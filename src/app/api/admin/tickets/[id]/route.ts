import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages, customers } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { stripHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "").trim();

    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    // Ensure PostgreSQL columns exist
    try {
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS unread_by_admin boolean NOT NULL DEFAULT true`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'`);
      await db.execute(sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS last_message_at timestamp DEFAULT now()`);
    } catch { /* ignore */ }

    // Fetch ticket details with customer JOIN via standard Drizzle
    const ticketRows = await db
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

    if (!ticketRows || ticketRows.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = ticketRows[0];

    // Mark as read by admin
    try {
      await db
        .update(supportTickets)
        .set({ unreadByAdmin: false })
        .where(eq(supportTickets.id, id));
    } catch (uErr) {
      console.error("[Admin Ticket mark read error]", uErr);
    }

    // Fetch conversation messages
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
    } catch (mErr) {
      console.error("[Admin Ticket messages fetch error]", mErr);
      messages = [];
    }

    return NextResponse.json({
      ticket: { ...ticket, unreadByAdmin: false },
      messages,
    });
  } catch (error: any) {
    console.error("[Admin Ticket GET Error]", error);
    return NextResponse.json(
      { error: error?.message || String(error) || "Failed to load ticket details" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "").trim();
    const body = await req.json();
    const message = stripHtml(String(body.message || "")).trim().slice(0, 5000);
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "admin",
      senderName: "Support",
      message: message,
    } as any);

    await db
      .update(supportTickets)
      .set({
        lastMessageAt: new Date(),
        unreadByAdmin: false,
        unreadByCustomer: true,
      })
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Ticket POST reply error]", error);
    return NextResponse.json({ error: error?.message || "Failed to send reply" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "").trim();
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.priority === "string") updates.priority = body.priority;

    if (Object.keys(updates).length > 0) {
      await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Ticket PUT error]", error);
    return NextResponse.json({ error: error?.message || "Failed to update ticket" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  return PUT(req, { params });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const resolvedParams = await Promise.resolve(params);
    const id = String(resolvedParams?.id || "").trim();
    try {
      await db.delete(supportMessages).where(eq(supportMessages.ticketId, id));
    } catch { /* ignore */ }
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete ticket" }, { status: 500 });
  }
}