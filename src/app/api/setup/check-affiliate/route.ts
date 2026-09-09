import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateApplications } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashAffiliatePassword } from "@/lib/affiliate-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAffiliateTablesExist();

    const emails = [
      "komlaimelebon@gmail.com",
      "ko.mlaimelebon@gmail.com",
      "aimelebon@gmail.com",
    ];

    const existing = await db.select().from(affiliates);
    const apps = await db.select().from(affiliateApplications);

    const found = existing.find((a) =>
      emails.includes((a.email || "").toLowerCase().trim())
    );

    const tempPassword = "Affiliate@2026";
    const passHash = await hashAffiliatePassword(tempPassword);

    let account;
    if (!found) {
      const [created] = await db
        .insert(affiliates)
        .values({
          email: "komlaimelebon@gmail.com",
          passwordHash: passHash,
          name: "Aime Komlan",
          code: "NDZ-KOM-01",
          status: "approved",
          commissionRate: "50.00",
          mustChangePassword: false,
          approvedAt: new Date(),
        })
        .returning();
      account = created;
    } else {
      const [updated] = await db
        .update(affiliates)
        .set({
          status: "approved",
          passwordHash: passHash,
          mustChangePassword: false,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(affiliates.id, found.id))
        .returning();
      account = updated;
    }

    return NextResponse.json({
      success: true,
      affiliatesInDb: existing.length,
      applicationsInDb: apps.length,
      account: {
        id: account.id,
        email: account.email,
        code: account.code,
        status: account.status,
      },
      loginWith: {
        email: account.email,
        password: tempPassword,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}