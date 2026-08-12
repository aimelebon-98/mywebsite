import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INDEXNOW_KEY = "14iofclgzm30a57jydbh2rwknsv6xepq";
const SITE_HOST = "www.newdealzone.com";
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

/**
 * POST /api/indexnow
 * Body: { urls: string[] } OR { url: string }
 *
 * Pings IndexNow (Bing, Yandex, Naver, Seznam, Yep) to notify of new/updated URLs.
 * Call this from any route that creates or updates published content.
 *
 * Example internal call:
 *   fetch("/api/indexnow", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ urls: ["https://www.newdealzone.com/en/blog/my-post"] })
 *   });
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let urls: string[] = [];

    if (Array.isArray(body.urls)) {
      urls = body.urls;
    } else if (typeof body.url === "string") {
      urls = [body.url];
    }

    urls = urls.filter((u) => typeof u === "string" && u.startsWith("http"));

    if (urls.length === 0) {
      return NextResponse.json({ error: "No valid urls provided" }, { status: 400 });
    }

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    };

    // Fire to IndexNow shared endpoint (all engines pick up)
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      submitted: urls.length,
      urls,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "IndexNow submission failed", details: String(err) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexnow?url=https://...
 * Convenience for manual testing.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({
      status: "IndexNow endpoint ready",
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      usage: "POST with { urls: [...] } or GET ?url=https://...",
    });
  }

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: [url],
  };

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ success: res.ok, status: res.status, url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}