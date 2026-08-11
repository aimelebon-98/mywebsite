// Meta Conversions API (server-side) helper
import crypto from "crypto";
import { FB_PIXEL_ID } from "@/lib/fbpixel";

const CAPI_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const CAPI_API_VERSION = "v21.0";
const CAPI_ENDPOINT = `https://graph.facebook.com/${CAPI_API_VERSION}/${FB_PIXEL_ID}/events`;
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_CODE || "";

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  externalId?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export interface CapiEvent {
  eventName: string;
  eventId?: string;
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData?: Record<string, unknown>;
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return crypto.createHash("sha256").update(digits).digest("hex");
}

function buildUserData(u: CapiUserData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (u.email) data.em = [sha256(u.email)];
  if (u.phone) data.ph = [hashPhone(u.phone)];
  if (u.firstName) data.fn = [sha256(u.firstName)];
  if (u.lastName) data.ln = [sha256(u.lastName)];
  if (u.city) data.ct = [sha256(u.city)];
  if (u.country) data.country = [sha256(u.country)];
  if (u.externalId) data.external_id = [sha256(u.externalId)];
  if (u.clientIp) data.client_ip_address = u.clientIp;
  if (u.clientUserAgent) data.client_user_agent = u.clientUserAgent;
  if (u.fbc) data.fbc = u.fbc;
  if (u.fbp) data.fbp = u.fbp;
  return data;
}

export async function sendCapiEvents(events: CapiEvent[]): Promise<{ ok: boolean; error?: string; response?: unknown }> {
  if (!CAPI_TOKEN) return { ok: false, error: "META_CAPI_ACCESS_TOKEN not set" };
  if (!events || events.length === 0) return { ok: false, error: "No events to send" };

  const payload = {
    data: events.map(e => ({
      event_name: e.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: e.eventId,
      event_source_url: e.eventSourceUrl,
      action_source: "website",
      user_data: buildUserData(e.userData),
      ...(e.customData ? { custom_data: e.customData } : {}),
    })),
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  try {
    const url = `${CAPI_ENDPOINT}?access_token=${encodeURIComponent(CAPI_TOKEN)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[CAPI] error:", res.status, json);
      return { ok: false, error: `HTTP ${res.status}`, response: json };
    }
    return { ok: true, response: json };
  } catch (err) {
    console.error("[CAPI] fetch failed:", err);
    return { ok: false, error: String(err) };
  }
}

export function generateEventId(): string {
  return `ndz_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function extractUserDataFromHeaders(headers: Headers): CapiUserData {
  const clientIp =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    (headers.get("x-forwarded-for") || "").split(",").pop()?.trim() ||
    "";
  const country = (headers.get("cf-ipcountry") || "").toUpperCase();
  const clientUserAgent = headers.get("user-agent") || "";
  const cookieHeader = headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  return {
    clientIp: clientIp || undefined,
    country: country || undefined,
    clientUserAgent: clientUserAgent || undefined,
    fbc: cookies._fbc || undefined,
    fbp: cookies._fbp || undefined,
  };
}