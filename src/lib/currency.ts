export type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN" | "GHS" | "XOF" | "KES" | "ZAR";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  position: "left" | "right";
  flag: string;
  name: string;
  nameFr: string;
  decimals: number;
  roundTo?: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",     position: "left",  flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "US Dollar",           nameFr: "Dollar US",           decimals: 2 },
  EUR: { code: "EUR", symbol: "\u20ac", position: "left",  flag: "\uD83C\uDDEA\uD83C\uDDFA", name: "Euro",                nameFr: "Euro",                decimals: 2 },
  GBP: { code: "GBP", symbol: "\u00a3", position: "left",  flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "British Pound",       nameFr: "Livre Sterling",      decimals: 2 },
  NGN: { code: "NGN", symbol: "\u20a6", position: "left",  flag: "\uD83C\uDDF3\uD83C\uDDEC", name: "Nigerian Naira",      nameFr: "Naira Nig\u00e9rian",   decimals: 0, roundTo: 100 },
  GHS: { code: "GHS", symbol: "\u20b5", position: "left",  flag: "\uD83C\uDDEC\uD83C\uDDED", name: "Ghanaian Cedi",       nameFr: "Cedi Ghan\u00e9en",     decimals: 2 },
  XOF: { code: "XOF", symbol: "FCFA",   position: "right", flag: "\uD83C\uDF0D",              name: "West African CFA",    nameFr: "Franc CFA",           decimals: 0, roundTo: 100 },
  KES: { code: "KES", symbol: "KSh",    position: "left",  flag: "\uD83C\uDDF0\uD83C\uDDEA", name: "Kenyan Shilling",     nameFr: "Shilling Kenyan",     decimals: 0, roundTo: 10 },
  ZAR: { code: "ZAR", symbol: "R",      position: "left",  flag: "\uD83C\uDDFF\uD83C\uDDE6", name: "South African Rand",  nameFr: "Rand Sud-Africain",   decimals: 2 },
};

export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", CA: "USD",
  GB: "GBP", UK: "GBP",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  BJ: "XOF", BF: "XOF", CI: "XOF", GW: "XOF", ML: "XOF",
  NE: "XOF", SN: "XOF", TG: "XOF",
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