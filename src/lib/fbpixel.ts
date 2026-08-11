// Meta Pixel typed helper (browser + CAPI dual-fire)
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const FB_PIXEL_ID = "1206289069241769";

function safeCall(...args: unknown[]) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  try { window.fbq(...args); } catch { /* ignore */ }
}

function newEventId(): string {
  return `ndz_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function sendToCapi(
  eventName: string,
  eventId: string,
  customData: Record<string, unknown> = {},
  userData: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      events: [{ eventName, eventId, eventSourceUrl: window.location.href, userData, customData }],
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/fb-capi/track", blob);
    } else {
      fetch("/api/fb-capi/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => { /* ignore */ });
    }
  } catch { /* ignore */ }
}

let __userMatch: { email?: string; phone?: string; externalId?: string } = {};
export function setFbUserMatch(u: { email?: string; phone?: string; externalId?: string }) {
  __userMatch = { ...u };
}

export function pageview() {
  const eventId = newEventId();
  safeCall("track", "PageView", {}, { eventID: eventId });
  sendToCapi("PageView", eventId, {}, __userMatch);
}

export interface ViewContentParams {
  content_ids: string[]; content_name?: string; content_type?: "product";
  value?: number; currency?: string; content_category?: string; brand?: string;
}
export function trackViewContent(p: ViewContentParams) {
  const eventId = newEventId();
  const data = { content_type: "product", ...p };
  safeCall("track", "ViewContent", data, { eventID: eventId });
  sendToCapi("ViewContent", eventId, data, __userMatch);
}

export interface AddToCartParams {
  content_ids: string[]; content_name?: string; content_type?: "product";
  value?: number; currency?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
}
export function trackAddToCart(p: AddToCartParams) {
  const eventId = newEventId();
  const data = { content_type: "product", ...p };
  safeCall("track", "AddToCart", data, { eventID: eventId });
  sendToCapi("AddToCart", eventId, data, __userMatch);
}

export interface AddToWishlistParams {
  content_ids: string[]; content_name?: string; content_type?: "product";
  value?: number; currency?: string;
}
export function trackAddToWishlist(p: AddToWishlistParams) {
  const eventId = newEventId();
  const data = { content_type: "product", ...p };
  safeCall("track", "AddToWishlist", data, { eventID: eventId });
  sendToCapi("AddToWishlist", eventId, data, __userMatch);
}

export interface InitiateCheckoutParams {
  content_ids: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number; value?: number; currency?: string;
}
export function trackInitiateCheckout(p: InitiateCheckoutParams) {
  const eventId = newEventId();
  const data = { content_type: "product", ...p };
  safeCall("track", "InitiateCheckout", data, { eventID: eventId });
  sendToCapi("InitiateCheckout", eventId, data, __userMatch);
}

export interface AddPaymentInfoParams {
  content_ids?: string[]; value?: number; currency?: string;
}
export function trackAddPaymentInfo(p: AddPaymentInfoParams) {
  const eventId = newEventId();
  safeCall("track", "AddPaymentInfo", p, { eventID: eventId });
  sendToCapi("AddPaymentInfo", eventId, p as Record<string, unknown>, __userMatch);
}

export interface PurchaseParams {
  content_ids: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number; value: number; currency: string;
  content_type?: "product"; order_id?: string;
}
export function trackPurchase(p: PurchaseParams) {
  const eventId = newEventId();
  const data = { content_type: "product", ...p };
  safeCall("track", "Purchase", data, { eventID: eventId });
  sendToCapi("Purchase", eventId, data, __userMatch);
}

export interface SearchParams {
  search_string: string; content_category?: string;
}
export function trackSearch(p: SearchParams) {
  const eventId = newEventId();
  safeCall("track", "Search", p, { eventID: eventId });
  sendToCapi("Search", eventId, p as Record<string, unknown>, __userMatch);
}

export interface LeadParams {
  content_name?: string; content_category?: string; value?: number; currency?: string;
}
export function trackLead(p: LeadParams = {}) {
  const eventId = newEventId();
  safeCall("track", "Lead", p, { eventID: eventId });
  sendToCapi("Lead", eventId, p as Record<string, unknown>, __userMatch);
}

export interface CompleteRegistrationParams {
  content_name?: string; status?: boolean; value?: number; currency?: string;
}
export function trackCompleteRegistration(p: CompleteRegistrationParams = {}) {
  const eventId = newEventId();
  safeCall("track", "CompleteRegistration", p, { eventID: eventId });
  sendToCapi("CompleteRegistration", eventId, p as Record<string, unknown>, __userMatch);
}

export interface ContactParams { content_name?: string; }
export function trackContact(p: ContactParams = {}) {
  const eventId = newEventId();
  safeCall("track", "Contact", p, { eventID: eventId });
  sendToCapi("Contact", eventId, p as Record<string, unknown>, __userMatch);
}

export function trackCustom(eventName: string, params: Record<string, unknown> = {}) {
  const eventId = newEventId();
  safeCall("trackCustom", eventName, params, { eventID: eventId });
  sendToCapi(eventName, eventId, params, __userMatch);
}