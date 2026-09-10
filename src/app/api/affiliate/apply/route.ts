import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateApplications, affiliates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";
import {
  hashAffiliatePassword,
  createAffiliateSession,
  generateAffiliateCode,
} from "@/lib/affiliate-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensureAffiliateTablesExist();

    const body = await request.json();
    const {
      applicantName,
      email,
      password,
      phone,
      whatsapp,
      country,
      city,
      websiteUrl,
      socialMediaUrl,
      marketingPlan,
      locale = "en",
    } = body;

    if (!applicantName || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const emailLower = String(email).toLowerCase().trim();
    const nameTrim = String(applicantName).trim();
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";
    const ua = request.headers.get("user-agent") || "";

    const existingAff = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.email, emailLower))
      .limit(1);

    if (existingAff.length) {
      const aff = existingAff[0];
      const { token, expiresAt, cookieName } = await createAffiliateSession(
        aff.id,
        ip,
        ua
      );
      const res = NextResponse.json({
        success: true,
        pending: aff.status === "pending",
        message: "Welcome back!",
        redirectTo: "dashboard",
      });
      res.cookies.set({
        name: cookieName,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      });
      return res;
    }

    let plainPassword =
      typeof password === "string" && password.length >= 6
        ? String(password)
        : crypto.randomBytes(8).toString("hex");

    const passwordHash = await hashAffiliatePassword(plainPassword);

    let code = generateAffiliateCode(nameTrim);
    let attempts = 0;
    while (attempts < 5) {
      const dup = await db
        .select({ id: affiliates.id })
        .from(affiliates)
        .where(eq(affiliates.code, code))
        .limit(1);
      if (!dup.length) break;
      code = generateAffiliateCode(nameTrim);
      attempts++;
    }

    const [newAffiliate] = await db
      .insert(affiliates)
      .values({
        email: emailLower,
        passwordHash,
        name: nameTrim,
        code,
        commissionRate: "5.00",
        status: "incomplete",
        country: country?.trim() || null,
        city: city?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        mustChangePassword: false,
      })
      .returning();

    const { token, expiresAt, cookieName } = await createAffiliateSession(
      newAffiliate.id,
      ip,
      ua
    );

    const res = NextResponse.json({
      success: true,
      pending: false,
      redirectTo: "dashboard",
      affiliate: {
        id: newAffiliate.id,
        code: newAffiliate.code,
        status: "incomplete",
      },
    });

    res.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (error) {
    console.error("Affiliate application error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
