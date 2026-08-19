"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface VendorInfo {
  storeName: string;
  totalSales: number;
  totalEarnings: string;
  pendingPayout: string;
  fulfillmentRate: string;
}

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/me").then(r => r.json()).then(d => {
      setVendor(d.vendor);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;
  if (!vendor) return null;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
      <p className="text-gray-500 text-sm mb-8">Here is what is happening with your store</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Sales</div>
          <div className="text-3xl font-black text-gray-900 mt-2">{vendor.totalSales}</div>
          <div className="text-xs text-gray-400 mt-1">Items sold</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Earnings</div>
          <div className="text-3xl font-black mt-2" style={{ color: BRAND_RED }}>${parseFloat(vendor.totalEarnings || "0").toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">All time</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending Payout</div>
          <div className="text-3xl font-black text-orange-600 mt-2">${parseFloat(vendor.pendingPayout || "0").toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">Available to request</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fulfillment</div>
          <div className="text-3xl font-black text-green-600 mt-2">{parseFloat(vendor.fulfillmentRate || "100").toFixed(0)}%</div>
          <div className="text-xs text-gray-400 mt-1">Order success rate</div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-100 text-center">
        <p className="text-gray-500 text-sm">Full dashboard, products, orders and earnings pages coming in the next update.</p>
        <p className="text-gray-400 text-xs mt-2">For now, you can log in, change your password, and see your stats.</p>
      </div>
    </div>
  );
}