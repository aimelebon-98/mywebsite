import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientId = process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Facebook OAuth not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in Vercel env vars." },
      { status: 501 }
    );
  }

  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const role = req.nextUrl.searchParams.get("role") || "vendor";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";
  const redirectUri = `${appUrl}/api/auth/facebook/callback`;

  // Encode state as base64 JSON
  const stateObj = JSON.stringify({ locale, role });
  const state = Buffer.from(stateObj).toString("base64");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email,public_profile",
    state,
  });

  return NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
}
