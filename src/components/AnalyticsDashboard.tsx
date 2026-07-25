"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, Eye, ShoppingCart, MousePointerClick, Heart, Mail, Search, TrendingUp, Download, RefreshCw, ArrowRight, Package, BookOpen, ExternalLink } from "lucide-react";

interface AnalyticsData {
  ok: boolean;
  days: number;
  kpis: {
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
  };
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

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

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

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Date Range", `Last ${range} days`],
      ["Unique Visitors", data.kpis.uniqueVisitors],
      ["Page Views", data.kpis.pageViews],
      ["Product Views", data.kpis.productViews],
      ["Add to Cart", data.kpis.addToCarts],
      ["Checkout Clicks", data.kpis.checkoutClicks],
      ["Wishlist Adds", data.kpis.wishlistAdds],
      ["Newsletter Signups", data.kpis.newsletterSignups],
      ["Searches", data.kpis.searches],
      ["Blog Views", data.kpis.blogViews],
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

  const kpiCards = [
    { label: "Unique Visitors", value: data.kpis.uniqueVisitors, icon: Users, color: "bg-blue-500" },
    { label: "Page Views", value: data.kpis.pageViews, icon: Eye, color: "bg-purple-500" },
    { label: "Product Views", value: data.kpis.productViews, icon: Package, color: "bg-emerald-500" },
    { label: "Add to Cart", value: data.kpis.addToCarts, icon: ShoppingCart, color: "bg-amber-500" },
    { label: "Checkout Clicks", value: data.kpis.checkoutClicks, icon: MousePointerClick, color: "bg-[#CA3F2E]" },
    { label: "Wishlist Adds", value: data.kpis.wishlistAdds, icon: Heart, color: "bg-pink-500" },
    { label: "Newsletter", value: data.kpis.newsletterSignups, icon: Mail, color: "bg-indigo-500" },
    { label: "Blog Views", value: data.kpis.blogViews, icon: BookOpen, color: "bg-cyan-500" },
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
            Real-time insights from your store activity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  range === r.days
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-[#CA3F2E] transition"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 ${kpi.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div className="text-2xl font-black text-gray-900">{kpi.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-medium">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#CA3F2E]" />
          Conversion Funnel
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

      {/* Timeline Chart */}
      {data.timeline.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Activity Over Time</h3>
          <div className="flex items-end gap-1 h-40">
            {data.timeline.map(t => {
              const h = (t.visits / maxVisits * 100) || 0;
              return (
                <div key={t.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div className="w-full bg-[#CA3F2E] rounded-t transition-all opacity-60 group-hover:opacity-100" style={{ height: `${(t.checkouts / maxVisits * 100) || 0}%`, minHeight: t.checkouts > 0 ? "2px" : "0" }} title={`Checkouts: ${t.checkouts}`} />
                    <div className="w-full bg-amber-500 opacity-60 group-hover:opacity-100 transition-all" style={{ height: `${(t.carts / maxVisits * 100) || 0}%`, minHeight: t.carts > 0 ? "2px" : "0" }} title={`Carts: ${t.carts}`} />
                    <div className="w-full bg-blue-500 opacity-60 group-hover:opacity-100 rounded-b transition-all" style={{ height: `${h}%`, minHeight: t.visits > 0 ? "2px" : "0" }} title={`Visits: ${t.visits}`} />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-14 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 transition">
                    {t.date}: {t.visits}v / {t.carts}c / {t.checkouts}co
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Visits</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" /> Carts</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#CA3F2E]" /> Checkouts</span>
          </div>
        </div>
      )}

      {/* Two column: Top Products + Top Blog */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#CA3F2E]" />
            Top Products
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No product activity yet</p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.slice(0, 8).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {p.views} views &middot; {p.carts} carts &middot; {p.checkouts} checkouts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#CA3F2E]" />
            Top Blog Posts
          </h3>
          {data.topPosts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No blog activity yet</p>
          ) : (
            <div className="space-y-2">
              {data.topPosts.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {idx + 1}
                  </div>
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

      {/* Two column: Searches + Referrers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#CA3F2E]" />
            Top Search Terms
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
            <ExternalLink className="w-4 h-4 text-[#CA3F2E]" />
            Top Referrers
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
          <Eye className="w-4 h-4 text-[#CA3F2E]" />
          Top Pages
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

      {/* Footer note */}
      <p className="text-xs text-gray-400 text-center">
        Analytics tracked from today onward. Bots are automatically filtered.
      </p>
    </div>
  );
}
