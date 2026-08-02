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
        html: '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">' +
              '<div style="background:linear-gradient(135deg,#CA3F2E 0%,#8B2A1E 100%);padding:24px;text-align:center;border-radius:16px 16px 0 0;">' +
              '<div style="font-weight:900;font-size:20px;letter-spacing:-0.02em;">' +
              '<span style="color:white;">NewDeal</span>' +
              '<span style="color:rgba(255,255,255,0.4);font-weight:300;margin:0 4px;">|</span>' +
              '<span style="color:white;letter-spacing:0.15em;font-size:16px;">ZONE</span>' +
              '</div>' +
              '<div style="color:rgba(255,255,255,0.85);font-size:12px;margin-top:4px;">Support</div>' +
              '</div>' +
              '<div style="background:#fff;padding:28px;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px;">' +
              '<h2 style="color:#111827;margin:0 0 12px 0;font-size:20px;">Hi ' + name + ',</h2>' +
              '<p style="color:#4b5563;margin:0 0 16px 0;">You have a new reply to your support ticket:</p>' +
              '<div style="background:#f9fafb;border-left:4px solid #CA3F2E;padding:16px;margin:16px 0;border-radius:8px;">' +
              '<strong>' + subject + '</strong><br/><br/>' +
              message.replace(/</g, "&lt;").replace(/\n/g, "<br/>") +
              '</div>' +
              '<div style="text-align:center;margin:24px 0;">' +
              '<a href="https://www.newdealzone.com/en/account/tickets" style="background:#CA3F2E;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">View ticket</a>' +
              '</div>' +
              '<p style="color:#9ca3af;font-size:12px;margin:24px 0 0 0;text-align:center;">NewDeal | ZONE Support Team</p>' +
              '</div>' +
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