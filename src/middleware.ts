import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

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

  // Handle /admin - keep NON-localized (admin is not translated)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (hasCustomPath) {
      const isRewrite = request.headers.get("x-admin-rewrite") === "true";
      if (!isRewrite) {
        return new NextResponse("Not Found", { status: 404 });
      }
    }
    return NextResponse.next();
  }

  // Handle custom admin path (single-segment, non-localized)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    const firstSegment = segments[0].toLowerCase();
    // If matches custom admin path, rewrite to /admin (bypass i18n)
    if (hasCustomPath && firstSegment === customAdminPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      const response = NextResponse.rewrite(url);
      response.headers.set("x-admin-rewrite", "true");
      return response;
    }
  }

  // Everything else -> next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
