import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentVendor, generateUniqueStoreSlug } from "@/lib/vendor-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const currentVendor = await getCurrentVendor();
    if (!currentVendor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeName,
      storeDescription,
      productCategories,
      country,
      city,
      phone,
      whatsapp,
      bankName,
      bankAccount,
      bankAccountName,
      instagramUrl,
      websiteUrl,
      additionalInfo,
    } = body;

    const trimmedStoreName = String(storeName || "").trim() || currentVendor.storeName || `${currentVendor.contactName}'s Store`;
    let storeSlug = currentVendor.storeSlug;
    if (!storeSlug || storeSlug.length < 2) {
      storeSlug = await generateUniqueStoreSlug(trimmedStoreName);
    }

    const categoriesArr: string[] = Array.isArray(productCategories)
      ? productCategories
      : productCategories
      ? String(productCategories).split(",").map((s) => s.trim())
      : [];

    const categoriesStr = categoriesArr.join(", ");
    const now = new Date();

    const [updatedVendor] = await db
      .update(vendors)
      .set({
        storeName: trimmedStoreName,
        storeSlug,
        storeDescription: storeDescription ? String(storeDescription).trim() : currentVendor.storeDescription,
        country: country ? String(country).trim() : currentVendor.country,
        city: city ? String(city).trim() : currentVendor.city,
        phone: phone ? String(phone).trim() : currentVendor.phone,
        whatsapp: whatsapp ? String(whatsapp).trim() : currentVendor.whatsapp,
        bankName: bankName ? String(bankName).trim() : currentVendor.bankName,
        bankAccount: bankAccount ? String(bankAccount).trim() : currentVendor.bankAccount,
        bankAccountName: bankAccountName ? String(bankAccountName).trim() : currentVendor.bankAccountName,
        status: currentVendor.status === "approved" ? "approved" : "pending",
        updatedAt: now,
      })
      .where(eq(vendors.id, currentVendor.id))
      .returning();

    const [existingApp] = await db
      .select({ id: vendorApplications.id })
      .from(vendorApplications)
      .where(eq(vendorApplications.email, currentVendor.email))
      .limit(1);

    if (existingApp) {
      await db
        .update(vendorApplications)
        .set({
          applicantName: currentVendor.contactName,
          storeName: trimmedStoreName,
          storeDescription: storeDescription ? String(storeDescription).trim() : "",
          productCategories: categoriesStr,
          country: country ? String(country).trim() : "",
          city: city ? String(city).trim() : "",
          phone: phone ? String(phone).trim() : "",
          whatsapp: whatsapp ? String(whatsapp).trim() : "",
          instagramUrl: instagramUrl ? String(instagramUrl).trim() : "",
          websiteUrl: websiteUrl ? String(websiteUrl).trim() : "",
          additionalInfo: additionalInfo ? String(additionalInfo).trim() : "",
          status: "pending",
        })
        .where(eq(vendorApplications.id, existingApp.id));
    } else {
      await db.insert(vendorApplications).values({
        id: crypto.randomUUID(),
        applicantName: currentVendor.contactName,
        email: currentVendor.email,
        phone: phone ? String(phone).trim() : "",
        whatsapp: whatsapp ? String(whatsapp).trim() : "",
        storeName: trimmedStoreName,
        storeDescription: storeDescription ? String(storeDescription).trim() : "",
        productCategories: categoriesStr,
        country: country ? String(country).trim() : "",
        city: city ? String(city).trim() : "",
        instagramUrl: instagramUrl ? String(instagramUrl).trim() : "",
        websiteUrl: websiteUrl ? String(websiteUrl).trim() : "",
        additionalInfo: additionalInfo ? String(additionalInfo).trim() : "",
        status: "pending",
        adminNote: "",
        createdAt: now,
      });
    }

    try {
      const emailMod = await import("@/lib/email");
      if (typeof emailMod.sendAdminNewVendorApplicationEmail === "function") {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";
        emailMod.sendAdminNewVendorApplicationEmail(adminEmail, {
          applicantName: currentVendor.contactName || "Vendor",
          email: currentVendor.email,
          phone: phone ? String(phone).trim() : currentVendor.phone || "",
          storeName: trimmedStoreName,
          storeDescription: storeDescription ? String(storeDescription).trim() : currentVendor.storeDescription || "",
          country: country ? String(country).trim() : currentVendor.country || "NG",
          city: city ? String(city).trim() : currentVendor.city || "",
          categories: categoriesArr,
          instagramUrl: instagramUrl ? String(instagramUrl).trim() : undefined,
          websiteUrl: websiteUrl ? String(websiteUrl).trim() : undefined,
        }).catch((e: unknown) => console.error("Admin vendor email error:", e));
      }
    } catch (err) {
      console.error("Non-fatal email error:", err);
    }

    return NextResponse.json({
      success: true,
      vendor: {
        id: updatedVendor.id,
        storeName: updatedVendor.storeName,
        storeSlug: updatedVendor.storeSlug,
        status: updatedVendor.status,
      },
    });
  } catch (error: any) {
    console.error("Vendor onboarding error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
