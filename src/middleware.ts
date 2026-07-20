import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract the first path segment (e.g., "/jevwad" -> "jevwad")
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return NextResponse.next();
  }

  const firstSegment = segments[0].toLowerCase();

  // Skip known public routes
  const publicRoutes = [
    "shop", "cart", "checkout", "product", "products",
    "about", "contact", "login", "signup", "register",
    "search", "category", "wishlist", "account", "order", "orders"
  ];
  if (publicRoutes.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Check if this path matches the custom admin path from DB
  try {
    const settingsUrl = new URL("/api/settings", request.url);
    const res = await fetch(settingsUrl.toString(), {
      headers: { "x-internal": "middleware" },
    });

    if (res.ok) {
      const settings = await res.json();
      const customAdminPath = (settings.adminPath || "admin").toLowerCase();

      // If the URL matches the custom admin path, rewrite to /admin
      if (firstSegment === customAdminPath && customAdminPath !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.rewrite(url);
      }
    }
  } catch (error) {
    console.error("Middleware settings fetch error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
