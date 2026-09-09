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
    const redirectUri = `${req.nextUrl.origin}/api/auth/facebook/callback`;
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token");

    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${tokens.access_token}`
    );
    const user = await userRes.json();
    if (!user.email) throw new Error("No email from Facebook");

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
    console.error("Facebook OAuth error:", err);
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_failed`, req.nextUrl.origin));
  }
}