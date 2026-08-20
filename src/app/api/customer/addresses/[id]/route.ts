import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();

    if (body.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customer.id));
    }

    const [updated] = await db
      .update(customerAddresses)
      .set({
        label: body.label !== undefined ? String(body.label).slice(0, 50) : undefined,
        fullName: body.fullName !== undefined ? String(body.fullName).slice(0, 100) : undefined,
        phone: body.phone !== undefined ? String(body.phone).slice(0, 30) : undefined,
        street: body.street !== undefined
          ? String(body.street).slice(0, 300)
          : (body.address !== undefined || body.addressLine1 !== undefined)
          ? String(body.address || body.addressLine1 || "").slice(0, 300)
          : undefined,
        city: body.city !== undefined ? String(body.city).slice(0, 100) : undefined,
        state: body.state !== undefined ? String(body.state).slice(0, 100) : undefined,
        country: body.country !== undefined ? String(body.country).slice(0, 100) : undefined,
        postalCode: body.postalCode !== undefined ? String(body.postalCode).slice(0, 20) : undefined,
        isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
      })
      .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ address: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    await db
      .delete(customerAddresses)
      .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, customer.id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}