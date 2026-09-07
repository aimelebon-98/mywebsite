import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateOrders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  try {
    const list = await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.affiliateId, affiliate.id))
      .orderBy(desc(affiliateOrders.createdAt));

    return NextResponse.json({ success: true, orders: list });
  } catch (error) {
    console.error("Affiliate fetch orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}