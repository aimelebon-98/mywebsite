"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  orderId: string;
  subtotal: string;
  commissionRate: string;
  commissionAmount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AffiliateOrdersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/affiliate/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d?.orders) setOrders(d.orders);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/${locale}/affiliate/dashboard`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isFr ? "Retour au tableau de bord" : "Back to dashboard"}
          </Link>
          <h1 className="text-2xl font-bold">
            {isFr ? "Commandes R\u00e9f\u00e9renc\u00e9es" : "Referred Orders"}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isFr
              ? "Historique de toutes les commandes pass\u00e9es avec votre lien affili\u00e9."
              : "Complete history of customer orders attributed to your referral links."}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#CA3F2E] mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            {isFr
              ? "Aucune commande enregistr\u00e9e pour le moment."
              : "No orders have been referred yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Subtotal</th>
                  <th className="py-3 px-3">Rate</th>
                  <th className="py-3 px-3">Commission</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-3 font-mono text-white">#{ord.orderId.slice(0, 8)}</td>
                    <td className="py-3.5 px-3">
                      {new Date(ord.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3">${parseFloat(ord.subtotal).toFixed(2)}</td>
                    <td className="py-3.5 px-3">{ord.commissionRate}%</td>
                    <td className="py-3.5 px-3 font-semibold text-emerald-400">
                      +${parseFloat(ord.commissionAmount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-semibold">
                        {ord.status}
                      </span>
                    </td>
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