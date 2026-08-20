import { headers } from "next/headers";

/**
 * Validates that state-changing requests (POST/PUT/DELETE) originate from your website.
 */
export async function verifyRequestOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin") || "";
  const referer = h.get("referer") || "";
  const host = h.get("host") || "";

  if (!host) return true; // Fail-open for server-to-server calls if host header missing

  const cleanHost = host.replace(/^www\./, "").toLowerCase();

  if (origin) {
    const cleanOrigin = origin.replace(/^https?:\/\/(www\.)?/, "").toLowerCase();
    if (!cleanOrigin.includes(cleanHost)) return false;
  }

  if (referer) {
    const cleanReferer = referer.replace(/^https?:\/\/(www\.)?/, "").toLowerCase();
    if (!cleanReferer.includes(cleanHost)) return false;
  }

  return true;
}