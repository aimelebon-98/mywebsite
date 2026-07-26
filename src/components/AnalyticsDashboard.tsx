"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, Eye, ShoppingCart, MousePointerClick, Heart, Mail, Search, TrendingUp, TrendingDown, Minus, Download, RefreshCw, Package, BookOpen, ExternalLink } from "lucide-react";

interface Kpis {
  totalEvents: number;
  uniqueVisitors: number;
  pageViews: number;
  productViews: number;
  addToCarts: number;
  checkoutClicks: number;
  wishlistAdds: number;
  newsletterSignups: number;
  searches: number;
  blogViews: number;
}

interface AnalyticsData {
  ok: boolean;
  days: number;
  periodLabel: string;
  previousLabel: string;
  kpis: Kpis;
  previousKpis: Kpis;
  changes: Record<string, number>;
  timeline: Array<{ date: string; visits: number; carts: number; checkouts: number }>;
  topProducts: Array<{ id: string; name: string; views: number; carts: number; checkouts: number }>;
  topPosts: Array<{ id: string; name: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
  topReferrers: Array<{ domain: string; count: number }>;
  topPages: Array<{ path: string; views: number }>;
  funnel: {
    visitors: number;
    productViews: number;
    addToCarts: number;
    checkoutClicks: number;
    cartRate: number;
    checkoutRate: number;
  };
}

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
];

