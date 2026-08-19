import { NextResponse } from "next/server";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ vendor: null });

    const vAny = vendor as unknown as { mustChangePassword?: boolean; preferredCurrency?: string; conciergeDebt?: string };
    return NextResponse.json({
      vendor: {
        id: vendor.id,
        email: vendor.email,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        logo: vendor.logo,
        status: vendor.status,
        commissionRate: vendor.commissionRate,
        totalSales: vendor.totalSales,
        totalEarnings: vendor.totalEarnings,
        pendingPayout: vendor.pendingPayout,
        totalPaidOut: vendor.totalPaidOut,
        fulfillmentRate: vendor.fulfillmentRate,
        mustChangePassword: vAny.mustChangePassword ?? false,
        preferredCurrency: vAny.preferredCurrency || "USD",
        conciergeDebt: vAny.conciergeDebt || "0",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}