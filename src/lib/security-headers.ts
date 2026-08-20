import { NextResponse } from "next/server";

/**
 * Apply security headers to any NextResponse.
 * Call this in middleware.ts before returning the response.
 *
 * Usage:
 *   const response = NextResponse.next();
 *   applySecurityHeaders(response);
 *   return response;
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Force HTTPS for 1 year + subdomains + preload
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );

  // Remove server fingerprint
  response.headers.delete("X-Powered-By");

  // Content Security Policy
  // Adjust connect-src if you add new API domains
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://www.clarity.ms",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://www.google-analytics.com https://*.facebook.com https://*.fbcdn.net https://api.newdealzone.com https://www.newdealzone.com https://*.vercel.app https://*.blob.vercel-storage.com https://ipwho.is https://www.clarity.ms",
    "frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

/**
 * Validate that a mutation request (POST/PUT/DELETE/PATCH)
 * originates from your own domain. Basic CSRF protection.
 */
export function validateOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  const allowed = [
    "https://www.newdealzone.com",
    "https://newdealzone.com",
    "http://localhost:3000",
  ];

  if (origin && !allowed.some((a) => origin.startsWith(a))) return false;
  if (!origin && referer && !allowed.some((a) => referer.startsWith(a)))
    return false;

  return true;
}