function ChangeBadge({ change }: { change: number }) {
  if (!isFinite(change)) return null;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isZero = change === 0;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const bgColor = isPositive ? "bg-emerald-50" : isNegative ? "bg-red-50" : "bg-gray-100";
  const textColor = isPositive ? "text-emerald-700" : isNegative ? "text-red-700" : "text-gray-600";

  const display = Math.abs(change) >= 999 ? "999+" : Math.abs(change).toFixed(0);

  return (
    <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${bgColor} ${textColor}`}>
      <Icon className="w-3 h-3" />
      {isZero ? "0" : `${display}%`}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);
  const [liveMode, setLiveMode] = useState(false);
  const [liveData, setLiveData] = useState<{ activeVisitors: number; recentEvents: Array<{ eventType: string; path: string; productName?: string | null; searchQuery?: string | null; createdAt: string; visitorId: string }> } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${range}`);
      const json = await res.json();
      setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [range]);

  useEffect(() => {
    if (!liveMode) return;
    const fetchLive = async () => {
      try {
        const res = await fetch("/api/admin/analytics?live=1");
        const j = await res.json();
        if (j.ok) setLiveData(j);
      } catch { /* ignore */ }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => clearInterval(interval);
  }, [liveMode]);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Metric", data.periodLabel, data.previousLabel, "Change %"],
      ["Unique Visitors", data.kpis.uniqueVisitors, data.previousKpis.uniqueVisitors, data.changes.uniqueVisitors?.toFixed(1) + "%"],
      ["Page Views", data.kpis.pageViews, data.previousKpis.pageViews, data.changes.pageViews?.toFixed(1) + "%"],
      ["Product Views", data.kpis.productViews, data.previousKpis.productViews, data.changes.productViews?.toFixed(1) + "%"],
      ["Add to Cart", data.kpis.addToCarts, data.previousKpis.addToCarts, data.changes.addToCarts?.toFixed(1) + "%"],
      ["Checkout Clicks", data.kpis.checkoutClicks, data.previousKpis.checkoutClicks, data.changes.checkoutClicks?.toFixed(1) + "%"],
      ["Wishlist Adds", data.kpis.wishlistAdds, data.previousKpis.wishlistAdds, data.changes.wishlistAdds?.toFixed(1) + "%"],
      ["Newsletter", data.kpis.newsletterSignups, data.previousKpis.newsletterSignups, data.changes.newsletterSignups?.toFixed(1) + "%"],
      ["Blog Views", data.kpis.blogViews, data.previousKpis.blogViews, data.changes.blogViews?.toFixed(1) + "%"],
      [],
      ["Top Products", "Views", "Carts", "Checkouts"],
      ...data.topProducts.map(p => [p.name, p.views, p.carts, p.checkouts]),
      [],
      ["Top Search Terms", "Count"],
      ...data.topSearches.map(s => [s.query, s.count]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${range}days-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxVisits = Math.max(1, ...(data?.timeline.map(t => t.visits) || [1]));

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-gray-500">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
        Loading analytics...
      </div>
    );
  }

  if (!data || !data.ok) {
    return (
      <div className="p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="font-bold text-gray-900 mb-2">Analytics not ready</h3>
        <p className="text-sm text-gray-500 mb-4">
          Run the migration first: <code className="bg-gray-100 px-2 py-0.5 rounded">/api/admin/migrate-analytics</code>
        </p>
      </div>
    );
  }

  const kpiCards: Array<{ label: string; key: keyof Kpis; icon: typeof Users; color: string }> = [
    { label: "Unique Visitors", key: "uniqueVisitors", icon: Users, color: "bg-blue-500" },
    { label: "Page Views", key: "pageViews", icon: Eye, color: "bg-purple-500" },
    { label: "Product Views", key: "productViews", icon: Package, color: "bg-emerald-500" },
    { label: "Add to Cart", key: "addToCarts", icon: ShoppingCart, color: "bg-amber-500" },
    { label: "Checkout Clicks", key: "checkoutClicks", icon: MousePointerClick, color: "bg-[#CA3F2E]" },
    { label: "Wishlist Adds", key: "wishlistAdds", icon: Heart, color: "bg-pink-500" },
    { label: "Newsletter", key: "newsletterSignups", icon: Mail, color: "bg-indigo-500" },
    { label: "Blog Views", key: "blogViews", icon: BookOpen, color: "bg-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#CA3F2E]" />
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="font-semibold text-gray-700">{data.periodLabel}</span> vs <span className="text-gray-500">{data.previousLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  range === r.days ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${liveMode ? "bg-emerald-500 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <span className="relative flex h-2 w-2">
              {liveMode && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${liveMode ? "bg-white" : "bg-gray-400"}`} />
            </span>
            {liveMode ? "LIVE" : "Go Live"}
          </button>
          <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-[#CA3F2E] transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Grid with comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map(kpi => {
          const Icon = kpi.icon;
          const value = data.kpis[kpi.key];
          const prevValue = data.previousKpis[kpi.key];
          const change = data.changes[kpi.key] || 0;
          return (
            <div key={kpi.key} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 ${kpi.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <ChangeBadge change={change} />
              </div>
              <div className="text-2xl font-black text-gray-900">{value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-medium mb-1">{kpi.label}</div>
              <div className="text-[10px] text-gray-400">
                vs <span className="font-semibold">{prevValue.toLocaleString()}</span> {data.previousLabel.toLowerCase()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Activity Feed - only shown when live mode is ON */}
      {liveMode && liveData && (
        <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h3 className="font-black text-lg">LIVE</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black">{liveData.activeVisitors}</div>
              <div className="text-xs text-gray-400">active now (last 5 min)</div>
            </div>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
            {liveData.recentEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No activity yet. Refreshing every 10s...</p>
            ) : (
              liveData.recentEvents.map((e, i) => {
                const time = new Date(e.createdAt);
                const secAgo = Math.max(0, Math.floor((Date.now() - time.getTime()) / 1000));
                const ago = secAgo < 60 ? `${secAgo}s ago` : `${Math.floor(secAgo / 60)}m ago`;
                const labelMap: Record<string, string> = {
                  page_view: "viewed",
                  product_view: "viewed product",
                  add_to_cart: "added to cart",
                  checkout_click: "clicked checkout",
                  wishlist_add: "added to wishlist",
                  newsletter_signup: "subscribed",
                  search: "searched",
                  blog_view: "read blog",
                };
                const label = labelMap[e.eventType] || e.eventType;
                const target = e.productName || e.searchQuery || e.path;
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-400">Visitor {e.visitorId}</span>
                      <span className="text-white mx-1">{label}</span>
                      {target && <span className="text-emerald-400 font-mono text-xs truncate">{target}</span>}
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0">{ago}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#CA3F2E]" />
          Conversion Funnel <span className="text-xs font-normal text-gray-400">({data.periodLabel})</span>
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Visitors", value: data.funnel.visitors, color: "bg-blue-500" },
            { label: "Product Views", value: data.funnel.productViews, color: "bg-purple-500" },
            { label: "Add to Cart", value: data.funnel.addToCarts, color: "bg-amber-500" },
            { label: "Checkout", value: data.funnel.checkoutClicks, color: "bg-[#CA3F2E]" },
          ].map((step, idx, arr) => {
            const pct = idx === 0 ? 100 : arr[0].value > 0 ? (step.value / arr[0].value * 100) : 0;
            return (
              <div key={step.label} className="text-center">
                <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden flex items-end justify-center pb-2">
                  <div className={`absolute bottom-0 left-0 right-0 ${step.color} transition-all duration-700`} style={{ height: `${pct}%` }} />
                  <div className="relative text-white font-black text-lg">{step.value}</div>
                </div>
                <div className="mt-2 text-xs font-semibold text-gray-900">{step.label}</div>
                <div className="text-[10px] text-gray-500">{pct.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-amber-50 rounded-xl">
            <div className="text-xs text-amber-700 font-semibold">View → Cart</div>
            <div className="text-lg font-black text-amber-900">{data.funnel.cartRate.toFixed(1)}%</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <div className="text-xs text-red-700 font-semibold">Cart → Checkout</div>
            <div className="text-lg font-black text-red-900">{data.funnel.checkoutRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Timeline Chart - proper stacked bars */}
      {data.timeline.length > 0 && (() => {
        // Calculate max STACKED value (visits + carts + checkouts per day) for accurate scaling
        const maxStacked = Math.max(1, ...data.timeline.map(t => t.visits + t.carts + t.checkouts));
        const CHART_HEIGHT = 240;
        return (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Activity Over Time</h3>
              <div className="text-xs text-gray-500">{data.timeline.length} day{data.timeline.length > 1 ? "s" : ""}</div>
            </div>

            {/* Y axis + chart area */}
            <div className="relative flex" style={{ height: `${CHART_HEIGHT}px` }}>
              {/* Y-axis labels */}
              <div className="w-10 flex flex-col justify-between text-[10px] text-gray-400 py-1 text-right pr-2">
                <span>{maxStacked}</span>
                <span>{Math.round(maxStacked * 0.75)}</span>
                <span>{Math.round(maxStacked * 0.5)}</span>
                <span>{Math.round(maxStacked * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="relative flex-1">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="border-t border-gray-100 w-full" />
                  ))}
                </div>

                {/* Bars */}
                <div className="relative flex items-end gap-1 sm:gap-2 h-full">
                  {data.timeline.map(t => {
                    const totalDay = t.visits + t.carts + t.checkouts;
                    const totalPct = (totalDay / maxStacked) * 100;
                    const visitsPct = totalDay > 0 ? (t.visits / totalDay) * totalPct : 0;
                    const cartsPct = totalDay > 0 ? (t.carts / totalDay) * totalPct : 0;
                    const checkoutsPct = totalDay > 0 ? (t.checkouts / totalDay) * totalPct : 0;
                    return (
                      <div key={t.date} className="flex-1 h-full flex flex-col justify-end group relative min-w-0">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-[11px] px-3 py-2 rounded-lg whitespace-nowrap z-20 transition shadow-lg pointer-events-none">
                          <div className="font-bold mb-1">{t.date}</div>
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Visits: <span className="font-bold">{t.visits}</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Carts: <span className="font-bold">{t.carts}</span></div>
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#CA3F2E]" />Checkouts: <span className="font-bold">{t.checkouts}</span></div>
                        </div>

                        {/* Stacked bar */}
                        <div className="w-full flex flex-col justify-end rounded-t overflow-hidden group-hover:opacity-100 transition-all duration-200" style={{ height: "100%" }}>
                          {/* Checkouts on TOP */}
                          {t.checkouts > 0 && (
                            <div className="w-full bg-gradient-to-b from-[#CA3F2E] to-[#8B2A1E] hover:brightness-110 transition" style={{ height: `${checkoutsPct}%`, minHeight: "3px" }} />
                          )}
                          {/* Carts middle */}
                          {t.carts > 0 && (
                            <div className="w-full bg-gradient-to-b from-amber-400 to-amber-500 hover:brightness-110 transition" style={{ height: `${cartsPct}%`, minHeight: "3px" }} />
                          )}
                          {/* Visits bottom */}
                          {t.visits > 0 && (
                            <div className="w-full bg-gradient-to-b from-blue-400 to-blue-500 hover:brightness-110 transition rounded-b" style={{ height: `${visitsPct}%`, minHeight: "3px" }} />
                          )}
                          {/* Empty state - subtle placeholder */}
                          {totalDay === 0 && (
                            <div className="w-full bg-gray-100 rounded-t" style={{ height: "4px" }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* X-axis dates */}
            <div className="ml-10 mt-2 flex items-center gap-1 sm:gap-2">
              {data.timeline.map((t, i) => {
                const showLabel = data.timeline.length <= 14 || i % Math.ceil(data.timeline.length / 10) === 0;
                const date = new Date(t.date);
                const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                return (
                  <div key={t.date} className="flex-1 text-center min-w-0">
                    {showLabel && <span className="text-[10px] text-gray-500 truncate">{label}</span>}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-b from-blue-400 to-blue-500" />
                <span className="text-gray-700 font-semibold">Visits</span>
                <span className="text-gray-400">({data.timeline.reduce((s, t) => s + t.visits, 0)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-b from-amber-400 to-amber-500" />
                <span className="text-gray-700 font-semibold">Carts</span>
                <span className="text-gray-400">({data.timeline.reduce((s, t) => s + t.carts, 0)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gradient-to-b from-[#CA3F2E] to-[#8B2A1E]" />
                <span className="text-gray-700 font-semibold">Checkouts</span>
                <span className="text-gray-400">({data.timeline.reduce((s, t) => s + t.checkouts, 0)})</span>
              </span>
            </div>
          </div>
        );
      })()}

      {/* Top Products + Top Blog */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#CA3F2E]" /> Top Products
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No product activity yet</p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.slice(0, 8).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.views} views &middot; {p.carts} carts &middot; {p.checkouts} checkouts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#CA3F2E]" /> Top Blog Posts
          </h3>
          {data.topPosts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No blog activity yet</p>
          ) : (
            <div className="space-y-2">
              {data.topPosts.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Searches + Referrers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#CA3F2E]" /> Top Search Terms
          </h3>
          {data.topSearches.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No searches yet</p>
          ) : (
            <div className="space-y-2">
              {data.topSearches.map(s => (
                <div key={s.query} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">&quot;{s.query}&quot;</span>
                  <span className="text-xs font-bold text-[#CA3F2E]">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-[#CA3F2E]" /> Top Referrers
          </h3>
          {data.topReferrers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">All direct traffic so far</p>
          ) : (
            <div className="space-y-2">
              {data.topReferrers.map(r => (
                <div key={r.domain} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{r.domain}</span>
                  <span className="text-xs font-bold text-[#CA3F2E]">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#CA3F2E]" /> Top Pages
        </h3>
        {data.topPages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No page views yet</p>
        ) : (
          <div className="space-y-1">
            {data.topPages.map((p, idx) => {
              const pct = data.topPages[0].views > 0 ? (p.views / data.topPages[0].views * 100) : 0;
              return (
                <div key={p.path} className="flex items-center gap-3 py-2">
                  <div className="w-6 text-xs font-bold text-gray-400">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs text-gray-700 truncate">{p.path}</code>
                      <span className="text-xs font-bold text-gray-900 ml-2">{p.views}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#CA3F2E] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Comparisons show {data.periodLabel.toLowerCase()} vs {data.previousLabel.toLowerCase()}. Bots filtered automatically.
      </p>
    </div>
  );
}
