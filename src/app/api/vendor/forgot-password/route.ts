import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendVendorPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

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
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const locale = body.locale === "fr" ? "fr" : "en";

    const ok = NextResponse.json({
      success: true,
      message:
        locale === "fr"
          ? "Si un compte existe avec cet e-mail, vous recevrez un lien de reinitialisation."
          : "If an account exists with that email, you will receive a reset link.",
    });

    if (!email || !email.includes("@")) {
      return ok;
    }

    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.email, email))
      .limit(1);

    if (!vendor) {
      return ok;
    }

    if (vendor.status === "suspended" || vendor.status === "rejected") {
      return ok;
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(vendors)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendor.id));

    const name = vendor.contactName || vendor.storeName || "Vendor";
    await sendVendorPasswordResetEmail(vendor.email, name, token, locale);

    return ok;
  } catch (error) {
    console.error("Vendor forgot-password error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}