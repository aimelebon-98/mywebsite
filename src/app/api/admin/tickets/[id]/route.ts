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

  try {
    const { id } = await params;

    const [ticketRow] = await db
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

    if (!ticketRow) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Mark as read for admin
    await db
      .update(supportTickets)
      .set({ unreadByAdmin: false } as Partial<typeof supportTickets.$inferInsert>)
      .where(eq(supportTickets.id, id));

    let messages: Array<{
      id: string;
      senderType: string;
      senderName: string;
      message: string;
      createdAt: Date | string;
    }> = [];

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
      messages = [];
    }

    return NextResponse.json({
      ticket: { ...ticketRow, unreadByAdmin: false },
      messages,
    });
  } catch (error) {
    console.error("[Admin Ticket GET]", error);
    return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const body = await req.json();
    const message = stripHtml(String(body.message || "")).trim().slice(0, 5000);
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "admin",
      senderName: "Support",
      message,
    });

    const now = new Date();
    await db
      .update(supportTickets)
      .set({
        lastMessageAt: now,
        unreadByAdmin: false,
        unreadByCustomer: true,
        status: ticket.status === "open" ? "in_progress" : ticket.status,
      } as Partial<typeof supportTickets.$inferInsert>)
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Ticket POST reply]", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.priority === "string") updates.priority = body.priority;
    if (typeof body.unreadByAdmin === "boolean") updates.unreadByAdmin = body.unreadByAdmin;
    if (typeof body.message === "string" && body.message.trim()) {
      // allow PUT-style reply too
      await db.insert(supportMessages).values({
        ticketId: id,
        senderType: "admin",
        senderName: "Support",
        message: stripHtml(body.message).trim().slice(0, 5000),
      });
      updates.lastMessageAt = new Date();
      updates.unreadByAdmin = false;
      updates.unreadByCustomer = true;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(supportTickets).set(updates as Partial<typeof supportTickets.$inferInsert>).where(eq(supportTickets.id, id));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Ticket PUT]", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    try {
      await db.delete(supportMessages).where(eq(supportMessages.ticketId, id));
    } catch { /* ignore */ }
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}