import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireCustomer, hashPassword, verifyPassword } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await requireCustomer();
    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const customer = await requireCustomer();
    const body = await req.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = String(body.name).slice(0, 100);
    if (body.phone !== undefined) updates.phone = String(body.phone).slice(0, 30);

    if (body.currentPassword && body.newPassword) {
      const ok = await verifyPassword(String(body.currentPassword), customer.passwordHash || "");
      if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      if (String(body.newPassword).length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }
      updates.passwordHash = await hashPassword(String(body.newPassword));
    }

    await db.update(customers).set(updates).where(eq(customers.id, customer.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  return PUT(req);
}