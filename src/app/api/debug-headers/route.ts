import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Try external lookup right here to see if it works from Vercel
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const ip = forwardedFor.split(",")[0].trim() || realIp;

  let externalResult: unknown = null;
  let externalError: string | null = null;
  if (ip) {
    try {
      const r = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,country,isp,org`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      externalResult = await r.json();
    } catch (e) {
      externalError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    detectedIp: ip,
    vercelIpCountry: req.headers.get("x-vercel-ip-country"),
    cfIpCountry: req.headers.get("cf-ipcountry"),
    externalResult,
    externalError,
    allHeaders: headers,
  });
}