// Smart shipping calculator based on visitor's selected currency
// Nigeria (NGN) & Togo (XOF/FCFA): flat local rate | Others: quote via WhatsApp

import type { CurrencyCode } from "@/lib/currency";

export interface ShippingResult {
  hasLocalRate: boolean;
  amountLocal: number | null;
  localCurrency: CurrencyCode | null;
  isFree: boolean;
  label: string;
  labelKey?: string;
}

// Local shipping rates per currency (flat, no free threshold)
const LOCAL_RATES: Partial<Record<CurrencyCode, number>> = {
  NGN: 3500,   // Nigeria - flat 3500 NGN
  XOF: 1000,   // Togo/CFA - flat 1000 FCFA
};

/**
 * Compute shipping based on visitor's SELECTED currency
 * If currency is NGN or XOF, apply local flat rate
 * Otherwise: quote via WhatsApp
 *
 * @param currentCurrency - The currency user is viewing prices in
 */
export function computeShipping(currentCurrency: CurrencyCode): ShippingResult {
  const rate = LOCAL_RATES[currentCurrency];

  if (rate !== undefined) {
    const symbol = currentCurrency === "XOF" ? "FCFA" : currentCurrency;
    return {
      hasLocalRate: true,
      amountLocal: rate,
      localCurrency: currentCurrency,
      isFree: false,
      label: `${rate.toLocaleString()} ${symbol}`,
    };
  }

  return {
    hasLocalRate: false,
    amountLocal: null,
    localCurrency: null,
    isFree: false,
    label: "TBD",
    labelKey: "shippingQuote",
  };
}
