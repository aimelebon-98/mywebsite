import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customer.id))
      .orderBy(desc(customerAddresses.createdAt));

    return NextResponse.json({ addresses: rows });
  } catch {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customer.id));
    }

    const [inserted] = await db
      .insert(customerAddresses)
      .values({
        customerId: customer.id,
        label: String(body.label || "Home").trim().slice(0, 50),
        fullName: String(body.fullName || (customer as any).name || (customer as any).fullName || "").trim().slice(0, 100),
        phone: String(body.phone || (customer as any).phone || "").trim().slice(0, 30),
        street: String(body.street || body.address || body.addressLine1 || "").trim().slice(0, 300),
        city: String(body.city || "").trim().slice(0, 100),
        state: String(body.state || "").trim().slice(0, 100),
        country: String(body.country || "Nigeria").trim().slice(0, 100),
        postalCode: String(body.postalCode || body.zipCode || "").trim().slice(0, 20),
        isDefault: Boolean(body.isDefault),
      })
      .returning();

    return NextResponse.json({ address: inserted }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}