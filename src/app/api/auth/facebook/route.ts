import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const appId = process.env.FACEBOOK_CLIENT_ID;
  if (!appId) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_not_configured`, req.nextUrl.origin));
  }
  const redirectUri = `${req.nextUrl.origin}/api/auth/facebook/callback`;
  const state = Buffer.from(JSON.stringify({ locale })).toString("base64url");
  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  return NextResponse.redirect(url);
}