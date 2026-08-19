import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorOrders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await db.select().from(vendorOrders)
      .where(eq(vendorOrders.vendorId, vendor.id))
      .orderBy(desc(vendorOrders.createdAt));

    return NextResponse.json({ orders });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}