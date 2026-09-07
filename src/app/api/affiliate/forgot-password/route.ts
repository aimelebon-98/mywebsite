import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureAffiliateTablesExist();
    const { email, locale = "en" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailLower = String(email).toLowerCase().trim();
    const generic = {
      success: true,
      message:
        "If an affiliate account exists for this email, a reset link has been sent.",
    };

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.email, emailLower))
      .limit(1);

    if (!affiliate || affiliate.status !== "approved") {
      return NextResponse.json(generic);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(affiliates)
      .set({
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    try {
      const emailMod = await import("@/lib/email");
      if (typeof emailMod.sendAffiliatePasswordResetEmail === "function") {
        await emailMod.sendAffiliatePasswordResetEmail(
          affiliate.email,
          affiliate.name,
          token,
          locale === "fr" ? "fr" : "en"
        );
      }
    } catch (e) {
      console.error("Affiliate reset email error:", e);
    }

    return NextResponse.json(generic);
  } catch (error) {
    console.error("Affiliate forgot-password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}