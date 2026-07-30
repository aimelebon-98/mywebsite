// Silent anti-spam helpers - no UX friction, blocks 80% of bots

/**
 * Validates a submission against silent anti-spam rules
 * Returns null if valid, or an error message if spam
 */
export function validateSubmission(params: {
  honeypot?: unknown;                     // Hidden field bots fill
  timestamp?: number;                     // Client-sent form open time (ms epoch)
  referer?: string | null;                // Request referer header
  host?: string | null;                   // Request host header
  minSecondsToSubmit?: number;            // Reject if faster than X seconds (default 2)
}): string | null {
  const {
    honeypot,
    timestamp,
    referer,
    host,
    minSecondsToSubmit = 2,
  } = params;

  // 1. HONEYPOT - if hidden field is filled, it's a bot
  if (honeypot && String(honeypot).trim().length > 0) {
    return "spam_honeypot";
  }

  // 2. TIME CHECK - reject if submitted too fast
  if (timestamp && typeof timestamp === "number") {
    const elapsed = (Date.now() - timestamp) / 1000;
    if (elapsed < minSecondsToSubmit) {
      return "spam_too_fast";
    }
    // Also reject if timestamp is in the future or absurdly old (>1 hour)
    if (elapsed < 0 || elapsed > 3600) {
      return "spam_bad_timestamp";
    }
  }

  // 3. REFERER CHECK - must come from own site
  if (host && referer) {
    try {
      const url = new URL(referer);
      const cleanHost = host.replace(/^www\./, "");
      const cleanRefHost = url.hostname.replace(/^www\./, "");
      if (!cleanRefHost.includes(cleanHost) && !cleanHost.includes(cleanRefHost)) {
        return "spam_bad_referer";
      }
    } catch {
      return "spam_bad_referer";
    }
  }

  return null;
}

/**
 * Simple in-memory rate limiter (per IP + action)
 * Note: works within a single serverless instance. For production scale, use Redis/Upstash.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/**
 * Cleanup old rate limit entries (call periodically)
 */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

/**
 * Get client IP from Next.js request headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const realIp = headers.get("x-real-ip") || "";
  return (forwardedFor.split(",")[0] || realIp || "unknown").trim();
}
