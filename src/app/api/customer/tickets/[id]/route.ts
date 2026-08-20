import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;

    const [ticket] = await db.select().from(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)))
      .limit(1);

    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;
    const body = await req.json();

    await db.update(supportTickets)
      .set({
        message: body.message !== undefined ? String(body.message).slice(0, 5000) : undefined,
        status: body.status === "closed" ? "closed" : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(supportTickets.id, id), eq(supportTickets.customerId, customer.id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}