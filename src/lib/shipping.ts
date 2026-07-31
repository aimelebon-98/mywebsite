// Smart shipping calculator based on visitor country
// Nigeria & Togo: flat local rate | Others: quote via WhatsApp

import type { CurrencyCode } from "@/lib/currency";

export interface ShippingResult {
  hasLocalRate: boolean;
  amountLocal: number | null;
  localCurrency: CurrencyCode | null;
  isFree: boolean;
  label: string;
  labelKey?: string;
}

// Local shipping rates (flat, no free threshold)
const LOCAL_RATES: Record<string, { rate: number; currency: CurrencyCode }> = {
  NG: { rate: 3500, currency: "NGN" },  // Nigeria - flat 3500 NGN
  TG: { rate: 1000, currency: "XOF" },  // Togo - flat 1000 FCFA
};

/**
 * Compute shipping cost for a visitor
 * @param visitorCountry - ISO country code (e.g. "NG", "TG", "US")
 * @param subtotalUsd - Cart subtotal in USD
 * @param rates - Currency conversion rates (USD -> other)
 */
export function computeShipping(
  visitorCountry: string,
  _subtotalUsd: number,
  _rates: Record<string, number>
): ShippingResult {
  const country = (visitorCountry || "").toUpperCase();
  const local = LOCAL_RATES[country];

  if (local) {
    return {
      hasLocalRate: true,
      amountLocal: local.rate,
      localCurrency: local.currency,
      isFree: false,
      label: `${local.rate.toLocaleString()} ${local.currency === "XOF" ? "FCFA" : local.currency}`,
    };
  }

  // No local rate = quote via WhatsApp
  return {
    hasLocalRate: false,
    amountLocal: null,
    localCurrency: null,
    isFree: false,
    label: "TBD",
    labelKey: "shippingQuote",
  };
}