"use client";

import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, Package } from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface VendorOrderRow {
  id: string;
  orderId: string;
  items: string;
  subtotal: string;
  commissionRate: string;
  commissionAmount: string;
  vendorEarning: string;
  currency: string;
  status: string;
  createdAt: string;
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/orders").then(r => r.json()).then(d => {
      setOrders(d.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My orders</h1>
        <p className="text-gray-500 text-sm">Every sale from your products, with commission breakdown.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <ShoppingBag className="w-14 h-14 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm">When customers buy your products, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map(o => {
            let items: Array<{ name?: string; quantity?: number; price?: number }> = [];
            try { items = JSON.parse(o.items || "[]"); } catch {}

            return (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 font-mono mb-0.5">Order #{o.orderId.slice(0, 8)}</div>
                    <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                {items.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-3">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 py-1">
                        <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="flex-1 truncate">{it.name || "Product"}</span>
                        <span className="text-gray-500 text-xs">x{it.quantity || 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Subtotal</div>
                    <div className="font-bold text-gray-900">${parseFloat(o.subtotal).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Commission ({o.commissionRate}%)</div>
                    <div className="font-bold text-gray-600">-${parseFloat(o.commissionAmount).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Your earning</div>
                    <div className="font-black" style={{ color: BRAND_RED }}>${parseFloat(o.vendorEarning).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}