"use client";

import { useState, useEffect } from "react";
import type { Order } from "@/db/schema";
import {
  Package, Search, Eye, Trash2, Clock, Truck, CheckCircle, XCircle, MapPin,
  Phone, Mail, Calendar, DollarSign, Copy, ExternalLink, Edit3, Save, X
} from "lucide-react";

interface Props {
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const STATUSES = [
  { value: "all",       label: "All",       color: "gray"   },
  { value: "pending",   label: "Pending",   color: "orange" },
  { value: "confirmed", label: "Confirmed", color: "blue"   },
  { value: "shipped",   label: "Shipped",   color: "purple" },
  { value: "delivered", label: "Delivered", color: "green"  },
  { value: "cancelled", label: "Cancelled", color: "red"    },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find(x => x.value === status) || STATUSES[0];
  const colorMap: Record<string, string> = {
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green:  "bg-green-50 text-green-700 border-green-200",
    red:    "bg-red-50 text-red-700 border-red-200",
    gray:   "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorMap[s.color]}`}>
      {s.label.toUpperCase()}
    </span>
  );
}

interface OrderItem {
  id?: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  subtotal?: number;
}

export default function OrdersManager({ onNotify }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (search) params.append("search", search);
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) setOrders(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [status]);

  useEffect(() => {
    const t = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        onNotify(`Order ${order.orderNumber} -> ${newStatus}`, "success");
        setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
        if (selected?.id === order.id) setSelected(updated);
      }
    } catch {
      onNotify("Failed to update", "error");
    }
  };

  const handleDelete = async (order: Order) => {
    if (!confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        onNotify("Order deleted", "success");
        setOrders(prev => prev.filter(o => o.id !== order.id));
        if (selected?.id === order.id) setSelected(null);
      }
    } catch {
      onNotify("Failed to delete", "error");
    }
  };

  const exportCsv = () => {
    if (orders.length === 0) return;
    const rows = [
      ["Order Number", "Date", "Customer", "Phone", "Email", "Address", "Items", "Total", "Currency", "Status", "Tracking"],
      ...orders.map(o => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString(),
        o.customerName,
        o.customerPhone,
        o.customerEmail,
        o.customerAddress.replace(/\n/g, " "),
        String(o.itemCount),
        String(o.total),
        o.currency,
        o.status,
        o.trackingNumber,
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = orders.filter(o => o.status === "pending").length;

  if (selected) {
    return <OrderDetail order={selected} onBack={() => setSelected(null)} onNotify={onNotify} onUpdate={(u) => { setSelected(u); setOrders(prev => prev.map(o => o.id === u.id ? u : o)); }} onDelete={() => handleDelete(selected)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Orders
            {pendingCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-semibold">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={orders.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order#, name, phone, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${status === s.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders {status !== "all" ? `with status "${status}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">Order #</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Items</th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(o)} className="font-mono text-sm font-semibold text-gray-900 hover:underline">
                        {o.orderNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{o.customerName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {o.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                      {new Date(o.createdAt).toLocaleDateString()}
                      <div className="text-[11px] text-gray-400">{new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-gray-900">{o.currency}{parseFloat(o.total).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(o)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition inline-flex" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(o)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition inline-flex" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ORDER DETAIL VIEW
// ============================================
function OrderDetail({
  order, onBack, onNotify, onUpdate, onDelete,
}: {
  order: Order;
  onBack: () => void;
  onNotify: (msg: string, type?: "success" | "error") => void;
  onUpdate: (o: Order) => void;
  onDelete: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [trackingCarrier, setTrackingCarrier] = useState(order.trackingCarrier || "");
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "");
  const [copied, setCopied] = useState(false);

  const items: OrderItem[] = (() => {
    try { return JSON.parse(order.items) as OrderItem[]; } catch { return []; }
  })();

  const updateField = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onUpdate(await res.json());
        onNotify("Order updated", "success");
      } else {
        onNotify("Failed to update", "error");
      }
    } catch {
      onNotify("Failed to update", "error");
    }
    setSaving(false);
  };

  const setStatus = (newStatus: string) => updateField({ status: newStatus });
  const saveTracking = () => updateField({ trackingNumber, trackingCarrier });
  const saveNotes = () => updateField({ adminNotes });

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const openWhatsApp = () => {
    const phone = order.customerPhone.replace(/\D/g, "");
    const msg = `Hi ${order.customerName}, regarding your order ${order.orderNumber}...`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 mb-1">&larr; Back to orders</button>
          <h2 className="text-xl font-bold font-mono flex items-center gap-3">
            {order.orderNumber}
            <StatusBadge status={order.status} />
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <button onClick={onDelete} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition flex items-center gap-1.5">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* Status changer */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">Change Status</h3>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.filter(s => s.value !== "all").map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              disabled={saving || order.status === s.value}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                order.status === s.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.value === "pending"   && <Clock className="w-3.5 h-3.5 inline mr-1" />}
              {s.value === "confirmed" && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
              {s.value === "shipped"   && <Truck className="w-3.5 h-3.5 inline mr-1" />}
              {s.value === "delivered" && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
              {s.value === "cancelled" && <XCircle className="w-3.5 h-3.5 inline mr-1" />}
              {s.label}
            </button>
          ))}
        </div>
        {order.shippedAt && (
          <p className="text-xs text-gray-500 mt-3">Shipped: {new Date(order.shippedAt).toLocaleString()}</p>
        )}
        {order.deliveredAt && (
          <p className="text-xs text-gray-500 mt-1">Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Left: customer + items */}
        <div className="md:col-span-2 space-y-4">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[60px]">Name:</span>
                <span className="font-medium text-gray-900 flex-1">{order.customerName}</span>
                <button onClick={() => copyText(order.customerName)} className="text-gray-400 hover:text-gray-900" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[60px]">Phone:</span>
                <span className="font-medium text-gray-900 flex-1">{order.customerPhone}</span>
                <button onClick={openWhatsApp} className="text-green-600 hover:text-green-800" title="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button onClick={() => copyText(order.customerPhone)} className="text-gray-400 hover:text-gray-900" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              {order.customerEmail && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 min-w-[60px]">Email:</span>
                  <a href={`mailto:${order.customerEmail}`} className="font-medium text-blue-600 hover:underline flex-1 truncate">{order.customerEmail}</a>
                  <button onClick={() => copyText(order.customerEmail)} className="text-gray-400 hover:text-gray-900" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-gray-500 min-w-[60px]">Address:</span>
                <span className="font-medium text-gray-900 flex-1 whitespace-pre-wrap">{order.customerAddress}</span>
                <button onClick={() => copyText(order.customerAddress)} className="text-gray-400 hover:text-gray-900" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {copied && <p className="text-xs text-green-600 mt-2">Copied!</p>}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">Items ({order.itemCount})</h3>
            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{it.name}</div>
                    <div className="text-xs text-gray-500">
                      {it.size && <>Size: {it.size}</>}
                      {it.size && it.color && " - "}
                      {it.color && <>Color: {it.color}</>}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {it.quantity} x {order.currency}{it.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{order.currency}{(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">Admin Notes <span className="text-[10px] normal-case font-normal text-gray-400">(internal only)</span></h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              onBlur={saveNotes}
              rows={3}
              placeholder="Add internal notes about this order..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">Auto-saves when you click away</p>
          </div>
        </div>

        {/* Right: summary + tracking */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{order.currency}{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.discountCode && `(${order.discountCode})`}</span>
                  <span>-{order.currency}{parseFloat(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(order.shippingCost) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.currency}{parseFloat(order.shippingCost).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{order.currency}{parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Tracking</h3>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Carrier</label>
                <input
                  type="text"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  placeholder="DHL, FedEx, UPS..."
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking #..."
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition"
                />
              </div>
              <button
                onClick={saveTracking}
                disabled={saving}
                className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Tracking"}
              </button>
            </div>
          </div>

          {order.customerNotes && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Customer Notes</h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{order.customerNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
