import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, customerSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state") || "";
  let locale = "en";
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    locale = decoded.locale || "en";
  } catch { /* default en */ }

  if (!code) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_failed`, req.nextUrl.origin));
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token");

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json();
    if (!user.email) throw new Error("No email from Google");

    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, user.email))
      .limit(1);

    if (!customer) {
      [customer] = await db
        .insert(customers)
        .values({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          password: crypto.randomBytes(32).toString("hex"),
          emailVerified: true,
        })
        .returning();
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    await db.insert(customerSessions).values({
      token: sessionToken,
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.redirect(new URL(`/${locale}/`, req.nextUrl.origin));
    response.cookies.set("ndz_customer_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_failed`, req.nextUrl.origin));
  }
}