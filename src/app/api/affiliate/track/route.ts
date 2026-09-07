import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates, affiliateClicks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("ref");
    if (!code) {
      return NextResponse.json(
        { error: "No ref code provided" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.code, cleanCode))
      .limit(1);

    if (!affiliate || affiliate.status !== "approved") {
      return NextResponse.json(
        { error: "Invalid or inactive affiliate code" },
        { status: 404 }
      );
    }

    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ua = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    const country = request.headers.get("cf-ipcountry") || "";

    await db.insert(affiliateClicks).values({
      affiliateId: affiliate.id,
      ipAddress: ip,
      userAgent: ua,
      refererUrl: referer,
      landingUrl: request.nextUrl.pathname || "/",
      country,
    });

    await db
      .update(affiliates)
      .set({ totalClicks: sql`${affiliates.totalClicks} + 1` })
      .where(eq(affiliates.id, affiliate.id));

    const maxAge = 30 * 24 * 60 * 60;
    const response = NextResponse.json({
      success: true,
      code: affiliate.code,
    });
    response.headers.set(
      "Set-Cookie",
      `ndz_affiliate=${encodeURIComponent(affiliate.code)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
    );

    return response;
  } catch (error) {
    console.error("Affiliate track error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}