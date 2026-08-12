/**
 * IndexNow ping helper
 *
 * Call from ANY server-side code (API routes, server actions) after
 * creating or updating a published page:
 *
 *   import { pingIndexNow } from "@/lib/indexnow-ping";
 *   await pingIndexNow([
 *     "https://www.newdealzone.com/en/blog/my-new-post",
 *     "https://www.newdealzone.com/fr/blog/mon-nouveau-post",
 *   ]);
 *
 * Fire-and-forget: doesn't throw, doesn't block. Logs to console on failure.
 */

const INDEXNOW_KEY = "14iofclgzm30a57jydbh2rwknsv6xepq";
const SITE_HOST = "www.newdealzone.com";

export async function pingIndexNow(urls: string[]): Promise<boolean> {
  try {
    const clean = urls.filter((u) => typeof u === "string" && u.startsWith("http"));
    if (clean.length === 0) return false;

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: clean,
    };

    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`[IndexNow] Ping failed: ${res.status} for ${clean.length} URLs`);
      return false;
    }

    console.log(`[IndexNow] Pinged ${clean.length} URL(s)`);
    return true;
  } catch (err) {
    console.warn("[IndexNow] Error:", err);
    return false;
  }
}

/**
 * Convenience: ping both EN and FR versions of a path
 * pingBilingualIndexNow("/blog/my-post")
 * -> pings /en/blog/my-post AND /fr/blog/my-post
 */
export async function pingBilingualIndexNow(path: string): Promise<boolean> {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = clean.replace(/^\/(en|fr)/, "");
  return pingIndexNow([
    `https://${SITE_HOST}/en${withoutLocale}`,
    `https://${SITE_HOST}/fr${withoutLocale}`,
  ]);
}