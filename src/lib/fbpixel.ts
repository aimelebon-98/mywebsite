// Meta Pixel typed helper
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

export function pageview() {
  safeCall("track", "PageView");
}

export interface ViewContentParams {
  content_ids: string[];
  content_name?: string;
  content_type?: "product";
  value?: number;
  currency?: string;
  content_category?: string;
  brand?: string;
}
export function trackViewContent(p: ViewContentParams) {
  safeCall("track", "ViewContent", { content_type: "product", ...p });
}

export interface AddToCartParams {
  content_ids: string[];
  content_name?: string;
  content_type?: "product";
  value?: number;
  currency?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
}
export function trackAddToCart(p: AddToCartParams) {
  safeCall("track", "AddToCart", { content_type: "product", ...p });
}

export interface AddToWishlistParams {
  content_ids: string[];
  content_name?: string;
  content_type?: "product";
  value?: number;
  currency?: string;
}
export function trackAddToWishlist(p: AddToWishlistParams) {
  safeCall("track", "AddToWishlist", { content_type: "product", ...p });
}

export interface InitiateCheckoutParams {
  content_ids: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  value?: number;
  currency?: string;
}
export function trackInitiateCheckout(p: InitiateCheckoutParams) {
  safeCall("track", "InitiateCheckout", { content_type: "product", ...p });
}

export interface AddPaymentInfoParams {
  content_ids?: string[];
  value?: number;
  currency?: string;
}
export function trackAddPaymentInfo(p: AddPaymentInfoParams) {
  safeCall("track", "AddPaymentInfo", p);
}

export interface PurchaseParams {
  content_ids: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  value: number;
  currency: string;
  content_type?: "product";
  order_id?: string;
}
export function trackPurchase(p: PurchaseParams) {
  safeCall("track", "Purchase", { content_type: "product", ...p });
}

export interface SearchParams {
  search_string: string;
  content_category?: string;
}
export function trackSearch(p: SearchParams) {
  safeCall("track", "Search", p);
}

export interface LeadParams {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}
export function trackLead(p: LeadParams = {}) {
  safeCall("track", "Lead", p);
}

export interface CompleteRegistrationParams {
  content_name?: string;
  status?: boolean;
  value?: number;
  currency?: string;
}
export function trackCompleteRegistration(p: CompleteRegistrationParams = {}) {
  safeCall("track", "CompleteRegistration", p);
}

export interface ContactParams {
  content_name?: string;
}
export function trackContact(p: ContactParams = {}) {
  safeCall("track", "Contact", p);
}

// Custom event (not a standard Meta event)
export function trackCustom(eventName: string, params: Record<string, unknown> = {}) {
  safeCall("trackCustom", eventName, params);
}