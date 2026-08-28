import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const LOCALES = ["en", "fr"];

// ============================================================
// API ACCESS CONTROL
// ============================================================
const PUBLIC_API_ROUTES = [
  "/api/ping",
  "/api/track",
  "/api/newsletter",
  "/api/wishlist",
  "/api/blog-comments",
  "/api/reviews",
  "/api/setup",
  "/api/health",
  "/api/settings",
  "/api/orders",
  "/api/products",
  "/api/blog",
  "/api/blog-categories",
  "/api/authors",
  "/api/categories",
  "/api/search-suggestions",
  "/api/product-faqs",
  "/api/bundles",
  "/api/exchange-rates",
  "/api/geo-currency",
  "/api/customer",
  "/api/fb-capi",
  "/api/catalog",
  "/api/indexnow",
  "/api/vendor",
  "/api/store",
];

const ADMIN_API_PREFIX = "/api/admin";

const WHITELIST_IPS = [
  "102.64.152.45",
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );
}

function isApiRequestAllowed(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const headers = request.headers;

  // Always allow /api/settings for internal middleware resolution
  if (pathname === "/api/settings") return true;

  // Admin routes handle their own auth via requireAdmin()
  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    // Unauthenticated admin auth/login endpoints must be accessible
    if (pathname === "/api/admin/login" || pathname === "/api/admin/auth") return true;
    const adminSession = request.cookies.get("admin_session")?.value;
    if (!adminSession) return false;
    return true;
  }

  if (isPublicApiRoute(pathname)) return true;
  const internalSecret = process.env.INTERNAL_API_SECRET || "ndz-internal-2024"; if (headers.get("x-internal") === internalSecret) return true;

  const cfIp = headers.get("cf-connecting-ip") || "";
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const realIp = headers.get("x-real-ip") || "";
  const clientIp = (cfIp || forwardedFor.split(",").pop()?.trim() || realIp).trim();

  const envIps = (process.env.API_WHITELIST_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
  const allWhitelistedIps = [...WHITELIST_IPS, ...envIps];
  if (clientIp && allWhitelistedIps.includes(clientIp)) return true;

  const referer = headers.get("referer") || "";
  const origin = headers.get("origin") || "";
  const host = headers.get("host") || "";

  if (host) {
    const cleanHost = host.replace(/^www\./, "");
    if (referer.includes(cleanHost)) return true;
    if (origin.includes(cleanHost)) return true;
  }

  const secFetchSite = headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. API ROUTES
  if (pathname.startsWith("/api")) {
    if (!isApiRequestAllowed(request)) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  // 2. Skip Next.js static files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Admin path routing
  let customAdminPath = "admin";
  try {
    const settingsUrl = new URL("/api/settings", request.url);
    const res = await fetch(settingsUrl.toString(), {
      headers: { "x-internal": process.env.INTERNAL_API_SECRET || "ndz-internal-2024" },
    });
    if (res.ok) {
      const settings = await res.json();
      if (settings.adminPath) {
        customAdminPath = String(settings.adminPath).toLowerCase().trim();
      }
    }
  } catch (error) {
    console.error("Middleware settings fetch error:", error);
  }

  const hasCustomPath = Boolean(customAdminPath && customAdminPath !== "admin");

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() || "";
  const isLocalePrefixed = LOCALES.includes(firstSegment);
  const effectiveSegments = isLocalePrefixed ? segments.slice(1) : segments;
  const effectiveFirstSegment = effectiveSegments[0]?.toLowerCase() || "";

  // Block default /admin route if custom admin path is active
  if (effectiveFirstSegment === "admin") {
    const isRewrite = request.headers.get("x-admin-rewrite") === "true";
    if (hasCustomPath && !isRewrite) {
      return new NextResponse("Not Found", { status: 404 });
    }
    if (isLocalePrefixed) {
      const url = request.nextUrl.clone();
      url.pathname = "/" + effectiveSegments.join("/");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Rewrite custom admin path (e.g. /jevw or /en/jevw) to /admin
  if (hasCustomPath && effectiveFirstSegment === customAdminPath) {
    const remainingSegments = effectiveSegments.slice(1);
    const url = request.nextUrl.clone();
    url.pathname = "/admin" + (remainingSegments.length > 0 ? "/" + remainingSegments.join("/") : "");
    const response = NextResponse.rewrite(url);
    response.headers.set("x-admin-rewrite", "true");
    return response;
  }

  // 4. Everything else - i18n routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};