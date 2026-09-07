import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateApplications, affiliates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import { hashAffiliatePassword } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureAffiliateTablesExist();

    const body = await request.json();
    const {
      applicantName,
      email,
      password,
      phone,
      whatsapp,
      country,
      city,
      websiteUrl,
      socialMediaUrl,
      marketingPlan,
      locale = "en",
    } = body;

    if (!applicantName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const emailLower = String(email).toLowerCase().trim();
    const nameTrim = String(applicantName).trim();

    const existingAff = await db
      .select({ id: affiliates.id })
      .from(affiliates)
      .where(eq(affiliates.email, emailLower))
      .limit(1);

    if (existingAff.length) {
      return NextResponse.json(
        { error: "An affiliate account already exists for this email. Please log in." },
        { status: 409 }
      );
    }

    const existing = await db
      .select()
      .from(affiliateApplications)
      .where(
        and(
          eq(affiliateApplications.email, emailLower),
          eq(affiliateApplications.status, "pending")
        )
      )
      .limit(1);

    if (existing.length) {
      return NextResponse.json(
        { error: "You already have a pending application under review." },
        { status: 409 }
      );
    }

    const passwordHash = await hashAffiliatePassword(String(password));

    const [application] = await db
      .insert(affiliateApplications)
      .values({
        applicantName: nameTrim,
        email: emailLower,
        passwordHash,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        country: country?.trim() || null,
        city: city?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        socialMediaUrl: socialMediaUrl?.trim() || null,
        marketingPlan: marketingPlan?.trim() || null,
        status: "pending",
      })
      .returning();

    try {
      const emailMod = await import("@/lib/email");
      if (typeof emailMod.sendAffiliateApplicationReceivedEmail === "function") {
        emailMod
          .sendAffiliateApplicationReceivedEmail(emailLower, nameTrim, locale)
          .catch((err: unknown) => console.error("Applicant email error:", err));
      }
      if (typeof emailMod.sendAdminNewAffiliateApplicationEmail === "function") {
        const adminEmail =
          process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";
        emailMod
          .sendAdminNewAffiliateApplicationEmail(adminEmail, {
            applicantName: nameTrim,
            email: emailLower,
            phone: phone?.trim() || null,
            country: country?.trim() || null,
            websiteUrl: websiteUrl?.trim() || null,
            socialMediaUrl: socialMediaUrl?.trim() || null,
            marketingPlan: marketingPlan?.trim() || null,
          })
          .catch((err: unknown) =>
            console.error("Admin notification email error:", err)
          );
      }
    } catch (e) {
      console.error("Email notification error (non-fatal):", e);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted! We will review it within 24-48 hours.",
      applicationId: application.id,
    });
  } catch (error) {
    console.error("Affiliate application error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}