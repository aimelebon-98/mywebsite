import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { hashVendorPassword } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

async function ensureResetColumns() {
  try {
    await db.execute(sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS password_reset_token text`);
    await db.execute(sql`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS password_reset_expires timestamp`);
  } catch (e) {
    console.error("ensureResetColumns:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureResetColumns();

    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const locale = body.locale === "fr" ? "fr" : "en";

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: locale === "fr" ? "Lien invalide." : "Invalid reset link.",
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            locale === "fr"
              ? "Le mot de passe doit contenir au moins 8 caracteres."
              : "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(
        and(
          eq(vendors.passwordResetToken, token),
          gt(vendors.passwordResetExpires, now)
        )
      )
      .limit(1);

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error:
            locale === "fr"
              ? "Ce lien est invalide ou a expire. Demandez-en un nouveau."
              : "This link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashVendorPassword(password);

    await db
      .update(vendors)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendor.id));

    return NextResponse.json({
      success: true,
      message:
        locale === "fr"
          ? "Mot de passe mis a jour. Vous pouvez vous connecter."
          : "Password updated. You can now sign in.",
    });
  } catch (error) {
    console.error("Vendor reset-password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}