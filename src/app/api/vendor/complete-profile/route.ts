import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const COUNTRY_CURRENCY: Record<string, string> = {
  NG: "NGN", TG: "XOF", BJ: "XOF", BF: "XOF", CI: "XOF",
  GW: "XOF", ML: "XOF", NE: "XOF", SN: "XOF",
  GH: "GHS", KE: "KES", ZA: "ZAR", CM: "XAF",
  FR: "EUR", GB: "GBP", US: "USD",
};

export async function POST(req: NextRequest) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const d = await req.json();
    const {
      storeName, storeDescription, productCategories,
      contactName, phone, whatsapp, country, city,
      bankName, bankAccount, bankAccountName,
      instagramUrl, websiteUrl, additionalInfo,
    } = d;

    if (!storeName || !contactName || !country) {
      return NextResponse.json({ error: "Store name, contact name, and country are required" }, { status: 400 });
    }

    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 40);

    const currency = COUNTRY_CURRENCY[country] || "USD";
    const now = new Date();

    await db.update(vendors).set({
      storeName,
      storeSlug: slug,
      storeDescription: storeDescription || "",
      contactName,
      phone: phone || "",
      whatsapp: whatsapp || "",
      country,
      city: city || "",
      bankName: bankName || "",
      bankAccount: bankAccount || "",
      bankAccountName: bankAccountName || "",
      preferredCurrency: currency,
      status: "pending",
      updatedAt: now,
    }).where(eq(vendors.id, vendor.id));

    const catsArr = Array.isArray(productCategories)
      ? productCategories
      : productCategories
      ? String(productCategories).split(",").map((s: string) => s.trim())
      : [];

    await db.insert(vendorApplications).values({
      id: crypto.randomUUID(),
      applicantName: contactName,
      email: vendor.email,
      phone: phone || "",
      whatsapp: whatsapp || "",
      storeName,
      storeDescription: storeDescription || "",
      productCategories: catsArr.join(", "),
      country,
      city: city || "",
      instagramUrl: instagramUrl || "",
      websiteUrl: websiteUrl || "",
      additionalInfo: additionalInfo || "",
      status: "pending",
      adminNote: "",
      createdAt: now,
    });

    try {
      const { sendAdminNewVendorApplicationEmail } = await import("@/lib/email");
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";
      await sendAdminNewVendorApplicationEmail(adminEmail, {
        applicantName: contactName,
        email: vendor.email,
        phone: phone || "",
        storeName,
        storeDescription: storeDescription || "",
        country,
        city: city || "",
        categories: catsArr,
        instagramUrl: instagramUrl || undefined,
        websiteUrl: websiteUrl || undefined,
      });
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr);
    }

    return NextResponse.json({ success: true, storeSlug: slug });
  } catch (err: any) {
    console.error("Complete profile error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
