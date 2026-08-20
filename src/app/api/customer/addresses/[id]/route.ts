import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerAddresses, customerSessions } from "@/db/schema";
import { getCustomerFromRequest } from "@/lib/customer-auth";
import { isRateLimited } from "@/lib/rate-limit";
import { verifyRequestOrigin } from "@/lib/csrf";
import { stripHtml } from "@/lib/sanitize";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
        label: body.label !== undefined ? stripHtml(String(body.label)).slice(0, 50) : undefined,
        fullName: body.fullName !== undefined ? stripHtml(String(body.fullName)).slice(0, 100) : undefined,
        phone: body.phone !== undefined ? stripHtml(String(body.phone)).slice(0, 30) : undefined,
        street: body.street !== undefined
          ? stripHtml(String(body.street)).slice(0, 300)
          : (body.address !== undefined || body.addressLine1 !== undefined)
          ? stripHtml(String(body.address || body.addressLine1 || "")).slice(0, 300)
          : undefined,
        city: body.city !== undefined ? stripHtml(String(body.city)).slice(0, 100) : undefined,
        state: body.state !== undefined ? stripHtml(String(body.state)).slice(0, 100) : undefined,
        country: body.country !== undefined ? stripHtml(String(body.country)).slice(0, 100) : undefined,
        postalCode: body.postalCode !== undefined ? stripHtml(String(body.postalCode)).slice(0, 20) : undefined,
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
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (isRateLimited(ip, 20, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (!await verifyRequestOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

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