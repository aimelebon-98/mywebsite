import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateApplications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { hashAffiliatePassword, generateAffiliateCode } from "@/lib/affiliate-auth";
import { sendAffiliateApprovedEmail, sendAffiliateRejectedEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const list = await db.select().from(affiliateApplications).orderBy(desc(affiliateApplications.createdAt));
    return NextResponse.json({ success: true, applications: list });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await request.json();
    const { applicationId, applicationIds, action, adminNote, commissionRate = "5.00", locale = "en" } = body;

    const ids: string[] = Array.isArray(applicationIds)
      ? applicationIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
      : applicationId
      ? [String(applicationId)]
      : [];

    if (ids.length === 0 || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let processed = 0;

    for (const appId of ids) {
      const [app] = await db.select().from(affiliateApplications).where(eq(affiliateApplications.id, appId)).limit(1);
      if (!app) continue;

      if (action === "approve") {
        const [existingAff] = await db.select().from(affiliates).where(eq(affiliates.email, app.email)).limit(1);
        let code: string;

        if (existingAff) {
          await db.update(affiliates).set({
            status: "approved",
            commissionRate: String(commissionRate),
            approvedAt: new Date(),
            adminNote: adminNote || null,
            name: app.applicantName || existingAff.name,
            updatedAt: new Date(),
          }).where(eq(affiliates.id, existingAff.id));
          code = existingAff.code;
        } else {
          let passwordHash = (app as any).passwordHash || null;
          let tempPassword: string | null = null;
          if (!passwordHash) {
            tempPassword = crypto.randomBytes(4).toString("hex");
            passwordHash = await hashAffiliatePassword(tempPassword);
          }
          code = generateAffiliateCode(app.applicantName);
          await db.insert(affiliates).values({
            email: app.email,
            passwordHash,
            name: app.applicantName,
            code,
            commissionRate: String(commissionRate),
            status: "approved",
            country: app.country,
            phone: app.phone,
            whatsapp: app.whatsapp,
            mustChangePassword: !!tempPassword,
            adminNote: adminNote || null,
            approvedAt: new Date(),
          });
          sendAffiliateApprovedEmail(app.email, app.applicantName, code, tempPassword || "(existing password)", String(commissionRate), locale).catch(()=>{});
        }
        await db.update(affiliateApplications).set({ status: "approved", reviewedAt: new Date(), adminNote: adminNote || null }).where(eq(affiliateApplications.id, appId));
      } else {
        await db.update(affiliateApplications).set({ status: "rejected", reviewedAt: new Date(), adminNote: adminNote || null }).where(eq(affiliateApplications.id, appId));
        await db.update(affiliates).set({ status: "rejected", adminNote: adminNote || null, updatedAt: new Date() }).where(eq(affiliates.email, app.email));
        sendAffiliateRejectedEmail(app.email, app.applicantName, adminNote || undefined, locale).catch(()=>{});
      }
      processed++;
    }

    return NextResponse.json({
      success: true,
      message: ids.length > 1 ? `Processed ${processed} applications` : (action === "approve" ? "Approved" : "Rejected"),
      processed,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}