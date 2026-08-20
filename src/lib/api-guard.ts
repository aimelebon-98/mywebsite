import { NextRequest, NextResponse } from "next/server";
import { validateOrigin } from "@/lib/security-headers";
import { rateLimitByIP, RATE_LIMITS, type RateLimitConfig } from "@/lib/rate-limit";

/**
 * One-call API guard for mutation endpoints.
 * Checks: Origin (CSRF) + Rate Limit.
 *
 * Usage at top of POST/PUT/DELETE handler:
 *   const guard = guardMutation(request, "login", RATE_LIMITS.login);
 *   if (guard) return guard;
 *
 * Returns null if all checks pass, or a Response to return immediately.
 */
export function guardMutation(
  request: NextRequest,
  endpoint: string,
  rateLimit: RateLimitConfig
): NextResponse | null {
  // 1. CSRF: validate origin for mutation requests
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  // 2. Rate limiting
  const limited = rateLimitByIP(request, endpoint, rateLimit);
  if (limited) return limited as NextResponse;

  return null;
}

/**
 * Guard for public GET endpoints that need rate limiting only.
 */
export function guardPublicGet(
  request: NextRequest,
  endpoint: string,
  rateLimit: RateLimitConfig
): NextResponse | null {
  const limited = rateLimitByIP(request, endpoint, rateLimit);
  if (limited) return limited as NextResponse;
  return null;
}