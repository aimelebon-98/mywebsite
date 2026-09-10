import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateSessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  verifyAffiliatePassword,
  createAffiliateSession,
} from "@/lib/affiliate-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureAffiliateTablesExist();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.email, cleanEmail))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (affiliate.status === "rejected" || affiliate.status === "suspended") {
      return NextResponse.json(
        { error: "Your affiliate account is inactive or suspended." },
        { status: 403 }
      );
    }

    const isValid = await verifyAffiliatePassword(
      password,
      affiliate.passwordHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown_ip";

    const ua = request.headers.get("user-agent") || "unknown_ua";
    const deviceFingerprint = `${ip}_${crypto.createHash("md5").update(ua).digest("hex").slice(0, 8)}`;

    // CHECK IF GOOGLE 2FA IS ENABLED
    if ((affiliate as any).totpEnabled && (affiliate as any).totpSecret) {
      return NextResponse.json({
        requires2FA: true,
        method: "totp",
        affiliateId: affiliate.id,
        email: cleanEmail,
      });
    }

    // CHECK IF DEVICE OR IP IS NEW (REQUIRE EMAIL OTP)
    let trustedDevices: string[] = [];
    try {
      trustedDevices = JSON.parse((affiliate as any).trustedDevices || "[]");
    } catch {}

    const isRecognizedDevice = trustedDevices.includes(deviceFingerprint);

    if (!isRecognizedDevice) {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db
        .update(affiliates)
        .set({
          loginOtpCode: otpCode,
          loginOtpExpiresAt: expiresAt,
        } as any)
        .where(eq(affiliates.id, affiliate.id));

      // Send OTP Email
      try {
        const emailMod = await import("@/lib/email");
        if (typeof (emailMod as any).sendAffiliateLoginOtpEmail === "function") {
          await (emailMod as any).sendAffiliateLoginOtpEmail(
            cleanEmail,
            affiliate.name,
            otpCode,
            `${ip} (${ua.slice(0, 30)}...)`
          );
        }
      } catch (e) {
        console.error("Failed to send OTP email:", e);
      }

      return NextResponse.json({
        requires2FA: true,
        method: "email_otp",
        affiliateId: affiliate.id,
        email: cleanEmail,
      });
    }

    // REGULAR LOGIN
    const { token, expiresAt, cookieName } = await createAffiliateSession(
      affiliate.id,
      ip,
      ua
    );

    const response = NextResponse.json({
      success: true,
      mustChangePassword: affiliate.mustChangePassword,
    });

    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Affiliate login error:", error);
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}