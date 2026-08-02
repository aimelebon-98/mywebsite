"use client";

import { useState, useEffect } from "react";
import type { Order } from "@/db/schema";
import { ShoppingCart, Clock, CheckCircle, DollarSign, ArrowRight, Info } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

interface Props {
  onOpenOrders?: () => void;
}

/**
 * Convert an amount from one currency to another using USD as base.
 * rates: map of currencyCode -> rate from USD (e.g. NGN: 1650 means 1 USD = 1650 NGN)
 * We first convert source -> USD, then USD -> target.
 */
function convertBetween(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  // Symbols like "$" -> "USD", other symbols could exist too. Try to normalize.
  const symbolToCode: Record<string, string> = {
    "$": "USD", "USD": "USD",
    "\u20AC": "EUR", "EUR": "EUR",
    "\u00A3": "GBP", "GBP": "GBP",
    "\u20A6": "NGN", "NGN": "NGN",
    "\u20B5": "GHS", "GHS": "GHS",
    "FCFA": "XOF", "XOF": "XOF",
    "KSh": "KES", "KES": "KES",
    "R": "ZAR", "ZAR": "ZAR",
  };
  const fromCode = symbolToCode[from] || from;
  const toCode = symbolToCode[to] || to;
  if (fromCode === toCode) return amount;

  const fromRate = fromCode === "USD" ? 1 : (rates[fromCode] || 0);
  const toRate = toCode === "USD" ? 1 : (rates[toCode] || 0);
  if (!fromRate || !toRate) return amount; // fallback: return raw if rate missing

  const inUsd = amount / fromRate;
  return inUsd * toRate;
}

function formatMoney(amount: number, code: string): string {
  const info = CURRENCIES[code as CurrencyCode];
  const symbol = info?.symbol || code;
  const decimals = info?.decimals ?? 0;
  const rounded = amount.toFixed(decimals);
  const numStr = Number(rounded).toLocaleString();
  if (info?.position === "right") return numStr + " " + symbol;
  return symbol + numStr;
}

export default function DashboardOrderStats({ onOpenOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency: displayCurrency, rates } = useCurrency();

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-100 rounded mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const total = orders.length;
  const pending = orders.filter(o => o.status === "pending").length;
  const shipped = orders.filter(o => o.status === "shipped" || o.status === "delivered").length;

  // This month = all orders except cancelled
  const now = new Date();
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth()
      && d.getFullYear() === now.getFullYear()
      && o.status !== "cancelled";
  });

  // Sum converted to display currency
  const totalConverted = thisMonthOrders.reduce((sum, o) => {
    const val = parseFloat(o.total) || 0;
    const cur = (o.currency || "USD").trim();
    return sum + convertBetween(val, cur, displayCurrency, rates);
  }, 0);

  // Also compute raw currency mix for tooltip breakdown
  const revenueByCurrency = thisMonthOrders.reduce((acc, o) => {
    const cur = (o.currency || "USD").trim() || "USD";
    const val = parseFloat(o.total) || 0;
    acc[cur] = (acc[cur] || 0) + val;
    return acc;
  }, {} as Record<string, number>);
  const currencyEntries = Object.entries(revenueByCurrency).sort((a, b) => b[1] - a[1]);
  const thisMonthCount = thisMonthOrders.length;
  const hasMultipleCurrencies = currencyEntries.length > 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Orders Overview</h3>
            <p className="text-xs text-gray-500">Sales metrics and pending actions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenOrders}
          className="text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <ShoppingCart className="w-3.5 h-3.5" /> Total
          </div>
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">All orders</div>
        </button>

        <button
          onClick={onOpenOrders}
          className="text-left p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition"
        >
          <div className="flex items-center gap-2 text-orange-600 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" /> Pending
          </div>
          <div className="text-2xl font-bold text-orange-700">{pending}</div>
          <div className="text-[11px] text-orange-600 mt-0.5">{pending > 0 ? "Needs action" : "All caught up"}</div>
        </button>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5" /> Shipped
          </div>
          <div className="text-2xl font-bold">{shipped}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Fulfilled</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl group relative">
          <div className="flex items-center gap-2 text-green-700 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            This Month
            {hasMultipleCurrencies && (
              <Info className="w-3 h-3 text-green-600 opacity-70" />
            )}
          </div>
          {thisMonthCount === 0 ? (
            <>
              <div className="text-2xl font-bold text-green-700">-</div>
              <div className="text-[11px] text-green-600 mt-0.5">No orders this month</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-green-700 leading-tight">
                {formatMoney(totalConverted, displayCurrency)}
              </div>
              <div className="text-[11px] text-green-600 mt-0.5">
                {thisMonthCount} {thisMonthCount === 1 ? "order" : "orders"}
                {hasMultipleCurrencies && " - converted"}
              </div>

              {/* Tooltip on hover showing raw currency breakdown */}
              {hasMultipleCurrencies && (
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl min-w-[180px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Raw amounts
                    </div>
                    <div className="space-y-1">
                      {currencyEntries.map(([cur, amt]) => (
                        <div key={cur} className="flex items-center justify-between gap-3">
                          <span className="text-gray-300">{cur}</span>
                          <span className="font-mono font-semibold">
                            {Number(amt.toFixed(2)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-400">
                      Converted using live rates
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {onOpenOrders && total > 0 && (
        <button
          onClick={onOpenOrders}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition text-sm text-gray-700 group"
        >
          <span className="font-medium">Manage all orders</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
