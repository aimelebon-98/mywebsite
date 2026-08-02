"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, Mail, Phone, Calendar, Package, RefreshCw,
  X, MapPin, ShoppingBag, Star, Gift, Copy, CheckCircle,
  ChevronDown, TrendingUp, Clock, Filter, CreditCard
} from "lucide-react";

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  locale: string;
  verified: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  addressCount: number;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  itemCount: number;
  createdAt: string;
  discountCode: string;
  discountAmount: string;
}

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface CustomerDetail {
  orders: OrderItem[];
  addresses: Address[];
}

type FilterType = "all" | "new" | "regular" | "vip";

function generateCoupon(name: string): string {
  const prefix = name.split(" ")[0].toUpperCase().slice(0, 4).replace(/[^A-Z]/g, "X");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + rand;
}

function statusColor(status: string) {
  switch (status) {
    case "delivered": return "bg-emerald-100 text-emerald-700";
    case "shipped": return "bg-blue-100 text-blue-700";
    case "confirmed": return "bg-violet-100 text-violet-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-amber-100 text-amber-700";
  }
}

function tierInfo(orderCount: number) {
  if (orderCount >= 5) return { label: "VIP", color: "bg-amber-100 text-amber-700", icon: "star" };
  if (orderCount >= 2) return { label: "Regular", color: "bg-violet-100 text-violet-700", icon: "repeat" };
  return { label: "New", color: "bg-gray-100 text-gray-500", icon: "user" };
}

