import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  requireAffiliate,
  verifyAffiliatePassword,
  hashAffiliatePassword,
} from "@/lib/affiliate-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const affiliate = await requireAffiliate();
  if (affiliate instanceof NextResponse) return affiliate;

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (!affiliate.mustChangePassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }
      const valid = await verifyAffiliatePassword(
        currentPassword,
        affiliate.passwordHash
      );
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    const newHash = await hashAffiliatePassword(newPassword);

    await db
      .update(affiliates)
      .set({
        passwordHash: newHash,
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(affiliates.id, affiliate.id));

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Affiliate password change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}