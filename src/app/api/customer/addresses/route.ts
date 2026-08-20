import { NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await requireCustomer();
    const rows = await db.select().from(customerAddresses).where(eq(customerAddresses.customerId, customer.id));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();

    const [inserted] = await db.insert(customerAddresses).values({
      customerId: customer.id,
      label: String(body.label || "Home").slice(0, 50),
      fullName: String(body.fullName || body.name || customer.name || "").slice(0, 100),
      phone: String(body.phone || "").slice(0, 30),
      addressLine1: String(body.addressLine1 || body.address || "").slice(0, 200),
      addressLine2: String(body.addressLine2 || "").slice(0, 200),
      city: String(body.city || "").slice(0, 80),
      state: String(body.state || "").slice(0, 80),
      country: String(body.country || "").slice(0, 80),
      postalCode: String(body.postalCode || "").slice(0, 20),
      isDefault: Boolean(body.isDefault),
    }).returning();

    return NextResponse.json({ success: true, address: inserted });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: msg === "UNAUTHORIZED" ? "Unauthorized" : msg }, { status: 401 });
  }
}