export default function CustomersManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponCopied, setCouponCopied] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "orders" | "spent">("date");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = useCallback(async (c: Customer) => {
    setSelectedCustomer(c);
    setDetail(null);
    setCoupon("");
    setCouponCopied(false);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${c.id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      }
    } catch { }
    setDetailLoading(false);
  }, []);

  const closeDetail = () => {
    setSelectedCustomer(null);
    setDetail(null);
    setCoupon("");
    setCouponCopied(false);
  };

  const handleGenerateCoupon = () => {
    if (!selectedCustomer) return;
    setCoupon(generateCoupon(selectedCustomer.name || "CUST"));
    setCouponCopied(false);
  };

  const handleCopyCoupon = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon).then(() => {
      setCouponCopied(true);
      setTimeout(() => setCouponCopied(false), 2500);
    });
  };

  const sorted = [...customers].sort((a, b) => {
    if (sortBy === "orders") return b.orderCount - a.orderCount;
    if (sortBy === "spent") return b.totalSpent - a.totalSpent;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filtered = sorted.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));
    const matchFilter =
      filter === "all" ? true :
      filter === "new" ? c.orderCount === 0 :
      filter === "regular" ? (c.orderCount >= 2 && c.orderCount < 5) :
      filter === "vip" ? c.orderCount >= 5 : true;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: customers.length,
    new: customers.filter(c => c.orderCount === 0).length,
    regular: customers.filter(c => c.orderCount >= 2 && c.orderCount < 5).length,
    vip: customers.filter(c => c.orderCount >= 5).length,
  };

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderCount = customers.length ? (customers.reduce((s, c) => s + c.orderCount, 0) / customers.length).toFixed(1) : "0";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#CA3F2E]" />
            Customers
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {customers.length} registered customer{customers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={load} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">VIP (5+ orders)</p>
          <p className="text-2xl font-bold text-amber-600">{counts.vip}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Avg Orders / Customer</p>
          <p className="text-2xl font-bold text-violet-600">{avgOrderCount}</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as "date" | "orders" | "spent")}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] bg-white"
        >
          <option value="date">Sort: Newest</option>
          <option value="orders">Sort: Most Orders</option>
          <option value="spent">Sort: Most Spent</option>
        </select>
      </div>

      {/* Tier filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all","new","regular","vip"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filter === f
                ? "bg-[#CA3F2E] text-white border-[#CA3F2E]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#CA3F2E] hover:text-[#CA3F2E]"
            }`}
          >
            {f === "all" ? "All" : f === "new" ? "New" : f === "regular" ? "Regular" : "VIP"}
            <span className="ml-1.5 opacity-75">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Reward banner for filtered VIP/Regular */}
      {(filter === "vip" || filter === "regular") && filtered.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 text-sm">
          <Gift className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-amber-800 font-medium">
            Click on any {filter === "vip" ? "VIP" : "Regular"} customer to generate a personal coupon code you can share with them.
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{search ? "No customers match your search" : "No customers in this category"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const tier = tierInfo(c.orderCount);
            return (
              <div
                key={c.id}
                onClick={() => openDetail(c)}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 hover:shadow-md hover:border-[#CA3F2E]/30 transition cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(c.name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">{c.name || "Unnamed"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${tier.color}`}>{tier.label}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase font-bold">{c.locale}</span>
                    {c.verified && <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">Verified</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {c.orderCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold">
                      <Package className="w-3 h-3" /> {c.orderCount} order{c.orderCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {c.totalSpent > 0 && (
                    <span className="text-xs text-gray-700 font-bold">${c.totalSpent.toFixed(2)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========== CUSTOMER DETAIL MODAL ========== */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={closeDetail}>
          <div
            className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center text-white font-bold text-sm">
                  {(selectedCustomer.name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{selectedCustomer.name || "Unnamed"}</p>
                  <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={closeDetail} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-5">

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Orders</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCustomer.orderCount}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-emerald-600">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Addresses</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCustomer.addressCount}</p>
                </div>
              </div>

              {/* Profile info */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Profile</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Joined {new Date(selectedCustomer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                {selectedCustomer.lastOrderAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Last order {new Date(selectedCustomer.lastOrderAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {selectedCustomer.verified
                    ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-4 h-4" /> Email verified</span>
                    : <span className="text-amber-600">Email not verified</span>}
                </div>
                <div className="flex items-center gap-2">
                  {(() => { const t = tierInfo(selectedCustomer.orderCount); return (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.color}`}>{t.label} customer</span>
                  ); })()}
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase font-bold">{selectedCustomer.locale}</span>
                </div>
              </div>

              {/* Coupon generator */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> Reward with Coupon
                </p>
                {!coupon ? (
                  <button
                    onClick={handleGenerateCoupon}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" /> Generate Coupon Code
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-white border-2 border-amber-400 rounded-xl px-4 py-3">
                      <span className="flex-1 font-mono text-lg font-bold text-gray-900 tracking-widest">{coupon}</span>
                      <button
                        onClick={handleCopyCoupon}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          couponCopied ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        }`}
                      >
                        {couponCopied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 text-center">Share this code with {selectedCustomer.name.split(" ")[0]} via WhatsApp or email</p>
                    <button
                      onClick={handleGenerateCoupon}
                      className="w-full py-2 bg-white border border-amber-300 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 transition"
                    >
                      Generate New Code
                    </button>
                  </div>
                )}
              </div>

              {/* Addresses */}
              {detailLoading ? (
                <div className="text-center py-6 text-gray-400 text-sm">Loading details...</div>
              ) : detail && detail.addresses.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Saved Addresses ({detail.addresses.length})
                  </p>
                  <div className="space-y-2">
                    {detail.addresses.map(addr => (
                      <div key={addr.id} className="bg-white border border-gray-100 rounded-xl p-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase">{addr.label}</span>
                          {addr.isDefault && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold">Default</span>}
                        </div>
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-xs text-gray-500">{addr.street}, {addr.city}{addr.state ? ", " + addr.state : ""}</p>
                        <p className="text-xs text-gray-500">{addr.country}{addr.postalCode ? " " + addr.postalCode : ""}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {!detailLoading && detail && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> Order History ({detail.orders.length})
                  </p>
                  {detail.orders.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">No orders yet</div>
                  ) : (
                    <div className="space-y-2">
                      {detail.orders.map(order => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-gray-700">#{order.orderNumber}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
                            <span className="font-bold text-gray-900">${Number(order.total).toFixed(2)}</span>
                          </div>
                          {order.discountCode && (
                            <div className="mt-1 text-[10px] text-emerald-600 flex items-center gap-1">
                              <Gift className="w-3 h-3" /> Used coupon: {order.discountCode} (-${Number(order.discountAmount).toFixed(2)})
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}