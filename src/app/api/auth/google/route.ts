import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel env vars." },
      { status: 501 }
    );
  }

  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const role = req.nextUrl.searchParams.get("role") || "vendor";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Encode state as base64 JSON
  const stateObj = JSON.stringify({ locale, role });
  const state = Buffer.from(stateObj).toString("base64");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
