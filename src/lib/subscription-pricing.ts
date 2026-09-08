export type SubscriptionTierMonths = 1 | 3 | 5 | 12;

export interface SubscriptionTier {
  months: SubscriptionTierMonths;
  labelEn: string;
  labelFr: string;
  discountPercent: number;
  discountFlat: number;
}

export const DEFAULT_MONTHLY_PRICE = 19.99;

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { months: 1,  labelEn: "1 Month",  labelFr: "1 mois", discountPercent: 0,  discountFlat: 0 },
  { months: 3,  labelEn: "3 Months", labelFr: "3 mois", discountPercent: 10, discountFlat: 0 },
  { months: 5,  labelEn: "5 Months", labelFr: "5 mois", discountPercent: 15, discountFlat: 0 },
  { months: 12, labelEn: "1 Year",   labelFr: "1 an",   discountPercent: 25, discountFlat: 0 },
];

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateSubscriptionPrice(
  monthlyPrice: number,
  months: number,
  discountPercent = 0,
  discountFlat = 0
) {
  const subtotal = round2(monthlyPrice * months);
  const percentOff = round2(subtotal * (discountPercent / 100));
  const total = round2(Math.max(0, subtotal - percentOff - discountFlat));
  const savings = round2(subtotal - total);
  const effectiveMonthly = months > 0 ? round2(total / months) : total;
  return { monthlyPrice: round2(monthlyPrice), months, subtotal, discountPercent, discountFlat: round2(discountFlat), percentOff, total, savings, effectiveMonthly };
}

export function getTierQuote(monthlyPrice: number, months: SubscriptionTierMonths) {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.months === months) || SUBSCRIPTION_TIERS[0];
  return { tier, ...calculateSubscriptionPrice(monthlyPrice, tier.months, tier.discountPercent, tier.discountFlat) };
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export function formatExpiry(date: Date, locale = "en"): string {
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function parseSubscriptionConfig(raw?: string | null): { monthlyPrice: number; cryptoOnly: boolean; allowedCryptos: string[] } {
  const fallback = { monthlyPrice: DEFAULT_MONTHLY_PRICE, cryptoOnly: true, allowedCryptos: ["btc", "usdttrc20"] };
  if (!raw) return fallback;
  try {
    const p = JSON.parse(raw);
    return {
      monthlyPrice: Number(p.monthlyPrice) || DEFAULT_MONTHLY_PRICE,
      cryptoOnly: p.cryptoOnly !== false,
      allowedCryptos: Array.isArray(p.allowedCryptos) ? p.allowedCryptos : fallback.allowedCryptos,
    };
  } catch { return fallback; }
}

export function isSubscriptionProduct(product: { productType?: string | null; category?: string | null; tags?: string | null }): boolean {
  if (product.productType === "subscription") return true;
  if ((product.category || "").toLowerCase() === "subscription") return true;
  try {
    const tags = JSON.parse(product.tags || "[]");
    return Array.isArray(tags) && tags.map(String).some((t) => t.toLowerCase() === "subscription");
  } catch { return false; }
}