import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
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

  // BLOCK direct access to /admin and /api/admin if a custom path is set
  if (hasCustomPath) {
    // Block /admin pages (but allow the rewrite from custom path to work internally)
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      // Check if this is an internal rewrite (has custom rewrite header)
      const isRewrite = request.headers.get("x-admin-rewrite") === "true";
      if (!isRewrite) {
        // Return 404 to hide that admin exists
        return new NextResponse("Not Found", { status: 404 });
      }
    }
  }

  // Handle single-segment paths (potential custom admin path)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && !pathname.startsWith("/api")) {
    const firstSegment = segments[0].toLowerCase();

    // Skip known public routes
    const publicRoutes = [
      "shop", "cart", "checkout", "product", "products",
      "about", "contact", "login", "signup", "register",
      "search", "category", "wishlist", "account", "order", "orders"
    ];

    if (!publicRoutes.includes(firstSegment) && firstSegment !== "admin") {
      // If matches the custom admin path, rewrite to /admin
      if (hasCustomPath && firstSegment === customAdminPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        const response = NextResponse.rewrite(url);
        response.headers.set("x-admin-rewrite", "true");
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
