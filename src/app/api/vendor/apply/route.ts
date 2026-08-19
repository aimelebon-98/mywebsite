import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorApplications, vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendVendorApplicationReceivedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      applicantName,
      email,
      phone,
      whatsapp,
      storeName,
      storeDescription,
      productCategories,
      country,
      city,
      instagramUrl,
      websiteUrl,
      additionalInfo,
      locale,
    } = body;

    if (!applicantName || !email || !storeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailNorm = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if already a vendor
    const [existingVendor] = await db.select().from(vendors).where(eq(vendors.email, emailNorm)).limit(1);
    if (existingVendor) {
      return NextResponse.json({ error: "You are already registered as a vendor with this email." }, { status: 409 });
    }

    // Check for existing pending application
    const [existingApp] = await db.select().from(vendorApplications)
      .where(eq(vendorApplications.email, emailNorm))
      .limit(1);

    if (existingApp && existingApp.status === "pending") {
      return NextResponse.json({ error: "You already have a pending application. We'll review it soon." }, { status: 409 });
    }

    const categoriesJson = Array.isArray(productCategories)
      ? JSON.stringify(productCategories)
      : "[]";

    await db.insert(vendorApplications).values({
      applicantName: String(applicantName).slice(0, 100),
      email: emailNorm.slice(0, 100),
      phone: String(phone || "").slice(0, 30),
      whatsapp: String(whatsapp || "").slice(0, 30),
      storeName: String(storeName).slice(0, 100),
      storeDescription: String(storeDescription || "").slice(0, 2000),
      productCategories: categoriesJson,
      country: String(country || "NG").slice(0, 5),
      city: String(city || "").slice(0, 60),
      instagramUrl: String(instagramUrl || "").slice(0, 200),
      websiteUrl: String(websiteUrl || "").slice(0, 200),
      additionalInfo: String(additionalInfo || "").slice(0, 2000),
    });

    // Send auto-reply email (non-blocking)
    const lang = locale === "fr" ? "fr" : "en";
    sendVendorApplicationReceivedEmail(emailNorm, applicantName, storeName, lang).catch(() => {});

    return NextResponse.json({ success: true, message: "Application submitted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}