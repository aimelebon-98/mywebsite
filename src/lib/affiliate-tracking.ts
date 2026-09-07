// Server-side affiliate referral tracking helpers
// Cookie: ndz_affiliate | Duration: 30 days | Set on ?ref=CODE visit

const REF_COOKIE = "ndz_affiliate";
const REF_DAYS = 30;

export const AFFILIATE_COOKIE_NAME = REF_COOKIE;
export const AFFILIATE_COOKIE_DAYS = REF_DAYS;

export function getAffiliateRefFromCookies(
  cookieGetter: (name: string) => { value: string } | undefined
): string | null {
  const c = cookieGetter(REF_COOKIE);
  return c?.value || null;
}

export function buildAffiliateSetCookieHeader(code: string): string {
  const maxAge = REF_DAYS * 24 * 60 * 60;
  return `${REF_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
}

export function buildAffiliateClearCookieHeader(): string {
  return `${REF_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}