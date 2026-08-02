"use client";

import { useState, useEffect } from "react";
import type { Order } from "@/db/schema";
import { ShoppingCart, Clock, CheckCircle, DollarSign, ArrowRight } from "lucide-react";

interface Props {
  onOpenOrders?: () => void;
}

// Format currency: symbol comes from order.currency which is already the display symbol ($ / GHS / NGN / etc.)
function formatMoney(amount: number, symbol: string): string {
  const rounded = amount.toFixed(0);
  // Currencies with symbol on left vs right
  const symbolLeft = ["$", "€", "£", "₦", "₵", "R", "KSh"];
  if (symbolLeft.includes(symbol)) {
    return symbol + Number(rounded).toLocaleString();
  }
  // Codes like GHS, NGN, FCFA, USD etc. go on the right
  return Number(rounded).toLocaleString() + " " + symbol;
}

export default function DashboardOrderStats({ onOpenOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Revenue this month = ALL orders except cancelled (option A)
  const now = new Date();
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth()
      && d.getFullYear() === now.getFullYear()
      && o.status !== "cancelled";
  });

  // Group by currency (option 1) - accurate, no fake conversions
  const revenueByCurrency = thisMonthOrders.reduce((acc, o) => {
    const cur = (o.currency || "$").trim() || "$";
    const val = parseFloat(o.total) || 0;
    acc[cur] = (acc[cur] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const currencyEntries = Object.entries(revenueByCurrency).sort((a, b) => b[1] - a[1]);
  const currencyCount = currencyEntries.length;
  const thisMonthCount = thisMonthOrders.length;

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

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <div className="flex items-center gap-2 text-green-700 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" /> This Month
          </div>
          {currencyEntries.length === 0 ? (
            <>
              <div className="text-2xl font-bold text-green-700">-</div>
              <div className="text-[11px] text-green-600 mt-0.5">No orders yet</div>
            </>
          ) : currencyEntries.length === 1 ? (
            <>
              <div className="text-2xl font-bold text-green-700 leading-tight">
                {formatMoney(currencyEntries[0][1], currencyEntries[0][0])}
              </div>
              <div className="text-[11px] text-green-600 mt-0.5">
                {thisMonthCount} {thisMonthCount === 1 ? "order" : "orders"}
              </div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-green-700 leading-tight">
                {formatMoney(currencyEntries[0][1], currencyEntries[0][0])}
              </div>
              <div className="text-[10px] text-green-700 font-semibold mt-1 leading-snug space-y-0.5">
                {currencyEntries.slice(1).map(([cur, amt]) => (
                  <div key={cur}>+ {formatMoney(amt, cur)}</div>
                ))}
              </div>
              <div className="text-[10px] text-green-600 mt-1">
                {thisMonthCount} {thisMonthCount === 1 ? "order" : "orders"} - {currencyCount} currencies
              </div>
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
