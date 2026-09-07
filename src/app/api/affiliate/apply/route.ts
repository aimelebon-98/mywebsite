import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateApplications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  sendAffiliateApplicationReceivedEmail,
  sendAdminNewAffiliateApplicationEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicantName,
      email,
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

    const emailLower = email.toLowerCase().trim();

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
        { error: "You already have a pending application" },
        { status: 409 }
      );
    }

    const [application] = await db
      .insert(affiliateApplications)
      .values({
        applicantName: applicantName.trim(),
        email: emailLower,
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

    // Send confirmation email to applicant (non-blocking)
    sendAffiliateApplicationReceivedEmail(
      emailLower,
      applicantName.trim(),
      locale
    ).catch((err) => console.error("Applicant email error:", err));

    // Send notification to admin (non-blocking)
    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";
    sendAdminNewAffiliateApplicationEmail(adminEmail, {
      applicantName: applicantName.trim(),
      email: emailLower,
      phone: phone?.trim() || null,
      country: country?.trim() || null,
      websiteUrl: websiteUrl?.trim() || null,
      socialMediaUrl: socialMediaUrl?.trim() || null,
      marketingPlan: marketingPlan?.trim() || null,
    }).catch((err) => console.error("Admin notification email error:", err));

    return NextResponse.json({
      success: true,
      message:
        "Application submitted! We will review it within 24-48 hours.",
      applicationId: application.id,
    });
  } catch (error) {
    console.error("Affiliate application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}