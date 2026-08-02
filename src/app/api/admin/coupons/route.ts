import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return NextResponse.json({ coupons: rows });
  } catch (e) {
    return NextResponse.json({ coupons: [], error: String(e) });
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const code = String(body.code || "").toUpperCase().trim();
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });
    const [row] = await db.insert(coupons).values({
      code,
      type: body.type === "fixed" ? "fixed" : "percent",
      value: String(body.value || "0"),
      minOrder: String(body.minOrder || "0"),
      maxUses: body.maxUses ? parseInt(String(body.maxUses)) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      active: body.active !== false,
      description: String(body.description || ""),
      descriptionFr: body.descriptionFr ? String(body.descriptionFr) : null,
      isWelcome: Boolean(body.isWelcome),
    }).returning();
    return NextResponse.json({ coupon: row }, { status: 201 });
  } catch (e) {
    const msg = String(e);
    if (msg.includes("unique")) return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
