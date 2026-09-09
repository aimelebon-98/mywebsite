import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyAffiliatePassword,
  createAffiliateSession,
} from "@/lib/affiliate-auth";
import { ensureAffiliateTablesExist } from "@/lib/ensure-affiliate-tables";

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

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.email, email.toLowerCase().trim()))
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
    // pending + approved can log in

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
      undefined;
    const ua = request.headers.get("user-agent") || undefined;

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
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}