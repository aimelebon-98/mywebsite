import { headers } from "next/headers";

export async function verifyRequestOrigin(request?: Request): Promise<boolean> {
  try {
    let origin: string | null = null;
    let referer: string | null = null;

    if (request && request.headers) {
      origin = request.headers.get("origin");
      referer = request.headers.get("referer");
    } else {
      try {
        const h = await headers();
        origin = h.get("origin");
        referer = h.get("referer");
      } catch {}
    }

    const allowed = [
      "https://www.newdealzone.com",
      "https://newdealzone.com",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    if (origin) {
      return allowed.some((domain) => origin === domain || origin.startsWith(domain + "/"));
    }

    if (referer) {
      return allowed.some((domain) => referer.startsWith(domain + "/") || referer === domain);
    }

    return true;
  } catch {
    return false;
  }
}