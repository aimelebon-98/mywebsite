"use client";

import { useEffect, useState } from "react";
import { markAsInternalUser, unmarkInternalUser, resetVisitorId, checkInternalStatus } from "@/components/AnalyticsTracker";
import { BarChart3, Users, Eye, ShoppingCart, MousePointerClick, Heart, Mail, Search, TrendingUp, TrendingDown, Minus, Download, RefreshCw, Package, BookOpen, ExternalLink , UserX, Trash2, ShieldCheck } from "lucide-react";
import TopCountriesMap from "./TopCountriesMap";

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
  topCountries: Array<{ code: string; visitors: number }>;
  topCities: Array<{ city: string; country: string; visitors: number }>;
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
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [liveData, setLiveData] = useState<{ activeVisitors: number; recentEvents: Array<{ eventType: string; path: string; productName?: string | null; searchQuery?: string | null; createdAt: string; visitorId: string }> } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = customMode && customStart && customEnd
        ? `/api/admin/analytics?startDate=${customStart}&endDate=${customEnd}`
        : `/api/admin/analytics?days=${range}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [range, customMode, customStart, customEnd]);

  useEffect(() => { setIsInternal(checkInternalStatus()); }, []);

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
                onClick={() => { setRange(r.days); setCustomMode(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  (!customMode && range === r.days) ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
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

      {/* Admin Analytics Controls */}
      <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-amber-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 mb-1">Admin Analytics Controls</h4>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {isInternal
                ? "You are marked as an internal user - your visits will NOT be tracked."
                : "Your browser is being counted as a regular visitor. Mark yourself as internal to exclude your own activity from stats."}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {!isInternal ? (
                <button
                  onClick={() => { markAsInternalUser(); setIsInternal(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition"
                >
                  <UserX className="w-3.5 h-3.5" /> Mark me as internal
                </button>
              ) : (
                <button
                  onClick={() => { unmarkInternalUser(); setIsInternal(false); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition"
                >
                  Unmark internal
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Reset your visitor ID? You will start counting as a new visitor.")) {
                    resetVisitorId();
                    alert("Visitor ID reset. Refresh public pages to start fresh.");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition"
              >
                Reset my visitor ID
              </button>
              <button
                onClick={async () => {
                  if (!confirm("DELETE ALL analytics data? This cannot be undone. Use to clear test data.")) return;
                  try {
                    const res = await fetch("/api/admin/analytics-control?mode=all", { method: "DELETE" });
                    const j = await res.json();
                    if (j.ok) {
                      alert("All analytics data cleared!");
                      load();
                    } else {
                      alert("Failed: " + j.error);
                    }
                  } catch { alert("Failed to clear"); }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all analytics
              </button>
            </div>
          </div>
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
            <button
              onClick={() => setShowCustomPicker(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                customMode ? "bg-orange-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              title="Custom date range"
            >
              <Calendar className="w-3 h-3" />
              Custom
            </button>
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
            <div className="text-xs text-amber-700 font-semibold">View ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Cart</div>
            <div className="text-lg font-black text-amber-900">{data.funnel.cartRate.toFixed(1)}%</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <div className="text-xs text-red-700 font-semibold">Cart ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Checkout</div>
            <div className="text-lg font-black text-red-900">{data.funnel.checkoutRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Timeline Chart - Smooth SVG line chart */}
      {data.timeline.length > 0 && (() => {
        const CHART_W = 800;
        const CHART_H = 240;
        const PAD_L = 40;
        const PAD_R = 20;
        const PAD_T = 20;
        const PAD_B = 30;
        const innerW = CHART_W - PAD_L - PAD_R;
        const innerH = CHART_H - PAD_T - PAD_B;
        const n = data.timeline.length;

        const maxVal = Math.max(1,
          ...data.timeline.map(t => Math.max(t.visits, t.carts, t.checkouts))
        );

        // Convert data point to SVG coordinate
        const xAt = (i: number) => PAD_L + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
        const yAt = (v: number) => PAD_T + innerH - (v / maxVal) * innerH;

        // Cardinal spline / Catmull-Rom for smooth curves
        function buildSmoothPath(values: number[]): string {
          if (values.length === 0) return "";
          // Single point - draw a tiny visible horizontal line so it renders
          if (values.length === 1) {
            const x = xAt(0);
            const y = yAt(values[0]);
            return `M ${x - 2} ${y} L ${x + 2} ${y}`;
          }

          let path = `M ${xAt(0)} ${yAt(values[0])}`;
          for (let i = 0; i < values.length - 1; i++) {
            const x0 = xAt(Math.max(0, i - 1));
            const y0 = yAt(values[Math.max(0, i - 1)]);
            const x1 = xAt(i);
            const y1 = yAt(values[i]);
            const x2 = xAt(i + 1);
            const y2 = yAt(values[i + 1]);
            const x3 = xAt(Math.min(values.length - 1, i + 2));
            const y3 = yAt(values[Math.min(values.length - 1, i + 2)]);

            const cp1x = x1 + (x2 - x0) / 6;
            const cp1y = y1 + (y2 - y0) / 6;
            const cp2x = x2 - (x3 - x1) / 6;
            const cp2y = y2 - (y3 - y1) / 6;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
          }
          return path;
        }

        function buildAreaPath(values: number[]): string {
          const linePath = buildSmoothPath(values);
          if (!linePath) return "";
          return `${linePath} L ${xAt(n - 1)} ${PAD_T + innerH} L ${xAt(0)} ${PAD_T + innerH} Z`;
        }

        const visitsPath = buildSmoothPath(data.timeline.map(t => t.visits));
        const cartsPath = buildSmoothPath(data.timeline.map(t => t.carts));
        const checkoutsPath = buildSmoothPath(data.timeline.map(t => t.checkouts));
        const visitsArea = buildAreaPath(data.timeline.map(t => t.visits));

        const yTicks = 4;
        const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxVal * (yTicks - i)) / yTicks));

        return (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Activity Over Time</h3>
              <div className="text-xs text-gray-500">{data.timeline.length} day{data.timeline.length > 1 ? "s" : ""}</div>
            </div>

            <div className="relative w-full overflow-x-auto">
              <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto" style={{ minHeight: `${CHART_H}px`, minWidth: n > 14 ? `${n * 50}px` : "auto" }}>
                <defs>
                  <linearGradient id="visitsGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines + Y-axis labels */}
                {yLabels.map((label, i) => {
                  const y = PAD_T + (i / yTicks) * innerH;
                  return (
                    <g key={i}>
                      <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{label}</text>
                    </g>
                  );
                })}

                {/* Visits area fill */}
                {visitsArea && <path d={visitsArea} fill="url(#visitsGrad)" />}

                {/* Lines */}
                {visitsPath && (
                  <path d={visitsPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {cartsPath && (
                  <path d={cartsPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {checkoutsPath && (
                  <path d={checkoutsPath} fill="none" stroke="#CA3F2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Data points + hover tooltips */}
                {data.timeline.map((t, i) => {
                  const x = xAt(i);
                  const dateLabel = new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  const showLabel = n <= 14 || i % Math.ceil(n / 10) === 0;
                  return (
                    <g key={t.date} className="group">
                      {/* Invisible hover zone */}
                      <rect x={x - 20} y={PAD_T} width="40" height={innerH} fill="transparent" className="cursor-pointer" />

                      {/* Hover vertical line */}
                      <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + innerH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {/* Points */}
                      <circle cx={x} cy={yAt(t.visits)} r={n <= 2 ? 5 : 3} fill="#3b82f6" className={`${n <= 2 ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity pointer-events-none`} />
                      <circle cx={x} cy={yAt(t.carts)} r={n <= 2 ? 5 : 3} fill="#f59e0b" className={`${n <= 2 ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity pointer-events-none`} />
                      <circle cx={x} cy={yAt(t.checkouts)} r={n <= 2 ? 5 : 3} fill="#CA3F2E" className={`${n <= 2 ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity pointer-events-none`} />

                      {/* Tooltip */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <rect x={x + 8} y={PAD_T + 4} width="110" height="70" rx="6" fill="#111827" />
                        <text x={x + 16} y={PAD_T + 20} fontSize="10" fill="#fff" fontWeight="700">{dateLabel}</text>
                        <circle cx={x + 18} cy={PAD_T + 32} r="3" fill="#3b82f6" />
                        <text x={x + 26} y={PAD_T + 35} fontSize="10" fill="#e5e7eb">Visits: {t.visits}</text>
                        <circle cx={x + 18} cy={PAD_T + 47} r="3" fill="#f59e0b" />
                        <text x={x + 26} y={PAD_T + 50} fontSize="10" fill="#e5e7eb">Carts: {t.carts}</text>
                        <circle cx={x + 18} cy={PAD_T + 62} r="3" fill="#CA3F2E" />
                        <text x={x + 26} y={PAD_T + 65} fontSize="10" fill="#e5e7eb">Checkouts: {t.checkouts}</text>
                      </g>

                      {/* X-axis date label */}
                      {showLabel && (
                        <text x={x} y={CHART_H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{dateLabel}</text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-700 font-semibold">Visits</span>
                <span className="text-gray-400">({data.timeline.reduce((s, t) => s + t.visits, 0)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-700 font-semibold">Carts</span>
                <span className="text-gray-400">({data.timeline.reduce((s, t) => s + t.carts, 0)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#CA3F2E]" />
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
      {((data.topCountries?.length ?? 0) > 0 || (data.topCities?.length ?? 0) > 0) && <TopCountriesMap countries={data.topCountries || []} cities={data.topCities || []} />}

      {/* Custom Date Range Modal */}
      {showCustomPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCustomPicker(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Custom Date Range
              </h3>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                {"\u00d7"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  max={customEnd || new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  min={customStart}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 w-full">Quick select:</span>
                {[
                  { label: "Yesterday", days: 1, offset: 1 },
                  { label: "Last 7 days", days: 7, offset: 1 },
                  { label: "Last 14 days", days: 14, offset: 1 },
                  { label: "Last month", days: 30, offset: 1 },
                  { label: "This month", days: -1, offset: 0 },
                  { label: "Last 90 days", days: 90, offset: 1 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      let start: Date;
                      let end: Date;
                      if (preset.days === -1) {
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                        end = now;
                      } else {
                        end = new Date(now);
                        end.setDate(end.getDate() - preset.offset);
                        start = new Date(end);
                        start.setDate(start.getDate() - preset.days + 1);
                      }
                      setCustomStart(start.toISOString().slice(0, 10));
                      setCustomEnd(end.toISOString().slice(0, 10));
                    }}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-md transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setCustomMode(false);
                  setCustomStart("");
                  setCustomEnd("");
                  setShowCustomPicker(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  if (customStart && customEnd) {
                    setCustomMode(true);
                    setShowCustomPicker(false);
                  }
                }}
                disabled={!customStart || !customEnd}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
