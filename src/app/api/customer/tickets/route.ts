import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  try {
    const tickets = await db.select().from(supportTickets)
      .where(eq(supportTickets.customerId, customer.id))
      .orderBy(desc(supportTickets.lastMessageAt));
    return NextResponse.json({ tickets });
  } catch (e) {
    return NextResponse.json({ tickets: [], error: String(e) });
  }
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json();
  const subject = String(body.subject || "").trim();
  const category = String(body.category || "general").trim();
  const message = String(body.message || "").trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  try {
    const [ticket] = await db.insert(supportTickets).values({
      customerId: customer.id,
      subject,
      category,
      status: "open",
      priority: "normal",
      unreadByAdmin: true,
      unreadByCustomer: false,
    }).returning();

    await db.insert(supportMessages).values({
      ticketId: ticket.id,
      senderType: "customer",
      senderName: customer.name,
      message,
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}