import { NextResponse } from "next/server";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        email: vendor.email,
        contactName: vendor.contactName,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        storeDescription: vendor.storeDescription,
        phone: vendor.phone,
        whatsapp: vendor.whatsapp,
        country: vendor.country,
        city: vendor.city,
        status: vendor.status,
        commissionRate: vendor.commissionRate,
        totalSales: vendor.totalSales,
        totalEarnings: vendor.totalEarnings,
        pendingPayout: vendor.pendingPayout,
        preferredCurrency: vendor.preferredCurrency,
        mustChangePassword: vendor.mustChangePassword,
        logo: vendor.logo,
        banner: vendor.banner,
        trustTagline: vendor.trustTagline,
        fulfillmentRate: vendor.fulfillmentRate,
      },
    });
  } catch (err: any) {
    console.error("Vendor /me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
