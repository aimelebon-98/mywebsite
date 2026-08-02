"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Package, ArrowLeft, Loader2, Clock, CheckCircle, Truck, MapPin, XCircle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: string;
  itemCount: number;
  total: string;
  currency: string;
  createdAt: string;
  trackingNumber: string;
  trackingCarrier: string;
}

const STATUS_MAP: Record<string, { icon: React.ElementType; label: string; labelFr: string; color: string }> = {
  pending:   { icon: Clock,       label: "Pending",    labelFr: "En attente",  color: "text-amber-600 bg-amber-50" },
  confirmed: { icon: CheckCircle, label: "Confirmed",  labelFr: "Confirm\u00e9e", color: "text-blue-600 bg-blue-50" },
  shipped:   { icon: Truck,       label: "Shipped",    labelFr: "Exp\u00e9di\u00e9e", color: "text-purple-600 bg-purple-50" },
  delivered: { icon: MapPin,      label: "Delivered",  labelFr: "Livr\u00e9e",  color: "text-emerald-600 bg-emerald-50" },
  cancelled: { icon: XCircle,     label: "Cancelled",  labelFr: "Annul\u00e9e", color: "text-red-600 bg-red-50" },
};

export default function OrdersPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !customer) router.push(`/${locale}/account/login`);
  }, [authLoading, customer, locale, router]);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/customer/orders").then(r => r.json()).then(d => {
      setOrders(d.orders || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [customer]);

  if (authLoading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={`/${locale}/account/dashboard`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" /> {isFr ? "Tableau de bord" : "Dashboard"}
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-6">{isFr ? "Mes commandes" : "My Orders"}</h1>

          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#CA3F2E]" /></div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">{isFr ? "Aucune commande" : "No orders yet"}</h2>
              <p className="text-sm text-gray-500 mb-6">{isFr ? "Vos commandes appara\u00eetront ici" : "Your orders will appear here"}</p>
              <Link href={`/${locale}/shop`} className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-[#CA3F2E] transition">
                {isFr ? "Voir la boutique" : "Shop now"}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                const Icon = st.icon;
                const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">{isFr ? "Commande" : "Order"} #{order.orderNumber}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString(isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${st.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {isFr ? st.labelFr : st.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {items.slice(0, 3).map((item: { name?: string; imageUrl?: string }, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.name || ""} className="w-10 h-10 rounded-lg object-cover" />}
                          <span className="text-xs text-gray-700 truncate max-w-[120px]">{item.name}</span>
                        </div>
                      ))}
                      {items.length > 3 && <span className="text-xs text-gray-400">+{items.length - 3} more</span>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{order.currency}{parseFloat(order.total).toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{order.itemCount} {order.itemCount === 1 ? (isFr ? "article" : "item") : (isFr ? "articles" : "items")}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-2 text-xs text-gray-500">
                        {isFr ? "Suivi" : "Tracking"}: <span className="font-mono font-bold">{order.trackingNumber}</span>
                        {order.trackingCarrier && <span> ({order.trackingCarrier})</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}