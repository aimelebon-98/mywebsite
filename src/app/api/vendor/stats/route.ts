import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorProducts, vendorOrders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let productCount = 0;
    let orderCount = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;

    try {
      const pResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(vendorProducts)
        .where(and(
          eq(vendorProducts.vendorId, vendor.id),
          eq(vendorProducts.status, "approved")
        ));
      productCount = Number(pResult[0]?.count || 0);
    } catch { /* graceful fallback */ }

    try {
      const oResult = await db
        .select({
          count: sql<number>`count(*)`,
          revenue: sql<number>`coalesce(sum(${vendorOrders.vendorEarning}), 0)`,
          pending: sql<number>`sum(case when ${vendorOrders.status} = 'pending' then 1 else 0 end)`,
        })
        .from(vendorOrders)
        .where(eq(vendorOrders.vendorId, vendor.id));
      orderCount = Number(oResult[0]?.count || 0);
      totalRevenue = Number(oResult[0]?.revenue || 0);
      pendingOrders = Number(oResult[0]?.pending || 0);
    } catch { /* graceful fallback */ }

    return NextResponse.json({
      success: true,
      stats: {
        productCount,
        orderCount,
        totalRevenue,
        pendingOrders,
        totalSales: vendor.totalSales || 0,
        totalEarnings: vendor.totalEarnings || 0,
        pendingPayout: vendor.pendingPayout || 0,
        fulfillmentRate: vendor.fulfillmentRate || 100,
      },
    });
  } catch (err: any) {
    console.error("Vendor stats error:", err);
    return NextResponse.json({
      success: true,
      stats: {
        productCount: 0,
        orderCount: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalSales: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        fulfillmentRate: 100,
      },
    });
  }
}