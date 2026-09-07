import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateOrders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET: All affiliate referred orders across entire store
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const list = await db
      .select({
        order: affiliateOrders,
        affiliate: {
          id: affiliates.id,
          name: affiliates.name,
          email: affiliates.email,
          code: affiliates.code,
        },
      })
      .from(affiliateOrders)
      .innerJoin(affiliates, eq(affiliateOrders.affiliateId, affiliates.id))
      .orderBy(desc(affiliateOrders.createdAt));

    return NextResponse.json({ success: true, orders: list });
  } catch (error) {
    console.error("Admin fetch affiliate orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}