import { NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;
    const body = await req.json();

    await db.update(customerAddresses)
      .set({
        label: body.label !== undefined ? String(body.label).slice(0, 50) : undefined,
        fullName: body.fullName !== undefined ? String(body.fullName).slice(0, 100) : undefined,
        phone: body.phone !== undefined ? String(body.phone).slice(0, 30) : undefined,
        addressLine1: body.addressLine1 !== undefined ? String(body.addressLine1).slice(0, 200) : undefined,
        addressLine2: body.addressLine2 !== undefined ? String(body.addressLine2).slice(0, 200) : undefined,
        city: body.city !== undefined ? String(body.city).slice(0, 80) : undefined,
        state: body.state !== undefined ? String(body.state).slice(0, 80) : undefined,
        country: body.country !== undefined ? String(body.country).slice(0, 80) : undefined,
        postalCode: body.postalCode !== undefined ? String(body.postalCode).slice(0, 20) : undefined,
        isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
      })
      .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const customer = await requireCustomer();
    const { id } = await params;

    await db.delete(customerAddresses)
      .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}