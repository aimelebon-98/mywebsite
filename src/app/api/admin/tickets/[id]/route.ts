import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages, customers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

async function sendCustomerEmail(email: string, name: string, subject: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "NewDealZone Support <support@newdealzone.com>",
        to: email,
        subject: "New reply: " + subject,
        html: '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">' +
              '<h2 style="color:#CA3F2E;">Hi ' + name + ',</h2>' +
              '<p>You have a new reply to your support ticket:</p>' +
              '<div style="background:#f9fafb;border-left:4px solid #CA3F2E;padding:16px;margin:16px 0;border-radius:8px;">' +
              '<strong>' + subject + '</strong><br/><br/>' +
              message.replace(/</g, "&lt;").replace(/\n/g, "<br/>") +
              '</div>' +
              '<p><a href="https://www.newdealzone.com/en/account/tickets" style="background:#CA3F2E;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View ticket</a></p>' +
              '<p style="color:#6b7280;font-size:12px;margin-top:32px;">NewDealZone Support Team</p>' +
              '</div>',
      }),
    });
  } catch { /* email fail is non-fatal */ }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [ticket] = await db.select({
      id: supportTickets.id,
      customerId: supportTickets.customerId,
      subject: supportTickets.subject,
      category: supportTickets.category,
      status: supportTickets.status,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      lastMessageAt: supportTickets.lastMessageAt,
      customerName: customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
    })
    .from(supportTickets)
    .leftJoin(customers, eq(supportTickets.customerId, customers.id))
    .where(eq(supportTickets.id, id));

    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await db.select().from(supportMessages)
      .where(eq(supportMessages.ticketId, id))
      .orderBy(asc(supportMessages.createdAt));

    if (ticket) {
      await db.update(supportTickets).set({ unreadByAdmin: false })
        .where(eq(supportTickets.id, id));
    }

    return NextResponse.json({ ticket, messages });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const message = String(body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  try {
    const [ticket] = await db.select({
      subject: supportTickets.subject,
      customerId: supportTickets.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
    })
    .from(supportTickets)
    .leftJoin(customers, eq(supportTickets.customerId, customers.id))
    .where(eq(supportTickets.id, id));

    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.insert(supportMessages).values({
      ticketId: id,
      senderType: "admin",
      senderName: "Support Team",
      message,
    });

    await db.update(supportTickets).set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
      unreadByCustomer: true,
      unreadByAdmin: false,
    }).where(eq(supportTickets.id, id));

    if (ticket.customerEmail) {
      sendCustomerEmail(ticket.customerEmail, ticket.customerName || "Customer", ticket.subject, message);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) updates.status = String(body.status);
  if (body.priority) updates.priority = String(body.priority);

  try {
    await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}