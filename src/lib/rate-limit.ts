interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

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
  max: number;
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

export function getClientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

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

/**
 * Backward-compatible helper that accepts both:
 * - isRateLimited(ip, 5, 60000)
 * - isRateLimited(ip, "endpoint", 5, 60000)
 * - isRateLimited(ip)
 */
export function isRateLimited(
  identifier: string,
  limitOrEndpoint?: number | string,
  windowMsOrLimit?: number,
  maybeWindowMs?: number
): boolean {
  let endpoint = "";
  let max = RATE_LIMITS.api.max;
  let windowMs = RATE_LIMITS.api.windowMs;

  if (typeof limitOrEndpoint === "number") {
    max = limitOrEndpoint;
    if (typeof windowMsOrLimit === "number") {
      windowMs = windowMsOrLimit;
    }
  } else if (typeof limitOrEndpoint === "string") {
    endpoint = limitOrEndpoint;
    if (typeof windowMsOrLimit === "number") {
      max = windowMsOrLimit;
    }
    if (typeof maybeWindowMs === "number") {
      windowMs = maybeWindowMs;
    }
  }

  const key = endpoint ? `${identifier}:${endpoint}` : identifier;
  const config: RateLimitConfig = { max, windowMs };
  const { allowed } = checkRateLimit(key, config);
  return !allowed;
}