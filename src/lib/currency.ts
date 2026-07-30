export type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN" | "GHS" | "XOF" | "KES" | "ZAR";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  position: "left" | "right";
  flag: string;
  name: string;
  nameFr: string;
  decimals: number;
  roundTo?: number; // e.g., round to nearest 100
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",     position: "left",  flag: "🇺🇸", name: "US Dollar",       nameFr: "Dollar US",       decimals: 2 },
  EUR: { code: "EUR", symbol: "€",     position: "left",  flag: "🇪🇺", name: "Euro",            nameFr: "Euro",            decimals: 2 },
  GBP: { code: "GBP", symbol: "£",     position: "left",  flag: "🇬🇧", name: "British Pound",   nameFr: "Livre Sterling",  decimals: 2 },
  NGN: { code: "NGN", symbol: "₦",     position: "left",  flag: "🇳🇬", name: "Nigerian Naira",  nameFr: "Naira Nigerian",  decimals: 0, roundTo: 100 },
  GHS: { code: "GHS", symbol: "₵",     position: "left",  flag: "🇬🇭", name: "Ghanaian Cedi",   nameFr: "Cedi Ghaneen",    decimals: 2 },
  XOF: { code: "XOF", symbol: "FCFA",  position: "right", flag: "🌍", name: "West African CFA", nameFr: "Franc CFA",       decimals: 0, roundTo: 100 },
  KES: { code: "KES", symbol: "KSh",   position: "left",  flag: "🇰🇪", name: "Kenyan Shilling", nameFr: "Shilling Kenyan", decimals: 0, roundTo: 10 },
  ZAR: { code: "ZAR", symbol: "R",     position: "left",  flag: "🇿🇦", name: "South African Rand", nameFr: "Rand Sud-Africain", decimals: 2 },
};

// Country -> Currency mapping for auto-detection
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", CA: "USD",
  GB: "GBP", UK: "GBP",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  // CFA franc countries (XOF)
  BJ: "XOF", BF: "XOF", CI: "XOF", GW: "XOF", ML: "XOF",
  NE: "XOF", SN: "XOF", TG: "XOF",
  // EU countries (EUR)
  AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR",
  ES: "EUR", FI: "EUR", FR: "EUR", GR: "EUR", HR: "EUR",
  IE: "EUR", IT: "EUR", LT: "EUR", LU: "EUR", LV: "EUR",
  MT: "EUR", NL: "EUR", PT: "EUR", SI: "EUR", SK: "EUR",
};

export function convertPrice(usdAmount: number, targetCurrency: CurrencyCode, rates: Record<string, number>): number {
  if (targetCurrency === "USD") return usdAmount;
  const rate = rates[targetCurrency] || 1;
  return usdAmount * rate;
}

export function formatPrice(usdAmount: number, currency: CurrencyCode, rates: Record<string, number>): string {
  const info = CURRENCIES[currency];
  let converted = convertPrice(usdAmount, currency, rates);

  if (info.roundTo && info.roundTo > 1) {
    converted = Math.round(converted / info.roundTo) * info.roundTo;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  }).format(converted);

  return info.position === "left" ? `${info.symbol}${formatted}` : `${formatted} ${info.symbol}`;
}
