import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorOrders, vendorProducts, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Recent orders (last 10)
    const recentOrders = await db.select().from(vendorOrders)
      .where(eq(vendorOrders.vendorId, vendor.id))
      .orderBy(desc(vendorOrders.createdAt))
      .limit(10);

    // Product counts by status
    const myVendorProducts = await db.select().from(vendorProducts)
      .where(eq(vendorProducts.vendorId, vendor.id));

    const productCounts = {
      total: myVendorProducts.length,
      pending: myVendorProducts.filter(p => p.status === "pending").length,
      approved: myVendorProducts.filter(p => p.status === "approved").length,
      rejected: myVendorProducts.filter(p => p.status === "rejected").length,
    };

    // Total number of my products actually live on site
    let liveCount = 0;
    if (myVendorProducts.length > 0) {
      const productIds = myVendorProducts.filter(p => p.status === "approved").map(p => p.productId);
      if (productIds.length > 0) {
        try {
          const liveProds = await db.select().from(products);
          liveCount = liveProds.filter(p => productIds.includes(p.id) && p.active).length;
        } catch {}
      }
    }

    return NextResponse.json({
      productCounts: { ...productCounts, live: liveCount },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        subtotal: o.subtotal,
        commissionAmount: o.commissionAmount,
        vendorEarning: o.vendorEarning,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}