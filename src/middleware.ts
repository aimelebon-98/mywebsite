import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const LOCALES = ["en", "fr"];

// ============================================================
// API ACCESS CONTROL
// ============================================================
// Public routes (allowed from anywhere - needed for forms, tracking, etc.)
const PUBLIC_API_ROUTES = [
  "/api/track",              // Analytics beacon
  "/api/newsletter",         // Newsletter subscribe (POST)
  "/api/wishlist",           // Wishlist toggle
  "/api/blog-comments",      // Comment submit + like
  "/api/reviews",            // Review submit
  "/api/setup",              // First-time setup
  "/api/health",             // Health check
  "/api/settings",           // Settings (used by middleware itself)
  "/api/orders",             // Order submit from cart
  // Public read-only endpoints (needed for public pages + language switcher)
  "/api/products",           // Product data (used by shop, quick view, language switcher)
  "/api/blog",               // Blog post data (used by blog pages, language switcher)
  "/api/blog-categories",    // Blog categories (public)
  "/api/authors",            // Author data
  "/api/categories",         // Product categories
  "/api/search-suggestions", // Search autocomplete
  "/api/product-faqs",       // Product FAQ display
  "/api/bundles",            // Bundle deals display
  "/api/exchange-rates",     // Currency conversion rates
  "/api/geo-currency",
  "/api/customer",       // Auto-detect currency by country
];

// Admin routes (own auth already applied - middleware just lets them through)
const ADMIN_API_PREFIX = "/api/admin";

// Whitelisted IPs (bypass all restrictions)
const WHITELIST_IPS = [
  "102.64.152.45",  // Your IP
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );
}

function isApiRequestAllowed(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const headers = request.headers;

  // Admin routes handle their own auth via requireAdmin()
  if (pathname.startsWith(ADMIN_API_PREFIX)) return true;

  // Public routes - always allow
  if (isPublicApiRoute(pathname)) return true;

  // Internal middleware calls (from this middleware to /api/settings)
  if (headers.get("x-internal") === "middleware") return true;

  // Get client IP
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const realIp = headers.get("x-real-ip") || "";
  const clientIp = (forwardedFor.split(",")[0] || realIp).trim();

  // Whitelisted IPs (hardcoded + env var)
  const envIps = (process.env.API_WHITELIST_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
  const allWhitelistedIps = [...WHITELIST_IPS, ...envIps];
  if (clientIp && allWhitelistedIps.includes(clientIp)) return true;

  // Same-origin check: allow requests coming from your own website
  const referer = headers.get("referer") || "";
  const origin = headers.get("origin") || "";
  const host = headers.get("host") || "";

  if (host) {
    const cleanHost = host.replace(/^www\./, "");
    if (referer.includes(cleanHost)) return true;
    if (origin.includes(cleanHost)) return true;
  }

  // Same-origin fetch header (modern browsers)
  const secFetchSite = headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") return true;

  // Direct API access from external = blocked
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================================
  // 1. API ROUTES - centralized protection
  // ============================================================
  if (pathname.startsWith("/api")) {
    if (!isApiRequestAllowed(request)) {
      // Return 404 to hide that the route exists
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.next();
  }

  // ============================================================
  // 2. Skip Next.js internals + static files
  // ============================================================
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ============================================================
  // 3. Admin path routing (existing logic)
  // ============================================================
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

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() || "";
  const isLocalePrefixed = LOCALES.includes(firstSegment);
  const effectiveSegments = isLocalePrefixed ? segments.slice(1) : segments;
  const effectiveFirstSegment = effectiveSegments[0]?.toLowerCase() || "";

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

  if (hasCustomPath && effectiveSegments.length === 1 && effectiveFirstSegment === customAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    const response = NextResponse.rewrite(url);
    response.headers.set("x-admin-rewrite", "true");
    return response;
  }

  // ============================================================
  // 4. Everything else - i18n routing
  // ============================================================
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
