import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const addrs = await db.select().from(customerAddresses)
    .where(eq(customerAddresses.customerId, customer.id))
    .orderBy(desc(customerAddresses.createdAt));

  return NextResponse.json({ addresses: addrs });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json();
  const { label, fullName, phone, street, city, state, country, postalCode, isDefault } = body;

  if (!fullName || !phone || !street || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await db.update(customerAddresses).set({ isDefault: false })
      .where(eq(customerAddresses.customerId, customer.id));
  }

  const [addr] = await db.insert(customerAddresses).values({
    customerId: customer.id,
    label: label || "Home",
    fullName, phone, street, city,
    state: state || "",
    country: country || "Nigeria",
    postalCode: postalCode || "",
    isDefault: isDefault || false,
  }).returning();

  return NextResponse.json({ address: addr });
}
