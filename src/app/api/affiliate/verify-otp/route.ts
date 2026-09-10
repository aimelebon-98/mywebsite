import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createAffiliateSession } from "@/lib/affiliate-auth";
import { verifyTOTPCode } from "@/lib/totp";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { affiliateId, code, method } = await request.json();

    if (!affiliateId || !code) {
      return NextResponse.json({ error: "Missing verification code" }, { status: 400 });
    }

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, affiliateId))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate account not found" }, { status: 404 });
    }

    // Google TOTP verification
    if (method === "totp") {
      const isValid = verifyTOTPCode((affiliate as any).totpSecret || "", String(code));
      if (!isValid) {
        return NextResponse.json({ error: "Invalid Google Authenticator code" }, { status: 400 });
      }
    } else {
      // Email OTP verification
      const storedOtp = (affiliate as any).loginOtpCode;
      const expiresAt = (affiliate as any).loginOtpExpiresAt;

      if (!storedOtp || String(storedOtp).trim() !== String(code).trim()) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }

      if (expiresAt && new Date(expiresAt) < new Date()) {
        return NextResponse.json({ error: "Verification code expired. Please log in again." }, { status: 400 });
      }

      // Clear OTP code
      await db
        .update(affiliates)
        .set({ loginOtpCode: null, loginOtpExpiresAt: null } as any)
        .where(eq(affiliates.id, affiliate.id));
    }

    // Add device to trusted list
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown_ip";

    const ua = request.headers.get("user-agent") || "unknown_ua";
    const deviceFingerprint = `${ip}_${crypto.createHash("md5").update(ua).digest("hex").slice(0, 8)}`;

    let trustedDevices: string[] = [];
    try {
      trustedDevices = JSON.parse((affiliate as any).trustedDevices || "[]");
    } catch {}

    if (!trustedDevices.includes(deviceFingerprint)) {
      trustedDevices.push(deviceFingerprint);
      await db
        .update(affiliates)
        .set({ trustedDevices: JSON.stringify(trustedDevices.slice(-10)) } as any)
        .where(eq(affiliates.id, affiliate.id));
    }

    // Create Session
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
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}