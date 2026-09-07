import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { affiliateSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("ndz_affiliate_session")?.value;

    if (token) {
      await db
        .delete(affiliateSessions)
        .where(eq(affiliateSessions.token, token));
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("ndz_affiliate_session");
    return response;
  } catch (error) {
    console.error("Affiliate logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}