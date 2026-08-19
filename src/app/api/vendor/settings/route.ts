import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";
import { isValidVendorCurrency } from "@/lib/vendor-currency";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vAny = vendor as unknown as { preferredCurrency?: string };
    return NextResponse.json({
      settings: {
        email: vendor.email,
        storeName: vendor.storeName,
        storeSlug: vendor.storeSlug,
        storeDescription: vendor.storeDescription,
        storeDescriptionFr: vendor.storeDescriptionFr,
        logo: vendor.logo,
        banner: vendor.banner,
        trustTagline: vendor.trustTagline,
        trustTaglineFr: vendor.trustTaglineFr,
        contactName: vendor.contactName,
        phone: vendor.phone,
        whatsapp: vendor.whatsapp,
        country: vendor.country,
        city: vendor.city,
        bankName: vendor.bankName,
        bankAccount: vendor.bankAccount,
        bankAccountName: vendor.bankAccountName,
        commissionRate: vendor.commissionRate,
        preferredCurrency: vAny.preferredCurrency || "USD",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.storeName === "string" && body.storeName.trim()) updateData.storeName = body.storeName.slice(0, 100).trim();
    if (typeof body.storeDescription === "string") updateData.storeDescription = body.storeDescription.slice(0, 2000);
    if (typeof body.storeDescriptionFr === "string") updateData.storeDescriptionFr = body.storeDescriptionFr.slice(0, 2000);
    if (typeof body.logo === "string") updateData.logo = body.logo.slice(0, 500);
    if (typeof body.banner === "string") updateData.banner = body.banner.slice(0, 500);
    if (typeof body.trustTagline === "string") updateData.trustTagline = body.trustTagline.slice(0, 200);
    if (typeof body.trustTaglineFr === "string") updateData.trustTaglineFr = body.trustTaglineFr.slice(0, 200);
    if (typeof body.contactName === "string") updateData.contactName = body.contactName.slice(0, 100);
    if (typeof body.phone === "string") updateData.phone = body.phone.slice(0, 30);
    if (typeof body.whatsapp === "string") updateData.whatsapp = body.whatsapp.slice(0, 30);
    if (typeof body.country === "string") updateData.country = body.country.slice(0, 5);
    if (typeof body.city === "string") updateData.city = body.city.slice(0, 60);
    if (typeof body.bankName === "string") updateData.bankName = body.bankName.slice(0, 100);
    if (typeof body.bankAccount === "string") updateData.bankAccount = body.bankAccount.slice(0, 50);
    if (typeof body.bankAccountName === "string") updateData.bankAccountName = body.bankAccountName.slice(0, 100);

    if (typeof body.preferredCurrency === "string" && isValidVendorCurrency(body.preferredCurrency)) {
      updateData.preferredCurrency = body.preferredCurrency;
    }

    await db.update(vendors).set(updateData as unknown as Partial<typeof vendors.$inferInsert>).where(eq(vendors.id, vendor.id));

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}