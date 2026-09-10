import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, vendorSessions, affiliates, affiliateSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashVendorPassword, generateUniqueStoreSlug } from "@/lib/vendor-auth";
import { generateAffiliateCode } from "@/lib/affiliate-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state") || "";

  let role = "vendor";
  let locale = "en";

  if (stateParam) {
    try {
      // Try raw JSON parse first
      const parsed = JSON.parse(stateParam);
      role = parsed.role || role;
      locale = parsed.locale || locale;
    } catch {
      try {
        // Try base64 decode if state was base64-encoded
        const decoded = Buffer.from(stateParam, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);
        role = parsed.role || role;
        locale = parsed.locale || locale;
      } catch {}
    }
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://www.newdealzone.com";

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/${role}/login?error=no_code`, req.url));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return NextResponse.redirect(new URL(`/${locale}/${role}/login?error=token_failed`, req.url));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    if (!user.email) {
      return NextResponse.redirect(new URL(`/${locale}/${role}/login?error=no_email`, req.url));
    }

    const emailLower = String(user.email).toLowerCase().trim();
    const now = new Date();

    if (role === "affiliate") {
      const existingAff = await db.select().from(affiliates).where(eq(affiliates.email, emailLower)).limit(1);
      let affId: string;
      if (existingAff.length > 0) {
        affId = existingAff[0].id;
      } else {
        affId = crypto.randomUUID();
        const fallbackName = user.name || emailLower.split("@")[0];
        const affCode = generateAffiliateCode(fallbackName);
        const tempHash = await hashVendorPassword(crypto.randomBytes(16).toString("hex"));
        await db.insert(affiliates).values({
          id: affId,
          email: emailLower,
          passwordHash: tempHash,
          name: fallbackName,
          code: affCode,
          status: "approved",
          commissionRate: "5.00",
          mustChangePassword: false,
          createdAt: now,
          updatedAt: now,
        });
      }

      const token = crypto.randomBytes(48).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.insert(affiliateSessions).values({
        id: crypto.randomUUID(),
        token,
        affiliateId: affId,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        expiresAt,
        createdAt: now,
      });

      const response = NextResponse.redirect(new URL(`/${locale}/affiliate/dashboard`, req.url));
      response.cookies.set("ndz_affiliate_session", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 2592000,
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    // Role == vendor
    const existing = await db.select().from(vendors).where(eq(vendors.email, emailLower)).limit(1);
    let vendorId: string;

    if (existing.length > 0) {
      vendorId = existing[0].id;
    } else {
      vendorId = crypto.randomUUID();
      const fallbackName = user.name || emailLower.split("@")[0];
      const storeName = `${fallbackName}'s Store`;
      const storeSlug = await generateUniqueStoreSlug(storeName);
      const tempHash = await hashVendorPassword(crypto.randomBytes(16).toString("hex"));

      await db.insert(vendors).values({
        id: vendorId,
        email: emailLower,
        passwordHash: tempHash,
        storeName,
        storeSlug,
        contactName: fallbackName,
        status: "incomplete",
        commissionRate: "10.00",
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(vendorSessions).values({
      id: crypto.randomUUID(),
      token,
      vendorId,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
      expiresAt,
      createdAt: now,
    });

    const response = NextResponse.redirect(new URL(`/${locale}/vendor/dashboard?setup=1`, req.url));
    response.cookies.set("ndz_vendor_session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 2592000,
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/${locale}/${role}/login?error=oauth_error`, req.url));
  }
}
