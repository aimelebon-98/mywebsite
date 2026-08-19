"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Package, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Search } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

interface VendorProductItem {
  id: string;
  vendorProductId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: string;
  stock: number;
  category: string;
  brand: string;
  active: boolean;
  vendorStatus: string;
  adminNote: string;
  submittedAt: string;
  approvedAt: string | null;
}

export default function VendorProductsListPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [items, setItems] = useState<VendorProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/products");
      const data = await res.json();
      setItems(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    setDeleting(productId);
    try {
      const res = await fetch("/api/vendor/products/" + productId, { method: "DELETE" });
      if (res.ok) await load();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = items.filter(p => {
    if (statusFilter !== "all" && p.vendorStatus !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">My products</h1>
          <p className="text-gray-500 text-sm">Manage your catalog. All changes require admin approval.</p>
        </div>
        <Link
          href={`/${locale}/vendor/products/add`}
          className="flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-xl transition-colors"
          style={{ backgroundColor: BRAND_RED }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = BRAND_RED_DARK)}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = BRAND_RED)}
        >
          <Plus className="w-4 h-4" />
          Add product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map(s => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "text-white" : "bg-white text-gray-700 border border-gray-200"}`}
                style={active ? { backgroundColor: BRAND_RED } : undefined}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Package className="w-14 h-14 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {items.length === 0 ? "No products yet" : "No matches"}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {items.length === 0 ? "Add your first product to start selling." : "Try changing your filters or search."}
          </p>
          {items.length === 0 && (
            <Link
              href={`/${locale}/vendor/products/add`}
              className="inline-flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-xl"
              style={{ backgroundColor: BRAND_RED }}
            >
              <Plus className="w-4 h-4" />
              Add first product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                  <StatusBadge status={p.vendorStatus} />
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                  <span className="font-mono">${parseFloat(p.price).toFixed(2)}</span>
                  <span>&middot; {p.category}</span>
                  <span>&middot; Stock: {p.stock}</span>
                  {p.brand && <span>&middot; {p.brand}</span>}
                </div>
                {p.vendorStatus === "rejected" && p.adminNote && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 border-l-2 border-red-300 pl-2 py-1 rounded">
                    Admin note: {p.adminNote}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/vendor/products/edit/${p.id}`}
                  className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="p-2.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: "Pending review", bg: "bg-yellow-100", color: "text-yellow-800", Icon: Clock },
    approved: { label: "Live", bg: "bg-green-100", color: "text-green-800", Icon: CheckCircle },
    rejected: { label: "Rejected", bg: "bg-red-100", color: "text-red-800", Icon: XCircle },
    suspended: { label: "Suspended", bg: "bg-gray-100", color: "text-gray-800", Icon: AlertCircle },
  };
  const m = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>
      <m.Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}