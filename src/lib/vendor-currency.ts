export const SUPPORTED_VENDOR_CURRENCIES = [
  { code: "USD", label: "USD - US Dollar", symbol: "$", display: "USD" },
  { code: "NGN", label: "NGN - Nigerian Naira", symbol: "\u20a6", display: "NGN" },
  { code: "XOF", label: "FCFA - West African CFA", symbol: "FCFA", display: "FCFA" },
  { code: "EUR", label: "EUR - Euro", symbol: "\u20ac", display: "EUR" },
  { code: "GHS", label: "GHS - Ghanaian Cedi", symbol: "GH\u20b5", display: "GHS" },
  { code: "GBP", label: "GBP - British Pound", symbol: "\u00a3", display: "GBP" },
  { code: "KES", label: "KES - Kenyan Shilling", symbol: "KSh", display: "KES" },
  { code: "ZAR", label: "ZAR - South African Rand", symbol: "R", display: "ZAR" },
] as const;

export type VendorCurrencyCode = typeof SUPPORTED_VENDOR_CURRENCIES[number]["code"];

const COUNTRY_TO_CURRENCY: Record<string, VendorCurrencyCode> = {
  NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR",
  TG: "XOF", BJ: "XOF", BF: "XOF", CI: "XOF", ML: "XOF", NE: "XOF", SN: "XOF", GW: "XOF",
  FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", BE: "EUR", NL: "EUR", PT: "EUR",
  GB: "GBP", US: "USD", CA: "USD",
};

export function defaultCurrencyForCountry(country: string): VendorCurrencyCode {
  return COUNTRY_TO_CURRENCY[country?.toUpperCase()] || "USD";
}

export function getCurrencySymbol(code: string): string {
  const c = SUPPORTED_VENDOR_CURRENCIES.find(x => x.code === code);
  return c?.symbol || code;
}

// XOF -> FCFA for display everywhere (storage stays as XOF)
export function displayCurrency(code: string): string {
  if (!code) return "";
  const upper = code.toUpperCase();
  const c = SUPPORTED_VENDOR_CURRENCIES.find(x => x.code === upper);
  return c?.display || (upper === "XOF" ? "FCFA" : upper);
}

export function isValidVendorCurrency(code: string): boolean {
  return SUPPORTED_VENDOR_CURRENCIES.some(c => c.code === code);
}