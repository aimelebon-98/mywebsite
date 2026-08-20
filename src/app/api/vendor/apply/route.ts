import { NextResponse } from "next/server";
import { db } from "@/db";
import { vendorApplications, vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendVendorApplicationReceivedEmail, sendAdminNewVendorApplicationEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";

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
      turnstileToken,
    } = body;

    if (!applicantName || !email || !storeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const h = await headers();
    const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "";

    // Verify Turnstile before touching DB or sending emails
    const captchaOk = await verifyTurnstile(turnstileToken || "", ip);
    if (!captchaOk) {
      return NextResponse.json({ error: "Security verification failed. Please refresh and try again." }, { status: 403 });
    }

    const emailNorm = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const [existingVendor] = await db.select().from(vendors).where(eq(vendors.email, emailNorm)).limit(1);
    if (existingVendor) {
      return NextResponse.json({ error: "You are already registered as a vendor with this email." }, { status: 409 });
    }

    const [existingApp] = await db.select().from(vendorApplications)
      .where(eq(vendorApplications.email, emailNorm))
      .limit(1);

    if (existingApp && existingApp.status === "pending") {
      return NextResponse.json({ error: "You already have a pending application. We'll review it soon." }, { status: 409 });
    }

    const cats: string[] = Array.isArray(productCategories) ? productCategories : [];
    const categoriesJson = JSON.stringify(cats);

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

    const lang = locale === "fr" ? "fr" : "en";

    sendVendorApplicationReceivedEmail(emailNorm, applicantName, storeName, lang)
      .then(ok => console.log("[Vendor Apply] Applicant email sent:", ok))
      .catch(e => console.error("[Vendor Apply] Applicant email failed:", e));

    sendAdminNewVendorApplicationEmail(ADMIN_EMAIL, {
      applicantName,
      email: emailNorm,
      phone: phone || "",
      storeName,
      storeDescription: storeDescription || "",
      country: country || "NG",
      city: city || "",
      categories: cats,
      instagramUrl: instagramUrl || "",
      websiteUrl: websiteUrl || "",
    })
      .then(ok => console.log("[Vendor Apply] Admin email sent to " + ADMIN_EMAIL + ":", ok))
      .catch(e => console.error("[Vendor Apply] Admin email failed:", e));

    return NextResponse.json({ success: true, message: "Application submitted" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}