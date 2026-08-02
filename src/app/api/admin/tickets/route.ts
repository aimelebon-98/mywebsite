import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select({
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
    .orderBy(desc(supportTickets.lastMessageAt));

    return NextResponse.json({ tickets: rows });
  } catch (e) {
    return NextResponse.json({ tickets: [], error: String(e) });
  }
}