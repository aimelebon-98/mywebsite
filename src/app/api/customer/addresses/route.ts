import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses, customerSessions } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { stripHtml } from "@/lib/sanitize";
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
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 20, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    if (!await verifyRequestOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

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
        label: stripHtml(String(body.label || "Home")).slice(0, 50),
        fullName: stripHtml(String(body.fullName || (customer as any).name || "")).slice(0, 100),
        phone: stripHtml(String(body.phone || (customer as any).phone || "")).slice(0, 30),
        street: stripHtml(String(body.street || body.address || body.addressLine1 || "")).slice(0, 300),
        city: stripHtml(String(body.city || "")).slice(0, 100),
        state: stripHtml(String(body.state || "")).slice(0, 100),
        country: stripHtml(String(body.country || "Nigeria")).slice(0, 100),
        postalCode: stripHtml(String(body.postalCode || body.zipCode || "")).slice(0, 20),
        isDefault: Boolean(body.isDefault),
      })
      .returning();

    return NextResponse.json({ address: inserted }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}