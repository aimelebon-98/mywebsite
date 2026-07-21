import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const LOCALES = ["en", "fr"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, static files, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Fetch custom admin path from settings
  let customAdminPath = "admin";
  try {
    const settingsUrl = new URL("/api/settings", request.url);
    const res = await fetch(settingsUrl.toString(), {
      headers: { "x-internal": "middleware" },
    });
    if (res.ok) {
      const settings = await res.json();
      customAdminPath = (settings.adminPath || "admin").toLowerCase().trim();
    }
  } catch (error) {
    console.error("Middleware settings fetch error:", error);
  }

  const hasCustomPath = customAdminPath && customAdminPath !== "admin";

  // Parse path segments, detect locale prefix
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() || "";
  const isLocalePrefixed = LOCALES.includes(firstSegment);
  const effectiveSegments = isLocalePrefixed ? segments.slice(1) : segments;
  const effectiveFirstSegment = effectiveSegments[0]?.toLowerCase() || "";

  // Block /admin, /en/admin, /fr/admin when custom path is set - return 404
  if (effectiveFirstSegment === "admin") {
    const isRewrite = request.headers.get("x-admin-rewrite") === "true";
    if (hasCustomPath && !isRewrite) {
      return new NextResponse("Not Found", { status: 404 });
    }
    // If no custom path OR this is our internal rewrite, allow through
    if (isLocalePrefixed) {
      // Strip locale prefix so /en/admin actually loads /admin
      const url = request.nextUrl.clone();
      url.pathname = "/" + effectiveSegments.join("/");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Handle custom admin path - single segment (with or without locale prefix)
  // e.g. /jevw, /en/jevw, /fr/jevw all rewrite to /admin
  if (hasCustomPath && effectiveSegments.length === 1 && effectiveFirstSegment === customAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    const response = NextResponse.rewrite(url);
    response.headers.set("x-admin-rewrite", "true");
    return response;
  }

  // Everything else -> next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
