import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const rows = await db.select().from(supportTickets)
      .where(eq(supportTickets.customerId, customer.id))
      .orderBy(desc(supportTickets.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();

    if (!body.subject || !body.message) {
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    const [inserted] = await db.insert(supportTickets).values({
      customerId: customer.id,
      customerName: String(customer.name || "").slice(0, 100),
      customerEmail: String(customer.email || "").slice(0, 100),
      subject: String(body.subject).slice(0, 200),
      message: String(body.message).slice(0, 5000),
      status: "open",
      priority: String(body.priority || "normal").slice(0, 20),
    }).returning();

    return NextResponse.json({ success: true, ticket: inserted });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}