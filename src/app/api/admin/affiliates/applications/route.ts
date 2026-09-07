import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateApplications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import {
  hashAffiliatePassword,
  generateAffiliateCode,
} from "@/lib/affiliate-auth";
import {
  sendAffiliateApprovedEmail,
  sendAffiliateRejectedEmail,
} from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET: List all affiliate applications
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const list = await db
      .select()
      .from(affiliateApplications)
      .orderBy(desc(affiliateApplications.createdAt));

    return NextResponse.json({ success: true, applications: list });
  } catch (error) {
    console.error("Admin fetch affiliate applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Approve or Reject an application
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { applicationId, action, adminNote, commissionRate = "5.00", locale = "en" } = body;

    if (!applicationId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "applicationId and valid action (approve/reject) are required" },
        { status: 400 }
      );
    }

    const [app] = await db
      .select()
      .from(affiliateApplications)
      .where(eq(affiliateApplications.id, applicationId))
      .limit(1);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Generate temporary password (8 chars)
      const tempPassword = crypto.randomBytes(4).toString("hex");
      const passwordHash = await hashAffiliatePassword(tempPassword);

      // Generate unique referral code
      let code = generateAffiliateCode(app.applicantName);
      let attempts = 0;
      while (attempts < 5) {
        const existing = await db
          .select({ id: affiliates.id })
          .from(affiliates)
          .where(eq(affiliates.code, code))
          .limit(1);
        if (!existing.length) break;
        code = generateAffiliateCode(app.applicantName);
        attempts++;
      }

      // Create affiliate account
      const [newAffiliate] = await db
        .insert(affiliates)
        .values({
          email: app.email,
          passwordHash,
          name: app.applicantName,
          code,
          commissionRate: String(commissionRate),
          status: "approved",
          country: app.country,
          city: app.city,
          phone: app.phone,
          whatsapp: app.whatsapp,
          mustChangePassword: true,
          adminNote: adminNote || null,
          approvedAt: new Date(),
        })
        .returning();

      // Update application status
      await db
        .update(affiliateApplications)
        .set({
          status: "approved",
          reviewedAt: new Date(),
          adminNote: adminNote || null,
        })
        .where(eq(affiliateApplications.id, applicationId));

      // Send approval email with login credentials
      sendAffiliateApprovedEmail(
        app.email,
        app.applicantName,
        code,
        tempPassword,
        String(commissionRate),
        locale
      ).catch((err) => console.error("Affiliate approved email error:", err));

      return NextResponse.json({
        success: true,
        message: "Affiliate approved and credentials sent",
        affiliate: {
          id: newAffiliate.id,
          name: newAffiliate.name,
          email: newAffiliate.email,
          code: newAffiliate.code,
        },
      });
    } else {
      // Reject application
      await db
        .update(affiliateApplications)
        .set({
          status: "rejected",
          reviewedAt: new Date(),
          adminNote: adminNote || null,
        })
        .where(eq(affiliateApplications.id, applicationId));

      // Send rejection email
      sendAffiliateRejectedEmail(
        app.email,
        app.applicantName,
        adminNote || undefined,
        locale
      ).catch((err) => console.error("Affiliate rejected email error:", err));

      return NextResponse.json({
        success: true,
        message: "Application marked as rejected",
      });
    }
  } catch (error) {
    console.error("Admin review affiliate application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}