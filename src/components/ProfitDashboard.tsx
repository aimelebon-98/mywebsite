"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, Percent } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES } from "@/lib/currency";
import CountryFlag, { currencyToCountry } from "@/components/CountryFlag";

interface Metric {
  ordersCount: number;
  units: number;
  revenueUsd: number;
  costUsd: number;
  profitUsd: number;
  marginPct: number;
  vsPrev?: { orders: number; units: number; revenue: number; profit: number };
}

interface Seller {
  id: string;
  name: string;
  imageUrl: string;
  units: number;
  revenueUsd: number;
  profitUsd: number;
  marginPct?: number;
}

interface Daily {
  date: string;
  revenueUsd: number;
  profitUsd: number;
  orders: number;
}

interface Data {
  usdToNgn: number;
  rateSource: string;
  periods: {
    today: Metric;
    yesterday: Metric;
    thisWeek: Metric;
    lastWeek: Metric;
    thisMonth: Metric;
    lastMonth: Metric;
  };
  topSellers: Seller[];
  topMargins: Seller[];
  daily: Daily[];
}

function ChangeBadge({ pct }: { pct?: number }) {
  if (pct === undefined || pct === null || !isFinite(pct)) return null;
  const positive = pct >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${positive ? "text-green-600" : "text-red-600"}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function MetricCard({
  title,
  current,
  previous,
  previousLabel,
  formatMoney,
}: {
  title: string;
  current: Metric;
  previous: Metric;
  previousLabel: string;
  formatMoney: (usd: number) => string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShoppingBag className="w-3.5 h-3.5" />Orders
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black">{current.ordersCount}</span>
            <ChangeBadge pct={current.vsPrev?.orders} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Package className="w-3.5 h-3.5" />Units sold
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black">{current.units}</span>
            <ChangeBadge pct={current.vsPrev?.units} />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <DollarSign className="w-3.5 h-3.5" />Revenue
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black">{formatMoney(current.revenueUsd)}</span>
            <ChangeBadge pct={current.vsPrev?.revenue} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">Cost</div>
          <span className="text-sm font-semibold text-red-600">-{formatMoney(current.costUsd)}</span>
        </div>
        <div className="flex items-center justify-between bg-green-50 -mx-5 px-5 py-3 border-t border-b border-green-100">
          <div className="text-xs font-bold text-green-900 uppercase">Profit</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-green-700">{formatMoney(current.profitUsd)}</span>
            <ChangeBadge pct={current.vsPrev?.profit} />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Percent className="w-3 h-3" />Margin
          </div>
          <span className="font-semibold text-gray-700">{current.marginPct.toFixed(1)}%</span>
        </div>
        <div className="text-[10px] text-gray-400 text-center pt-1">
          vs {previousLabel}: {formatMoney(previous.profitUsd)} profit
        </div>
      </div>
    </div>
  );
}

function MiniChart({ data, formatMoney }: { data: Daily[]; formatMoney: (usd: number) => string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Math.max(d.revenueUsd, d.profitUsd)), 1);
  const W = 800;
  const H = 200;
  const step = W / (data.length - 1 || 1);

  const pathRev = data.map((d, i) => `${i === 0 ? "M" : "L"}${i * step},${H - (d.revenueUsd / max) * (H - 20) - 10}`).join(" ");
  const pathProf = data.map((d, i) => `${i === 0 ? "M" : "L"}${i * step},${H - (d.profitUsd / max) * (H - 20) - 10}`).join(" ");

  const totalRev = data.reduce((s, d) => s + d.revenueUsd, 0);
  const totalProf = data.reduce((s, d) => s + d.profitUsd, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bold text-base">30-Day Trend</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-gray-900"></span>
            Revenue ({formatMoney(totalRev)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-green-600"></span>
            Profit ({formatMoney(totalProf)})
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
        <path d={pathRev} fill="none" stroke="#111827" strokeWidth="2" />
        <path d={pathProf} fill="none" stroke="#059669" strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-2">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export default function ProfitDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currency, format: formatPrice } = useCurrency();
  const info = CURRENCIES[currency];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/analytics/profit");
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed to load");
        setData(j);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data) return null;

  // formatPrice from useCurrency takes USD input and returns formatted target-currency string
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black mb-1">Profit & Sales Analytics</h1>
          <p className="text-sm text-gray-500">
            Live margin tracking. Displaying in <strong className="text-gray-900">{info.name} ({currency})</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <CountryFlag country={currencyToCountry(currency)} className="w-5 h-3.5 rounded-sm" title={currency} />
          <span className="text-gray-500">Rate: 1 USD =</span>
          <strong className="text-gray-900">
            {(() => {
              const raw = currency === "USD" ? 1 : (data && data.usdToNgn && currency === "NGN" ? data.usdToNgn : null);
              if (raw !== null) {
                return info.symbol + raw.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
              }
              // For other currencies, use formatPrice but with a higher precision hint
              return formatPrice(1);
            })()}
          </strong>
          <span className="text-green-600 font-semibold ml-1">(live)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard title="Today" current={data.periods.today} previous={data.periods.yesterday} previousLabel="yesterday" formatMoney={formatPrice} />
        <MetricCard title="This Week" current={data.periods.thisWeek} previous={data.periods.lastWeek} previousLabel="last week" formatMoney={formatPrice} />
        <MetricCard title="This Month" current={data.periods.thisMonth} previous={data.periods.lastMonth} previousLabel="last month" formatMoney={formatPrice} />
      </div>

      <MiniChart data={data.daily} formatMoney={formatPrice} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold">Top 5 Best Sellers (this month)</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.topSellers.length === 0 && <div className="p-5 text-sm text-gray-400">No sales yet this month.</div>}
            {data.topSellers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="w-6 text-center font-black text-gray-300">{i + 1}</div>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.units} sold</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-700">{formatPrice(p.profitUsd)}</div>
                  <div className="text-[10px] text-gray-400">profit</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold">Top 5 Highest Margin (this month)</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.topMargins.length === 0 && <div className="p-5 text-sm text-gray-400">No sales yet this month.</div>}
            {data.topMargins.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="w-6 text-center font-black text-gray-300">{i + 1}</div>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.units} sold - {formatPrice(p.revenueUsd)} rev</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-600">{(p.marginPct || 0).toFixed(1)}%</div>
                  <div className="text-[10px] text-gray-400">margin</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}