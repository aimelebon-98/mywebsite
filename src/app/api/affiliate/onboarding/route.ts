import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateApplications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAffiliate } from "@/lib/affiliate-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const affiliate = await requireAffiliate();
    if (affiliate instanceof NextResponse) return affiliate;

    const body = await req.json();
    const {
      phone,
      whatsapp,
      country,
      city,
      bankName,
      bankAccount,
      bankAccountName,
      websiteUrl,
      socialMediaUrl,
      marketingPlan,
    } = body;

    const now = new Date();

    // AFFILIATE IS INSTANTLY APPROVED UPON COMPLETING WIZARD
    const [updated] = await db
      .update(affiliates)
      .set({
        phone: phone ? String(phone).trim() : affiliate.phone,
        whatsapp: whatsapp ? String(whatsapp).trim() : affiliate.whatsapp,
        country: country ? String(country).trim() : affiliate.country,
        city: city ? String(city).trim() : affiliate.city,
        bankName: bankName ? String(bankName).trim() : affiliate.bankName,
        bankAccount: bankAccount ? String(bankAccount).trim() : affiliate.bankAccount,
        bankAccountName: bankAccountName ? String(bankAccountName).trim() : affiliate.bankAccountName,
        status: "approved",
        approvedAt: affiliate.approvedAt || now,
        updatedAt: now,
      })
      .where(eq(affiliates.id, affiliate.id))
      .returning();

    const [existingApp] = await db
      .select({ id: affiliateApplications.id })
      .from(affiliateApplications)
      .where(eq(affiliateApplications.email, affiliate.email))
      .limit(1);

    if (existingApp) {
      await db
        .update(affiliateApplications)
        .set({
          applicantName: affiliate.name,
          email: affiliate.email,
          phone: phone ? String(phone).trim() : null,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          country: country ? String(country).trim() : null,
          city: city ? String(city).trim() : null,
          websiteUrl: websiteUrl ? String(websiteUrl).trim() : null,
          socialMediaUrl: socialMediaUrl ? String(socialMediaUrl).trim() : null,
          marketingPlan: marketingPlan ? String(marketingPlan).trim() : null,
          status: "approved",
          reviewedAt: now,
          adminNote: "Auto-approved upon completing wizard",
        })
        .where(eq(affiliateApplications.id, existingApp.id));
    } else {
      await db.insert(affiliateApplications).values({
        id: crypto.randomUUID(),
        applicantName: affiliate.name,
        email: affiliate.email,
        phone: phone ? String(phone).trim() : null,
        whatsapp: whatsapp ? String(whatsapp).trim() : null,
        country: country ? String(country).trim() : null,
        city: city ? String(city).trim() : null,
        websiteUrl: websiteUrl ? String(websiteUrl).trim() : null,
        socialMediaUrl: socialMediaUrl ? String(socialMediaUrl).trim() : null,
        marketingPlan: marketingPlan ? String(marketingPlan).trim() : null,
        status: "approved",
        reviewedAt: now,
        adminNote: "Auto-approved upon completing wizard",
        createdAt: now,
      });
    }

    try {
      const emailMod = await import("@/lib/email");
      if (typeof emailMod.sendAdminNewAffiliateApplicationEmail === "function") {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "komlaimelebon@gmail.com";
        emailMod.sendAdminNewAffiliateApplicationEmail(adminEmail, {
          applicantName: affiliate.name,
          email: affiliate.email,
          phone: phone || null,
          country: country || null,
          websiteUrl: websiteUrl || null,
          socialMediaUrl: socialMediaUrl || null,
          marketingPlan: marketingPlan || null,
        }).catch((e: unknown) => console.error("Admin affiliate email error:", e));
      }
    } catch (e) {
      console.error("Non-fatal email error:", e);
    }

    return NextResponse.json({
      success: true,
      affiliate: {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        status: updated.status,
      },
    });
  } catch (err: any) {
    console.error("Affiliate onboarding error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
