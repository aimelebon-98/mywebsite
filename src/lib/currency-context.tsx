"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { CURRENCIES, COUNTRY_TO_CURRENCY, formatPrice, type CurrencyCode } from "@/lib/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Record<string, number>;
  format: (usdAmount: number) => string;
  convert: (usdAmount: number) => number;
  autoDetected: boolean;
  visitorCountry: string;
  loading: boolean;
}

const STORAGE_KEY = "ndz_currency";
const RATES_KEY = "ndz_exchange_rates";
const COUNTRY_KEY = "ndz_visitor_country";
const COOKIE_KEY = "ndz_currency";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function writeCurrencyCookie(c: string) {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${COOKIE_KEY}=${c}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch { /* ignore */ }
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children, initialCurrency, initialRates }: { children: ReactNode; initialCurrency?: CurrencyCode; initialRates?: Record<string, number> }) {
  // Initialize with the server-provided currency (from cookie) so first render matches SSR.
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency || "USD");
  const [rates, setRates] = useState<Record<string, number>>(initialRates || {});
  const [autoDetected, setAutoDetected] = useState(false);
  const [visitorCountry, setVisitorCountry] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Try cached country first
        try {
          const cachedCountry = localStorage.getItem(COUNTRY_KEY);
          if (cachedCountry) setVisitorCountry(cachedCountry);
        } catch { /* ignore */ }

        const stored = localStorage.getItem(STORAGE_KEY);
        // Only update if localStorage differs from what we already have from cookie
        if (stored && stored in CURRENCIES && stored !== currency) {
          setCurrencyState(stored as CurrencyCode);
          writeCurrencyCookie(stored);
        }

        // Always fetch country (fresh), but only set currency if user hasn't chosen one
        try {
          const res = await fetch("/api/geo-currency");
          const data = await res.json();
          if (data.country) {
            setVisitorCountry(data.country);
            try { localStorage.setItem(COUNTRY_KEY, data.country); } catch { /* ignore */ }
          }
          // Only auto-detect if no cookie AND no localStorage AND currency is still default USD
          if (!initialCurrency && !stored && data.currency && data.currency in CURRENCIES) {
            setCurrencyState(data.currency);
            setAutoDetected(true);
            try { localStorage.setItem(STORAGE_KEY, data.currency); } catch { /* ignore */ }
            writeCurrencyCookie(data.currency);
          }
        } catch { /* fallback */ }
      } catch { /* fallback */ }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const cached = localStorage.getItem(RATES_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const ageHours = (Date.now() - (parsed.timestamp || 0)) / (1000 * 60 * 60);
          if (ageHours < 12 && parsed.rates) {
            setRates(parsed.rates);
            return;
          }
        }
      } catch { /* ignore */ }

      try {
        const res = await fetch("/api/exchange-rates");
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
          try {
            localStorage.setItem(RATES_KEY, JSON.stringify({ rates: data.rates, timestamp: Date.now() }));
          } catch { /* ignore */ }
        }
      } catch { /* USD fallback */ }
    };
    loadRates();
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    setAutoDetected(false);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
    writeCurrencyCookie(c);
  }, []);

  const format = useCallback((usd: number) => formatPrice(usd, currency, rates), [currency, rates]);

  const convert = useCallback((usd: number) => {
    if (currency === "USD") return usd;
    return usd * (rates[currency] || 1);
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, format, convert, autoDetected, visitorCountry, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export { COUNTRY_TO_CURRENCY };