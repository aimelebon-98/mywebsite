import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { stripHtml } from "@/lib/sanitize";
import { and, eq, asc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function ensureMessagesTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id uuid NOT NULL,
        sender_type text NOT NULL,
        sender_name text NOT NULL DEFAULT '',
        message text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
  } catch (e) {
    console.error("ensureMessagesTable error:", e);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureMessagesTable();

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)));

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.unreadByCustomer) {
      await db
        .update(supportTickets)
        .set({ unreadByCustomer: false })
        .where(eq(supportTickets.id, id));
    }

    const messagesList = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.ticketId, id))
      .orderBy(asc(supportMessages.createdAt));

    return NextResponse.json({ ticket, messages: messagesList });
  } catch (error) {
    console.error("Error fetching customer ticket:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
    }

    if (!await verifyRequestOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureMessagesTable();

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();

    const message = stripHtml(String(body.message || body.reply || "")).trim().slice(0, 5000);
    if (!message) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)));

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "customer",
      senderName: customer.name || "Customer",
      message,
    });

    await db
      .update(supportTickets)
      .set({
        lastMessageAt: new Date(),
        unreadByAdmin: true,
        unreadByCustomer: false,
        status: ticket.status === "closed" ? "open" : ticket.status,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id));

    return NextResponse.json({ success: true, message: "Reply sent" });
  } catch (error) {
    console.error("Error posting customer reply:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 20, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
    }

    if (!await verifyRequestOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();

    const [updated] = await db
      .update(supportTickets)
      .set({
        lastMessageAt: new Date(),
        unreadByAdmin: true,
        status: body.status !== undefined ? stripHtml(String(body.status)) : undefined,
      })
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}