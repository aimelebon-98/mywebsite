// In-Memory Sliding Window IP Rate Limiter for API Protection
const rateMap = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(ip: string, limit: number = 20, windowMs: number = 60000): boolean {
  if (!ip) return false;

  const now = Date.now();
  const entry = rateMap.get(ip);

  // Clean expired entries periodically
  if (rateMap.size > 5000) {
    for (const [key, value] of rateMap.entries()) {
      if (now > value.resetTime) rateMap.delete(key);
    }
  }

  if (!entry || now > entry.resetTime) {
    rateMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}