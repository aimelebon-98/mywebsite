import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

interface Params { params: Promise<{ id: string }>; }

export async function PUT(req: NextRequest, { params }: Params) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.code !== undefined) updates.code = String(body.code).toUpperCase().trim();
    if (body.type !== undefined) updates.type = body.type === "fixed" ? "fixed" : "percent";
    if (body.value !== undefined) updates.value = String(body.value);
    if (body.minOrder !== undefined) updates.minOrder = String(body.minOrder);
    if (body.maxUses !== undefined) updates.maxUses = body.maxUses ? parseInt(String(body.maxUses)) : null;
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.description !== undefined) updates.description = String(body.description);
    if (body.descriptionFr !== undefined) updates.descriptionFr = body.descriptionFr || null;
    if (body.isWelcome !== undefined) updates.isWelcome = Boolean(body.isWelcome);
    const [row] = await db.update(coupons).set(updates).where(eq(coupons.id, id)).returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ coupon: row });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
