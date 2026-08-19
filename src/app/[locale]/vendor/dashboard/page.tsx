"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Package, ShoppingBag, DollarSign, TrendingUp, Plus, ExternalLink,
  Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface VendorInfo {
  storeName: string;
  storeSlug: string;
  totalSales: number;
  totalEarnings: string;
  pendingPayout: string;
  fulfillmentRate: string;
  commissionRate: string;
}

interface Stats {
  productCounts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    live: number;
  };
  recentOrders: Array<{
    id: string;
    subtotal: string;
    commissionAmount: string;
    vendorEarning: string;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

export default function VendorDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, statsRes] = await Promise.all([
          fetch("/api/vendor/me"),
          fetch("/api/vendor/stats"),
        ]);
        const meData = await meRes.json();
        const statsData = await statsRes.json();
        setVendor(meData.vendor);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !vendor) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;
  }

  const totalEarn = parseFloat(vendor.totalEarnings || "0");
  const pendingPay = parseFloat(vendor.pendingPayout || "0");
  const fulfill = parseFloat(vendor.fulfillmentRate || "100");
  const commission = parseFloat(vendor.commissionRate || "10");

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Welcome back!</h1>
        <p className="text-gray-500 text-sm">Here is what is happening with your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard
          label="Total Sales"
          value={vendor.totalSales.toString()}
          hint="Items sold"
          icon={ShoppingBag}
          color="#3B82F6"
        />
        <StatCard
          label="Total Earnings"
          value={"$" + totalEarn.toFixed(2)}
          hint="All time"
          icon={DollarSign}
          color={BRAND_RED}
        />
        <StatCard
          label="Pending Payout"
          value={"$" + pendingPay.toFixed(2)}
          hint="Available to request"
          icon={Clock}
          color="#F59E0B"
        />
        <StatCard
          label="Fulfillment"
          value={fulfill.toFixed(0) + "%"}
          hint="Order success rate"
          icon={TrendingUp}
          color="#10B981"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
        <Link href={`/${locale}/vendor/products/add`} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: BRAND_RED }}>
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="font-bold text-gray-900">Add product</div>
          <div className="text-xs text-gray-500 mt-1">Submit new items for approval</div>
        </Link>
        <Link href={`/${locale}/vendor/products`} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-blue-100">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="font-bold text-gray-900">Manage products</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.productCounts.live || 0} live &middot; {stats?.productCounts.pending || 0} pending
          </div>
        </Link>
        <a href={`/${locale}/store/${vendor.storeSlug}`} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-green-100">
            <ExternalLink className="w-5 h-5 text-green-600" />
          </div>
          <div className="font-bold text-gray-900">View my store</div>
          <div className="text-xs text-gray-500 mt-1">See your public storefront</div>
        </a>
      </div>

      {/* Product status breakdown */}
      {stats && stats.productCounts.total > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Products status</h2>
            <Link href={`/${locale}/vendor/products`} className="text-xs font-semibold hover:underline" style={{ color: BRAND_RED }}>View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatusPill label="Live" count={stats.productCounts.approved} icon={CheckCircle} color="#10B981" bg="#D1FAE5" />
            <StatusPill label="Pending" count={stats.productCounts.pending} icon={AlertCircle} color="#F59E0B" bg="#FEF3C7" />
            <StatusPill label="Rejected" count={stats.productCounts.rejected} icon={XCircle} color="#EF4444" bg="#FEE2E2" />
            <StatusPill label="Total" count={stats.productCounts.total} icon={Package} color="#6B7280" bg="#F3F4F6" />
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>
          <Link href={`/${locale}/vendor/orders`} className="text-xs font-semibold hover:underline" style={{ color: BRAND_RED }}>View all</Link>
        </div>

        {!stats?.recentOrders.length ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No orders yet. When customers buy your products, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                  <th className="px-5 py-3 text-right">Commission ({commission}%)</th>
                  <th className="px-5 py-3 text-right">Your earning</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{o.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right font-semibold">${parseFloat(o.subtotal).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">${parseFloat(o.commissionAmount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-bold" style={{ color: BRAND_RED }}>${parseFloat(o.vendorEarning).toFixed(2)}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon, color }: { label: string; value: string; hint: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</div>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-2xl md:text-3xl font-black text-gray-900 truncate">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{hint}</div>
    </div>
  );
}

function StatusPill({ label, count, icon: Icon, color, bg }: { label: string; count: number; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: bg }}>
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
      <div>
        <div className="text-lg font-black" style={{ color }}>{count}</div>
        <div className="text-xs font-semibold" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}