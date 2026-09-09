import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireVendor } from "@/lib/vendor-auth";
import { sendVendorApplicationReceivedEmail, sendAdminNewVendorApplicationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const vendor = await requireVendor();
    if (vendor.status !== "incomplete") {
      return NextResponse.json({ error: "Already submitted." }, { status: 400 });
    }

    const body = await req.json();
    const {
      storeName, storeDescription, productCategories,
      country, city, phone, whatsapp, instagramUrl, websiteUrl
    } = body;

    const catsJson = JSON.stringify(Array.isArray(productCategories) ? productCategories : []);

    // Update Vendor to 'pending'
    await db.update(vendors).set({
      storeName: storeName || vendor.storeName,
      storeDescription: storeDescription || "",
      country: country || "NG",
      city: city || "",
      phone: phone || "",
      whatsapp: whatsapp || "",
      status: "pending",
      updatedAt: new Date()
    }).where(eq(vendors.id, vendor.id));

    // Create Application for Admin to review
    await db.insert(vendorApplications).values({
      applicantName: vendor.contactName,
      email: vendor.email,
      phone: phone || "",
      whatsapp: whatsapp || "",
      storeName: storeName || vendor.storeName,
      storeDescription: storeDescription || "",
      productCategories: catsJson,
      country: country || "NG",
      city: city || "",
      instagramUrl: instagramUrl || "",
      websiteUrl: websiteUrl || "",
      status: "pending"
    });

    // Send emails
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";
    sendVendorApplicationReceivedEmail(vendor.email, vendor.contactName, storeName, "en").catch(()=>{});
    sendAdminNewVendorApplicationEmail(adminEmail, {
      applicantName: vendor.contactName,
      email: vendor.email,
      phone: phone || "",
      storeName: storeName || vendor.storeName,
      storeDescription: storeDescription || "",
      country: country || "NG",
      city: city || "",
      categories: Array.isArray(productCategories) ? productCategories : [],
      instagramUrl: instagramUrl || "",
      websiteUrl: websiteUrl || "",
    }).catch(()=>{});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}