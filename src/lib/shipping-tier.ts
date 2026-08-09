// Countries where we currently have suppliers (shows in admin form dropdown).
// Add new countries here as you expand supplier network.
export const SUPPLIER_COUNTRIES: { code: string; name: string; flag: string; defaultCity: string }[] = [
  { code: "NG", name: "Nigeria",  flag: "\uD83C\uDDF3\uD83C\uDDEC", defaultCity: "Abuja" },
  { code: "TG", name: "Togo",     flag: "\uD83C\uDDF9\uD83C\uDDEC", defaultCity: "Lom\u00e9" },
];

export type ShippingTier = "local" | "international";

/**
 * Returns "local" if product origin matches visitor country, otherwise "international".
 * If visitorCountry is empty (unknown), treat everything as local (no ✈️ badge shown).
 */
export function getShippingTier(originCountry: string | null | undefined, visitorCountry: string | null | undefined): ShippingTier {
  if (!visitorCountry) return "local";
  if (!originCountry) return "international";
  return originCountry.toUpperCase() === visitorCountry.toUpperCase() ? "local" : "international";
}

/**
 * Sort products so local (visitor-country) ones come first, then international.
 * Stable sort - preserves DB order within each group.
 */
export function sortByShippingTier<T extends { originCountry?: string | null }>(
  products: T[],
  visitorCountry: string | null | undefined
): T[] {
  if (!visitorCountry) return products;
  const vc = visitorCountry.toUpperCase();
  const local: T[] = [];
  const intl: T[] = [];
  for (const p of products) {
    if ((p.originCountry || "").toUpperCase() === vc) local.push(p);
    else intl.push(p);
  }
  return [...local, ...intl];
}