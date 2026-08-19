import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorProducts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    if (!productId) return NextResponse.json({ vendor: null });

    const [vp] = await db.select().from(vendorProducts).where(eq(vendorProducts.productId, productId)).limit(1);
    if (!vp) return NextResponse.json({ vendor: null });

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vp.vendorId)).limit(1);
    if (!vendor || vendor.status !== "approved") return NextResponse.json({ vendor: null });

    return NextResponse.json({
      vendor: {
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        logo: vendor.logo,
        trustTagline: vendor.trustTagline,
        trustTaglineFr: vendor.trustTaglineFr,
        totalSales: vendor.totalSales,
        fulfillmentRate: vendor.fulfillmentRate,
        approvedAt: vendor.approvedAt,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}