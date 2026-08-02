import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;

  try {
    const [ticket] = await db.select().from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)));

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const messages = await db.select().from(supportMessages)
      .where(eq(supportMessages.ticketId, id))
      .orderBy(asc(supportMessages.createdAt));

    // Mark as read by customer
    if (ticket.unreadByCustomer) {
      await db.update(supportTickets).set({ unreadByCustomer: false })
        .where(eq(supportTickets.id, id));
    }

    return NextResponse.json({ ticket, messages });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const message = String(body.message || "").trim();

  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  try {
    const [ticket] = await db.select().from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)));

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "customer",
      senderName: customer.name,
      message,
    });

    await db.update(supportTickets).set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
      unreadByAdmin: true,
      status: ticket.status === "resolved" || ticket.status === "closed" ? "open" : ticket.status,
    }).where(eq(supportTickets.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}