import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  if (body.isDefault) {
    await db.update(customerAddresses).set({ isDefault: false })
      .where(eq(customerAddresses.customerId, customer.id));
  }

  const [updated] = await db.update(customerAddresses).set(body)
    .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)))
    .returning();

  return NextResponse.json({ address: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { id } = await params;

  await db.delete(customerAddresses)
    .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)));

  return NextResponse.json({ ok: true });
}