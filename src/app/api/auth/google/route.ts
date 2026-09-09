import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_not_configured`, req.nextUrl.origin));
  }
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ locale })).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "online");
  return NextResponse.redirect(url);
}