import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import { hashAffiliatePassword } from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureAffiliateTablesExist();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.resetToken, String(token)))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    if (
      !affiliate.resetTokenExpiresAt ||
      new Date(affiliate.resetTokenExpiresAt) < new Date()
    ) {
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await hashAffiliatePassword(String(password));

    await db
      .update(affiliates)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Affiliate reset-password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}