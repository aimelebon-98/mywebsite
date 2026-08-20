/**
 * In-memory rate limiter for Vercel serverless.
 *
 * LIMITATION: Vercel serverless functions are stateless.
 * This limiter works per-instance (single cold start).
 * For production-grade rate limiting, use Vercel KV or Upstash Redis.
 *
 * This still protects against:
 * - Single-connection brute force
 * - Slow-rate credential stuffing
 * - Burst attacks within a single instance lifecycle
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export const RATE_LIMITS = {
  login: { max: 5, windowMs: 15 * 60 * 1000 } as RateLimitConfig,
  register: { max: 3, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
  passwordReset: { max: 3, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
  api: { max: 60, windowMs: 60 * 1000 } as RateLimitConfig,
  exchangeRates: { max: 10, windowMs: 60 * 1000 } as RateLimitConfig,
  seed: { max: 2, windowMs: 60 * 60 * 1000 } as RateLimitConfig,
  vendorApplication: { max: 2, windowMs: 24 * 60 * 60 * 1000 } as RateLimitConfig,
} as const;

/**
 * Check if a request should be rate-limited.
 *
 * @param identifier - Unique key (IP + endpoint, or email + endpoint)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const now = Date.now();
  const key = identifier.toLowerCase().trim();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

/**
 * Get client IP from request headers (Cloudflare-aware).
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Convenience: rate-limit by IP for a given endpoint.
 * Returns a Response if limited, null if allowed.
 */
export function rateLimitByIP(
  request: Request,
  endpoint: string,
  config: RateLimitConfig
): Response | null {
  const ip = getClientIP(request);
  const { allowed, remaining, resetAt } = checkRateLimit(`${ip}:${endpoint}`, config);

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

// ── Backward-compatible alias ──
// Existing routes import isRateLimited(identifier, endpoint?, max?, windowMs?)
export function isRateLimited(
  identifier: string,
  endpoint?: string,
  max?: number,
  windowMs?: number
): boolean {
  const key = endpoint ? `${identifier}:${endpoint}` : identifier;
  const config = {
    max: max ?? RATE_LIMITS.api.max,
    windowMs: windowMs ?? RATE_LIMITS.api.windowMs,
  };
  const { allowed } = checkRateLimit(key, config);
  return !allowed;
}