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

  // Parse segments and detect locale prefix
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() || "";
  const isLocalePrefixed = LOCALES.includes(firstSegment);
  const effectiveSegments = isLocalePrefixed ? segments.slice(1) : segments;
  const effectiveFirstSegment = effectiveSegments[0]?.toLowerCase() || "";

  // Case 1: Someone tries /admin, /en/admin, or /fr/admin directly
  if (effectiveFirstSegment === "admin") {
    const isRewrite = request.headers.get("x-admin-rewrite") === "true";

    // If custom path is set AND this isn't our internal rewrite -> 404
    if (hasCustomPath && !isRewrite) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // No custom path (default admin) OR internal rewrite - allow
    // If locale-prefixed, rewrite to strip the locale
    if (isLocalePrefixed) {
      const url = request.nextUrl.clone();
      url.pathname = "/" + effectiveSegments.join("/");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Case 2: User hits the custom admin path (with or without locale prefix)
  // e.g. /jevw, /en/jevw, /fr/jevw -> rewrite to /admin
  if (hasCustomPath && effectiveSegments.length === 1 && effectiveFirstSegment === customAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    const response = NextResponse.rewrite(url);
    response.headers.set("x-admin-rewrite", "true");
    return response;
  }

  // Case 3: Everything else -> next-intl handles locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
