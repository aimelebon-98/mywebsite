import { requireCustomer } from "@/lib/customer-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentCustomer, hashPassword, verifyPassword } from "@/lib/customer-auth";

export async function PATCH(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.phone !== undefined) updates.phone = String(body.phone).trim();

  // Password change requires current password
  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const valid = await verifyPassword(body.currentPassword, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }
    updates.passwordHash = await hashPassword(body.newPassword);
  }

  updates.updatedAt = new Date();

  const [updated] = await db.update(customers).set(updates)
    .where(eq(customers.id, customer.id)).returning();

  return NextResponse.json({
    ok: true,
    customer: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone },
  });
}
