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

    const cleanCode = code.trim().toLowerCase();

    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(sql`LOWER(${affiliates.code})`, cleanCode))
      .limit(1);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid affiliate code" },
        { status: 404 }
      );
    }

    if (affiliate.status === "suspended" || affiliate.status === "rejected") {
      return NextResponse.json(
        { error: "Inactive affiliate code" },
        { status: 403 }
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

    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const res = NextResponse.json({
      success: true,
      code: affiliate.code,
    });

    // CRITICAL FIX: Explicitly set Path=/ so cookie is accessible across the whole site during checkout
    res.cookies.set("ndz_affiliate", affiliate.code, {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Affiliate track error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
