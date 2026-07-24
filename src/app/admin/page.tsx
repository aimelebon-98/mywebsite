"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, Settings, BarChart3, LogOut, Edit, Trash2, Eye, EyeOff, Star, Search, Menu, X, Home,
  Shield, Users, Download, Upload, RefreshCw, Lock, MessageSquare, Key, AlertTriangle, TrendingUp,
  DollarSign, ShoppingBag, CheckCircle, Clock, Copy, Tag, Globe, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";
import { BookOpen, UsersRound, PenLine } from "lucide-react";
import type { BlogPost } from "@/db/schema";
import AuthorsManager from "@/components/AuthorsManager";
import BlogPostsList from "@/components/BlogPostsList";
import BlogPostForm from "@/components/BlogPostForm";
import CommentsManager from "@/components/CommentsManager";
import DashboardBlogStats from "@/components/DashboardBlogStats";

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  nameFr?: string | null;
  descriptionFr?: string | null;
  shortDescriptionFr?: string | null;
  longDescriptionFr?: string | null;
  tagsFr?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyphrase?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  seoTitleFr?: string | null;
  metaDescriptionFr?: string | null;
  focusKeyphraseFr?: string | null;
  price: string;
  comparePrice: string | null;
  category: string;
  brand: string;
  sizes: string;
  colors: string;
  imageUrl: string;
  images: string;
  stock: number;
  featured: boolean;
  active: boolean;
  rating?: string;
  reviewCount?: number;
  material?: string;
  sku?: string;
  tags?: string;
  createdAt: string;
}

interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameFr: string | null;
  imageProductId: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  currency: string;
  adminPassword: string;
  adminAccessCode: string;
  adminPath: string;
  maxLoginAttempts: number;
  lockoutMinutes: number;
}

type Tab = "dashboard" | "products" | "add" | "edit" | "categories" | "reviews" | "settings" | "security" | "blog" | "blog-add" | "blog-edit" | "authors" | "comments";

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<"loading" | "access-code" | "password" | "authenticated">("loading");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "SoleVault",
    whatsappNumber: "",
    currency: "$",
    adminPassword: "",
    adminAccessCode: "",
    adminPath: "admin",
    maxLoginAttempts: 5,
    lockoutMinutes: 15,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogRefreshKey, setBlogRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<"all" | "active" | "inactive" | "featured" | "lowStock" | "outOfStock" | "highStock">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        try { await fetch("/api/setup", { method: "POST" }); } catch { /* ignore */ }

        const configRes = await fetch("/api/admin/auth");
        const config = await configRes.json();
        setRequiresAccessCode(config.requiresAccessCode);

        const sessionRes = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify-session" }),
        });

        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (data.valid) { setAuthStep("authenticated"); return; }
        }

        setAuthStep(config.requiresAccessCode ? "access-code" : "password");
      } catch {
        setAuthStep("password");
      }
    };
    checkAuth();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?active=false");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {/* ignore */}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {/* ignore */}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.storeName) setStoreSettings(data);
    } catch {/* ignore */}
  }, []);

  useEffect(() => {
    if (authStep === "authenticated") {
      fetchProducts();
      fetchCategories();
      fetchSettings();
    }
  }, [authStep, fetchProducts, fetchCategories, fetchSettings]);

  const handleVerifyAccessCode = async () => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-access-code", accessCode }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.skipAccessCode)) {
        setAuthStep("password");
        setAuthError("");
      } else {
        setAuthError(data.error || "Invalid access code");
      }
    } catch {
      setAuthError("Verification failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          password,
          accessCode: requiresAccessCode ? accessCode : undefined
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthStep("authenticated");
        setAuthError("");
      } else {
        setAuthError(data.error || "Invalid password");
      }
    } catch {
      setAuthError("Authentication failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {/* ignore */}
    setAuthStep(requiresAccessCode ? "access-code" : "password");
    setPassword("");
    setAccessCode("");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      showNotification("Product deleted successfully");
      fetchProducts();
    } catch {
      showNotification("Failed to delete product", "error");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      showNotification(currentActive ? "Product hidden from store" : "Product now visible");
      fetchProducts();
    } catch {/* ignore */}
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      showNotification(currentFeatured ? "Removed from featured" : "Added to featured");
      fetchProducts();
    } catch {/* ignore */}
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete", ids: string[]) => {
    if (ids.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} products? This cannot be undone.`)) return;

    setLoading(true);
    try {
      for (const id of ids) {
        if (action === "delete") {
          await fetch(`/api/products/${id}`, { method: "DELETE" });
        } else {
          await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: action === "activate" }),
          });
        }
      }
      showNotification(`${ids.length} products ${action === "delete" ? "deleted" : action === "activate" ? "activated" : "deactivated"}`);
      fetchProducts();
    } catch {
      showNotification("Bulk action failed", "error");
    }
    setLoading(false);
  };

  const handleExportProducts = () => {
    const csv = [
      ["ID", "Name", "Price", "Category", "Brand", "Stock", "Active"].join(","),
      ...products.map(p => [
        p.id, `"${p.name}"`, p.price, p.category, `"${p.brand}"`, p.stock, p.active
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showNotification("Products exported successfully");
  };

  if (authStep === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (authStep === "access-code") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Secure Access</h1>
            <p className="text-gray-500 text-sm mt-1">Enter the access code to continue</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700">This area is protected</span>
            </div>
            <input
              type="password"
              placeholder="Access Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyAccessCode()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
            {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
            <button
              onClick={handleVerifyAccessCode}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Continue
            </button>
          </div>
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition">&larr; Back to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === "password") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your password to continue</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
            {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Sign In
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">Default password: admin123</p>
          <div className="text-center mt-4">
            {requiresAccessCode && (
              <button onClick={() => setAuthStep("access-code")} className="text-sm text-gray-500 hover:text-gray-900 transition mr-4">
                &larr; Back
              </button>
            )}
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition">Back to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (productFilter === "all" ||
     (productFilter === "active" && p.active) ||
     (productFilter === "inactive" && !p.active) ||
     (productFilter === "featured" && p.featured) ||
     (productFilter === "lowStock" && p.stock > 0 && p.stock < 10) ||
     (productFilter === "outOfStock" && p.stock === 0) ||
     (productFilter === "highStock" && p.stock >= 10))
  );

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price) * p.stock, 0);
  const activeCount = products.filter(p => p.active).length;
  const featuredCount = products.filter(p => p.featured).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const frenchTranslatedCount = products.filter(p => p.nameFr && p.nameFr.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-slide-in flex items-center gap-2 ${
          notificationType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {notificationType === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {notification}
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">SV</span>
              </div>
              <div>
                <span className="font-bold text-sm">Admin Panel</span>
                <div className="flex items-center gap-1 text-[10px] text-green-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Secure
                </div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {[
            { id: "dashboard" as Tab, icon: BarChart3, label: "Dashboard" },
            { id: "products" as Tab, icon: Package, label: "Products" },
            { id: "add" as Tab, icon: Plus, label: "Add Product" },
            { id: "categories" as Tab, icon: Tag, label: "Categories" },
            { id: "reviews" as Tab, icon: MessageSquare, label: "Reviews" },
            { id: "blog" as Tab, icon: BookOpen, label: "Blog Posts" },
            { id: "authors" as Tab, icon: UsersRound, label: "Authors" },
            { id: "comments" as Tab, icon: MessageSquare, label: "Comments" },
            { id: "settings" as Tab, icon: Settings, label: "Store Settings" },
            { id: "security" as Tab, icon: Shield, label: "Security" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === item.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Home className="w-5 h-5" /> View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold capitalize">
              {activeTab === "add" ? "Add Product" : activeTab === "edit" ? "Edit Product" : activeTab === "blog-add" ? "New Blog Post" : activeTab === "blog-edit" ? "Edit Blog Post" : activeTab === "blog" ? "Blog Posts" : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchProducts(); fetchCategories(); }} className="p-2 hover:bg-gray-100 rounded-xl" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total Products", value: products.length, icon: Package, color: "blue",   filter: "all" as const },
                  { label: "Active",         value: activeCount,     icon: CheckCircle, color: "green",  filter: "active" as const },
                  { label: "Featured",       value: featuredCount,   icon: Star, color: "amber",  filter: "featured" as const },
                  { label: "Total Stock",    value: totalStock,      icon: ShoppingBag, color: "purple", filter: "highStock" as const },
                  { label: "Low Stock",      value: lowStockCount,   icon: AlertTriangle, color: "orange", filter: "lowStock" as const },
                  { label: "Out of Stock",   value: outOfStockCount, icon: X, color: "red",    filter: "outOfStock" as const },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => { setProductFilter(stat.filter); setActiveTab("products"); }}
                    className="text-left bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className={`w-8 h-8 bg-${stat.color}-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {stat.label}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                    </p>
                  </button>
                ))}
              </div>

              {/* FR translation status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">French Translation Status</h3>
                    <p className="text-xs text-gray-500">Products with French translations show on /fr pages</p>
                  </div>
                </div>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-3xl font-bold">{frenchTranslatedCount} / {products.length}</p>
                    <p className="text-sm text-gray-500">products translated to French</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${products.length > 0 ? (frenchTranslatedCount / products.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold mb-4">Inventory Value</h3>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-4xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Total inventory value</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab("add")} className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                    <button onClick={() => setActiveTab("categories")} className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                      <Tag className="w-4 h-4" /> Manage Categories
                    </button>
                    <button onClick={handleExportProducts} className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Recent Products</h3>
                  <button onClick={() => setActiveTab("products")} className="text-sm text-gray-700 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {p.name}
                            {p.nameFr && <Globe className="w-3 h-3 text-blue-500" />}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">{p.category} - {p.stock} in stock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">${parseFloat(p.price).toFixed(2)}</span>
                        <div className={`text-xs ${p.active ? "text-green-600" : "text-gray-400"}`}>
                          {p.active ? "Active" : "Hidden"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={filteredProducts}
              productFilter={productFilter} setProductFilter={setProductFilter} searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onEdit={(p) => { setEditingProduct(p); setActiveTab("edit"); }}
              onDelete={handleDeleteProduct}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              onBulkAction={handleBulkAction}
              onExport={handleExportProducts}
              onAdd={() => setActiveTab("add")}
              loading={loading}
            />
          )}

          {activeTab === "add" && (
            <ProductForm
              categories={categories}
              onSave={async (data) => {
                setLoading(true);
                try {
                  const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    showNotification("Product created successfully!");
                    fetchProducts();
                    setActiveTab("products");
                  } else {
                    showNotification("Failed to create product", "error");
                  }
                } catch {
                  showNotification("Failed to create product", "error");
                }
                setLoading(false);
              }}
              loading={loading}
            />
          )}

          {activeTab === "edit" && editingProduct && (
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSave={async (data) => {
                setLoading(true);
                try {
                  const res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    showNotification("Product updated successfully!");
                    fetchProducts();
                    setActiveTab("products");
                  } else {
                    showNotification("Failed to update product", "error");
                  }
                } catch {
                  showNotification("Failed to update product", "error");
                }
                setLoading(false);
              }}
              loading={loading}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTab
              categories={categories}
              onRefresh={fetchCategories}
              onNotify={showNotification}
            />
          )}

          {activeTab === "reviews" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold mb-4">Product Reviews</h3>
              <p className="text-gray-500 text-sm">Customer reviews are displayed on product pages. Reviews can be submitted by customers directly on the product page.</p>
              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Reviews", value: products.reduce((sum, p) => sum + (p.reviewCount || 0), 0) },
                  { label: "Avg. Rating", value: (products.filter(p => p.rating).reduce((sum, p) => sum + parseFloat(p.rating || "0"), 0) / Math.max(1, products.filter(p => p.rating).length)).toFixed(1) },
                  { label: "Products with Reviews", value: products.filter(p => (p.reviewCount || 0) > 0).length },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <SettingsForm
              settings={storeSettings}
              onSave={async (data) => {
                setLoading(true);
                try {
                  const res = await fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    showNotification("Settings saved!");
                    fetchSettings();
                  } else {
                    showNotification("Failed to save settings", "error");
                  }
                } catch {
                  showNotification("Failed to save settings", "error");
                }
                setLoading(false);
              }}
              loading={loading}
            />
          )}

          {activeTab === "security" && (
            <SecurityForm
              settings={storeSettings}
              onSave={async (data) => {
                setLoading(true);
                try {
                  const res = await fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    showNotification("Security settings saved!");
                    fetchSettings();
                  } else {
                    showNotification("Failed to save settings", "error");
                  }
                } catch {
                  showNotification("Failed to save settings", "error");
                }
                setLoading(false);
              }}
              loading={loading}
            />
          )}

          {activeTab === "blog" && (
            <BlogPostsList
              refreshKey={blogRefreshKey}
              onAdd={() => setActiveTab("blog-add")}
              onEdit={(p) => { setEditingPost(p); setActiveTab("blog-edit"); }}
              onNotify={showNotification}
            />
          )}

          {activeTab === "blog-add" && (
            <BlogPostForm
              onCancel={() => setActiveTab("blog")}
              loading={loading}
              onSave={async (data) => {
                setLoading(true);
                try {
                  const res = await fetch("/api/blog", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    showNotification("Post created!");
                    setBlogRefreshKey(k => k + 1);
                    setActiveTab("blog");
                  } else {
                    showNotification("Failed to create post", "error");
                  }
                } catch {
                  showNotification("Failed to create post", "error");
                }
                setLoading(false);
              }}
            />
          )}

          {activeTab === "blog-edit" && editingPost && (
            <BlogPostForm
              post={editingPost}
              onCancel={() => { setEditingPost(null); setActiveTab("blog"); }}
              loading={loading}
              onSave={async (data) => {
                setLoading(true);
                try {
                  const res = await fetch(`/api/blog/${editingPost.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    showNotification("Post updated!");
                    setBlogRefreshKey(k => k + 1);
                    setEditingPost(null);
                    setActiveTab("blog");
                  } else {
                    showNotification("Failed to update post", "error");
                  }
                } catch {
                  showNotification("Failed to update post", "error");
                }
                setLoading(false);
              }}
            />
          )}

          {activeTab === "authors" && (
            <AuthorsManager onNotify={showNotification} />
          )}

          {activeTab === "comments" && (
            <CommentsManager onNotify={showNotification} />
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

// ============================================================
// PRODUCTS TAB
// ============================================================
function ProductsTab({
  products, searchTerm, setSearchTerm, productFilter, setProductFilter, onEdit, onDelete, onToggleActive, onToggleFeatured, onBulkAction, onExport, onAdd, loading
}: {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  productFilter: "all" | "active" | "inactive" | "featured" | "lowStock" | "outOfStock" | "highStock";
  setProductFilter: (f: "all" | "active" | "inactive" | "featured" | "lowStock" | "outOfStock" | "highStock") => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onBulkAction: (action: "activate" | "deactivate" | "delete", ids: string[]) => void;
  onExport: () => void;
  onAdd: () => void;
  loading: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.length === products.length ? [] : products.map(p => p.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
        </div>
          {productFilter !== "all" && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Filtered:</span>
              <span className="text-sm font-medium text-blue-900">
                {productFilter === "active" && "Active products only"}
                {productFilter === "inactive" && "Inactive products only"}
                {productFilter === "featured" && "Featured products only"}
                {productFilter === "lowStock" && "Low stock (< 10 units)"}
                {productFilter === "outOfStock" && "Out of stock"}
                {productFilter === "highStock" && "In stock (>= 10 units)"}
              </span>
              <button
                onClick={() => setProductFilter("all")}
                className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear filter x
              </button>
            </div>
          )}
        <div className="flex gap-2 flex-wrap">
          {selectedIds.length > 0 && (
            <>
              <button onClick={() => onBulkAction("activate", selectedIds)} className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium hover:bg-green-200 transition">
                Activate ({selectedIds.length})
              </button>
              <button onClick={() => onBulkAction("deactivate", selectedIds)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                Deactivate
              </button>
              <button onClick={() => onBulkAction("delete", selectedIds)} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition">
                Delete
              </button>
            </>
          )}
          <button onClick={onExport} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">
                    <input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">FR</th>
                  <th className="text-left px-4 py-3 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[150px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.nameFr ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          <Globe className="w-3 h-3" /> FR
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={p.stock === 0 ? "text-red-500" : p.stock <= 10 ? "text-amber-500" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onToggleFeatured(p.id, p.featured)} className={`p-2 rounded-lg transition ${p.featured ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`} title={p.featured ? "Remove from featured" : "Add to featured"}>
                          <Star className="w-4 h-4" fill={p.featured ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => onToggleActive(p.id, p.active)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition" title={p.active ? "Hide product" : "Show product"}>
                          {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition" title="Edit product">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition" title="Delete product">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

// ============================================================
// CATEGORIES TAB (NEW)
// ============================================================
function CategoriesTab({
  categories,
  onRefresh,
  onNotify,
}: {
  categories: Category[];
  onRefresh: () => void;
  onNotify: (msg: string, type?: "success" | "error") => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [newSlug, setNewSlug] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newNameFr, setNewNameFr] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("100");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newSlug.trim() || !newNameEn.trim()) {
      onNotify("Slug and English name are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newSlug.trim(),
          nameEn: newNameEn.trim(),
          nameFr: newNameFr.trim() || null,
          sortOrder: parseInt(newSortOrder) || 100,
        }),
      });
      if (res.ok) {
        onNotify("Category created");
        setNewSlug("");
        setNewNameEn("");
        setNewNameFr("");
        setNewSortOrder("100");
        setShowAddForm(false);
        onRefresh();
      } else {
        const data = await res.json();
        onNotify(data.error || "Failed to create category", "error");
      }
    } catch {
      onNotify("Failed to create category", "error");
    }
    setSaving(false);
  };

  const handleUpdate = async (cat: Category, updates: Partial<Category>) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        onNotify("Category updated");
        onRefresh();
        setEditingId(null);
      } else {
        onNotify("Failed to update category", "error");
      }
    } catch {
      onNotify("Failed to update category", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will still exist but won't have a category label.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        onNotify("Category deleted");
        onRefresh();
      } else {
        onNotify("Failed to delete category", "error");
      }
    } catch {
      onNotify("Failed to delete category", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Categories</h2>
          <p className="text-sm text-gray-500">Manage product categories in English and French</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold">New Category</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug (URL identifier) *</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="e.g., loafers"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Lowercase, no spaces. Used in URLs like /shop?category=loafers</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sort Order</label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
              <p className="text-xs text-gray-400 mt-1">Lower number = appears first</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Name (English) *</label>
              <input
                type="text"
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder="e.g., Loafers"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-500" /> Name (French)
              </label>
              <input
                type="text"
                value={newNameFr}
                onChange={(e) => setNewNameFr(e.target.value)}
                placeholder="e.g., Mocassins"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Category"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold w-16">Order</th>
              <th className="text-left px-4 py-3 font-semibold">Slug</th>
              <th className="text-left px-4 py-3 font-semibold">Name (EN)</th>
              <th className="text-left px-4 py-3 font-semibold">Name (FR)</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">No categories yet</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  isEditing={editingId === cat.id}
                  onStartEdit={() => setEditingId(cat.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={(updates) => handleUpdate(cat, updates)}
                  onDelete={() => handleDelete(cat.id, cat.nameEn)}
                  onToggleActive={() => handleUpdate(cat, { active: !cat.active })}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <p className="font-semibold mb-1">How categories work:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Categories appear on shop pages and homepage in the current language</li>
          <li>When a product is assigned to a category slug, it uses that category&apos;s translations</li>
          <li>Deleting a category won&apos;t delete products - they keep their category slug but no label</li>
          <li>Set a category to inactive to hide it from the store without deleting it</li>
        </ul>
      </div>
    </div>
  );
}

function CategoryRow({
  category, isEditing, onStartEdit, onCancelEdit, onSave, onDelete, onToggleActive,
}: {
  category: Category;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: Partial<Category>) => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [nameEn, setNameEn] = useState(category.nameEn);
  const [nameFr, setNameFr] = useState(category.nameFr || "");
  const [sortOrder, setSortOrder] = useState(category.sortOrder.toString());

  useEffect(() => {
    setNameEn(category.nameEn);
    setNameFr(category.nameFr || "");
    setSortOrder(category.sortOrder.toString());
  }, [category, isEditing]);

  if (isEditing) {
    return (
      <tr className="bg-blue-50/50 border-b border-gray-100">
        <td className="px-4 py-3">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm" />
        </td>
        <td className="px-4 py-3 text-xs font-mono text-gray-500">{category.slug}</td>
        <td className="px-4 py-3">
          <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
        </td>
        <td className="px-4 py-3">
          <input type="text" value={nameFr} onChange={(e) => setNameFr(e.target.value)} placeholder="(optional)" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-full text-xs ${category.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {category.active ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onSave({ nameEn, nameFr: nameFr || null, sortOrder: parseInt(sortOrder) || 0 })}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium"
            >
              Save
            </button>
            <button onClick={onCancelEdit} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs">Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
      <td className="px-4 py-3 text-gray-400 text-xs">{category.sortOrder}</td>
      <td className="px-4 py-3 text-xs font-mono text-gray-500">{category.slug}</td>
      <td className="px-4 py-3 font-medium">{category.nameEn}</td>
      <td className="px-4 py-3 text-gray-700">
        {category.nameFr || <span className="text-gray-300">-</span>}
      </td>
      <td className="px-4 py-3">
        <button onClick={onToggleActive} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${category.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          {category.active ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onStartEdit} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// PRODUCT FORM (with French fields + dynamic categories)
// ============================================================
function ProductForm({
  product,
  categories,
  onSave,
  loading,
}: {
  product?: Product;
  categories: Category[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");
  const [longDescription, setLongDescription] = useState(product?.longDescription || "");

  // French fields
  const [nameFr, setNameFr] = useState(product?.nameFr || "");
  const [descriptionFr, setDescriptionFr] = useState(product?.descriptionFr || "");
  const [shortDescriptionFr, setShortDescriptionFr] = useState(product?.shortDescriptionFr || "");
  const [longDescriptionFr, setLongDescriptionFr] = useState(product?.longDescriptionFr || "");
  const [tagsFrStr, setTagsFrStr] = useState(() => {
    if (!product?.tagsFr) return "";
    try { return (JSON.parse(product.tagsFr) as string[]).join(", "); } catch { return ""; }
  });
  const [showFrenchSection, setShowFrenchSection] = useState(!!product?.nameFr);

  const [price, setPrice] = useState(product?.price || "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice || "");
  const [category, setCategory] = useState(product?.category || (categories[0]?.slug ?? "sneakers"));
  const [brand, setBrand] = useState(product?.brand || "");
  const [sizesStr, setSizesStr] = useState(product ? (JSON.parse(product.sizes || "[]") as string[]).join(", ") : "7, 8, 9, 10, 11, 12");
  const [colorsStr, setColorsStr] = useState(product ? (JSON.parse(product.colors || "[]") as string[]).join(", ") : "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [extraImages, setExtraImages] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(product?.images || "[]") as string[];
      // Filter out the main imageUrl to avoid duplication
      return parsed.filter(img => img && img !== product?.imageUrl);
    } catch { return []; }
  });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active !== false);
  const [material, setMaterial] = useState(product?.material || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [tagsStr, setTagsStr] = useState(product?.tags ? (JSON.parse(product.tags) as string[]).join(", ") : "");

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription || "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(product?.focusKeyphrase || "");
  const [ogImage, setOgImage] = useState(product?.ogImage || "");
  const [canonicalUrl, setCanonicalUrl] = useState(product?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(product?.noIndex || false);
  const [seoTitleFr, setSeoTitleFr] = useState(product?.seoTitleFr || "");
  const [metaDescriptionFr, setMetaDescriptionFr] = useState(product?.metaDescriptionFr || "");
  const [focusKeyphraseFr, setFocusKeyphraseFr] = useState(product?.focusKeyphraseFr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(",").map((c) => c.trim()).filter(Boolean);
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const tagsFr = tagsFrStr.split(",").map((t) => t.trim()).filter(Boolean);

    onSave({
      name, description, shortDescription, longDescription,
      nameFr: nameFr.trim() || null,
      descriptionFr: descriptionFr.trim() || null,
      shortDescriptionFr: shortDescriptionFr.trim() || null,
      longDescriptionFr: longDescriptionFr.trim() || null,
      tagsFr: tagsFr.length > 0 ? tagsFr : null,
      price: parseFloat(price) || 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      category, brand, sizes, colors,
      imageUrl,
      images: [imageUrl, ...extraImages].filter(Boolean),
      stock: parseInt(stock) || 0,
      featured, active,
      material, sku, tags,
      seoTitle: seoTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      focusKeyphrase: focusKeyphrase.trim() || null,
      ogImage: ogImage.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
      noIndex,
      seoTitleFr: seoTitleFr.trim() || null,
      metaDescriptionFr: metaDescriptionFr.trim() || null,
      focusKeyphraseFr: focusKeyphraseFr.trim() || null,
    });
  };

  const activeCategories = categories.filter(c => c.active);
  const categoriesToShow = activeCategories.length > 0 ? activeCategories : categories;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Basic Information (English)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Air Max Velocity" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Short Description</label>
            <p className="text-xs text-gray-400 mb-1.5">A brief summary shown on product cards and search results (1-2 sentences).</p>
            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} placeholder="e.g., Premium sneakers with responsive cushioning and breathable mesh upper." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{shortDescription.length}/200</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Long Description</label>
            <p className="text-xs text-gray-400 mb-1.5">Detailed product description shown on the product page.</p>
            <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} placeholder="Provide a detailed description of the product..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{longDescription.length} characters</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Description (Legacy)</label>
            <p className="text-xs text-gray-400 mb-1.5">Used as fallback if short/long descriptions are empty.</p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="General product description..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Price *</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="99.99" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Compare Price (Sale)</label>
            <input type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="129.99" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white">
              {categoriesToShow.length === 0 ? (
                <option value="sneakers">Sneakers</option>
              ) : (
                categoriesToShow.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.nameEn}{cat.nameFr ? ` / ${cat.nameFr}` : ""}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-400 mt-1">Manage categories in the Categories tab</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Brand</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
        </div>
      </div>

      {/* FRENCH TRANSLATIONS SECTION - COLLAPSIBLE */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFrenchSection(!showFrenchSection)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">French Translations</h3>
              <p className="text-xs text-gray-500">
                {nameFr ? "Product will appear on French pages" : "Optional - leave blank to hide on French pages"}
              </p>
            </div>
          </div>
          {showFrenchSection ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showFrenchSection && (
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-800">
                <strong>How it works:</strong> Fill in the French name (required) to make this product visible on <code className="bg-blue-100 px-1 rounded">/fr</code> pages. Empty French translations mean the product only shows on English pages.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Product Name (French)</label>
              <input type="text" value={nameFr} onChange={(e) => setNameFr(e.target.value)} placeholder="e.g., Air Max Vitesse" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Short Description (French)</label>
              <textarea value={shortDescriptionFr} onChange={(e) => setShortDescriptionFr(e.target.value)} rows={2} placeholder="e.g., Baskets haut de gamme avec amorti reactif..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Long Description (French)</label>
              <textarea value={longDescriptionFr} onChange={(e) => setLongDescriptionFr(e.target.value)} rows={6} placeholder="Description detaillee du produit en francais..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description Fallback (French)</label>
              <textarea value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} rows={3} placeholder="Description generale en francais (fallback)..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tags (French, comma separated)</label>
              <input type="text" value={tagsFrStr} onChange={(e) => setTagsFrStr(e.target.value)} placeholder="ex: bon-plan, nouveaute" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>
        )}
      </div>

      {/* ============================================ SEO SECTION ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">SEO &amp; Search Engines</h3>
            <p className="text-xs text-gray-500 mt-0.5">Control how this product appears in Google and social media.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Yoast-style
          </div>
        </div>

        {/* Google Snippet Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Google Preview</div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">mywebsite-inky-gamma.vercel.app &rsaquo; shop &rsaquo; {name ? name.toLowerCase().replace(/\s+/g,"-").slice(0,40) : "product-slug"}</div>
            <div className="text-[#1a0dab] text-lg leading-tight hover:underline cursor-pointer font-normal" style={{fontFamily:"arial,sans-serif"}}>
              {(seoTitle || name || "Your product SEO title").slice(0, 60)}{(seoTitle || name || "").length > 60 ? "..." : ""}
            </div>
            <div className="text-sm text-gray-700 leading-snug" style={{fontFamily:"arial,sans-serif"}}>
              {(metaDescription || shortDescription || "Your meta description will appear here. Write 120-155 characters that entice users to click.").slice(0, 155)}{(metaDescription || shortDescription || "").length > 155 ? "..." : ""}
            </div>
          </div>
        </div>

        {/* Focus keyphrase */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Focus Keyphrase (English)</label>
          <input
            type="text"
            value={focusKeyphrase}
            onChange={(e) => setFocusKeyphrase(e.target.value)}
            placeholder="e.g., nike air max running shoes"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <p className="text-xs text-gray-500 mt-1">The main keyword you want to rank for on Google.</p>
        </div>

        {/* SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium">SEO Title (English)</label>
            <span className={`text-xs font-medium ${seoTitle.length > 60 ? "text-red-500" : seoTitle.length > 50 ? "text-green-600" : "text-gray-400"}`}>
              {seoTitle.length} / 60
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={name || "Leave empty to use product name"}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        {/* Meta description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium">Meta Description (English)</label>
            <span className={`text-xs font-medium ${metaDescription.length > 155 ? "text-red-500" : metaDescription.length >= 120 ? "text-green-600" : "text-gray-400"}`}>
              {metaDescription.length} / 155
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            placeholder="Write a compelling summary (120-155 chars) that makes users want to click."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
          />
        </div>

        {/* SEO Analysis */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">SEO Analysis</div>
          <div className="space-y-2 text-sm">
            {[
              { pass: seoTitle.length >= 40 && seoTitle.length <= 60, label: `SEO title length (${seoTitle.length} chars)`, hint: "Aim for 40-60 characters" },
              { pass: metaDescription.length >= 120 && metaDescription.length <= 155, label: `Meta description length (${metaDescription.length} chars)`, hint: "Aim for 120-155 characters" },
              { pass: !!focusKeyphrase && (seoTitle || name).toLowerCase().includes(focusKeyphrase.toLowerCase()), label: "Keyphrase in SEO title", hint: "Include your focus keyphrase in the title" },
              { pass: !!focusKeyphrase && metaDescription.toLowerCase().includes(focusKeyphrase.toLowerCase()), label: "Keyphrase in meta description", hint: "Include your focus keyphrase in the description" },
              { pass: !!focusKeyphrase && (longDescription || description).toLowerCase().includes(focusKeyphrase.toLowerCase()), label: "Keyphrase in content", hint: "Use the keyphrase in your product description" },
              { pass: (longDescription || description).length >= 300, label: `Content length (${(longDescription || description).length} chars)`, hint: "Aim for 300+ characters of description" },
            ].map((check, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-[10px] font-bold ${check.pass ? "bg-green-500" : "bg-orange-400"}`}>
                  {check.pass ? "OK" : "!"}
                </span>
                <div className="flex-1">
                  <div className={check.pass ? "text-gray-700" : "text-gray-900 font-medium"}>{check.label}</div>
                  {!check.pass && <div className="text-xs text-gray-500 mt-0.5">{check.hint}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced SEO */}
        <details className="border border-gray-200 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium select-none">
            Advanced (OG Image, Canonical, Robots)
          </summary>
          <div className="p-4 space-y-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium mb-1.5">Open Graph Image URL</label>
              <input type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://... (leave empty to use product image)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              <p className="text-xs text-gray-500 mt-1">Custom image shown when this page is shared on Facebook, WhatsApp, LinkedIn, etc.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Canonical URL</label>
              <input type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="Leave empty for auto (recommended)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              <p className="text-xs text-gray-500 mt-1">Only set if this content also exists on another URL.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} className="w-5 h-5 rounded" />
              <div>
                <div className="text-sm font-medium">Hide from search engines (noindex)</div>
                <div className="text-xs text-gray-500">Prevent Google and Bing from indexing this product.</div>
              </div>
            </label>
          </div>
        </details>

        {/* French SEO */}
        <details className="border border-blue-200 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 bg-blue-50 hover:bg-blue-100 transition text-sm font-medium select-none">
            French SEO (for /fr routes)
          </summary>
          <div className="p-4 space-y-4 border-t border-blue-200 bg-blue-50/30">
            <div>
              <label className="block text-sm font-medium mb-1.5">Focus Keyphrase (French)</label>
              <input type="text" value={focusKeyphraseFr} onChange={(e) => setFocusKeyphraseFr(e.target.value)} placeholder="ex: chaussures de course nike" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Titre SEO (French)</label>
                <span className={`text-xs font-medium ${seoTitleFr.length > 60 ? "text-red-500" : seoTitleFr.length > 50 ? "text-green-600" : "text-gray-400"}`}>
                  {seoTitleFr.length} / 60
                </span>
              </div>
              <input type="text" value={seoTitleFr} onChange={(e) => setSeoTitleFr(e.target.value)} placeholder={nameFr || "Vide = utilise le nom du produit"} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Meta Description (French)</label>
                <span className={`text-xs font-medium ${metaDescriptionFr.length > 155 ? "text-red-500" : metaDescriptionFr.length >= 120 ? "text-green-600" : "text-gray-400"}`}>
                  {metaDescriptionFr.length} / 155
                </span>
              </div>
              <textarea value={metaDescriptionFr} onChange={(e) => setMetaDescriptionFr(e.target.value)} rows={3} placeholder="Description en francais pour les moteurs de recherche (120-155 caracteres)." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
            </div>
          </div>
        </details>
      </div>
      {/* ============================================ END SEO SECTION ============================================ */}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Variants &amp; Media</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Sizes (comma separated)</label>
            <input type="text" value={sizesStr} onChange={(e) => setSizesStr(e.target.value)} placeholder="7, 8, 9, 10, 11, 12" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Colors (comma separated)</label>
            <input type="text" value={colorsStr} onChange={(e) => setColorsStr(e.target.value)} placeholder="Black, White, Red" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              Main Image URL <span className="text-xs text-gray-500 font-normal">(shown in cards &amp; as cover)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/shoe.jpg"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
            {imageUrl && (
              <div className="mt-3 relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden group">
                <img src={imageUrl} alt="Main preview" className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gray-900 text-white text-[9px] font-bold rounded uppercase tracking-wide">Main</div>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              Additional Images <span className="text-xs text-gray-500 font-normal">(gallery thumbnails)</span>
            </label>

            {/* Add new image input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const url = newImageUrl.trim();
                    if (url && !extraImages.includes(url) && url !== imageUrl) {
                      setExtraImages([...extraImages, url]);
                      setNewImageUrl("");
                    }
                  }
                }}
                placeholder="https://example.com/shoe-side.jpg  (press Enter or click Add)"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
              <button
                type="button"
                onClick={() => {
                  const url = newImageUrl.trim();
                  if (url && !extraImages.includes(url) && url !== imageUrl) {
                    setExtraImages([...extraImages, url]);
                    setNewImageUrl("");
                  }
                }}
                className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition flex-shrink-0"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Add multiple photos to create a gallery. Customers can zoom, swipe, and view fullscreen.
            </p>

            {/* Extra images grid */}
            {extraImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {extraImages.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                    <img src={img} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {i + 2}
                    </div>

                    {/* Move up */}
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [...extraImages];
                          [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
                          setExtraImages(arr);
                        }}
                        className="absolute bottom-1 left-1 w-6 h-6 bg-white/90 text-gray-700 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-white"
                        title="Move earlier"
                      >
                        &larr;
                      </button>
                    )}

                    {/* Move down */}
                    {i < extraImages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [...extraImages];
                          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                          setExtraImages(arr);
                        }}
                        className="absolute bottom-1 left-8 w-6 h-6 bg-white/90 text-gray-700 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-white"
                        title="Move later"
                      >
                        &rarr;
                      </button>
                    )}

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => setExtraImages(extraImages.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                      title="Remove"
                    >
                      &times;
                    </button>

                    {/* Set as main */}
                    <button
                      type="button"
                      onClick={() => {
                        const oldMain = imageUrl;
                        setImageUrl(img);
                        const newExtras = extraImages.filter((_, idx) => idx !== i);
                        if (oldMain) newExtras.unshift(oldMain);
                        setExtraImages(newExtras);
                      }}
                      className="absolute bottom-1 right-1 px-2 py-0.5 bg-gray-900 text-white text-[9px] font-bold rounded uppercase tracking-wide opacity-0 group-hover:opacity-100 transition hover:bg-gray-800"
                      title="Set as main image"
                    >
                      Main
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(imageUrl || extraImages.length > 0) && (
              <div className="mt-2 text-xs text-gray-500">
                Total: <span className="font-semibold text-gray-700">{(imageUrl ? 1 : 0) + extraImages.length}</span> image{(imageUrl ? 1 : 0) + extraImages.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SV-001" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Material</label>
            <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Leather, Mesh, etc." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags EN (comma separated)</label>
            <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="hot-deal, new-arrival" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-lg">Visibility</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-5 h-5 rounded" />
          <span className="text-sm font-medium">Featured product (show on homepage)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-5 h-5 rounded" />
          <span className="text-sm font-medium">Active (visible on store)</span>
        </label>
      </div>

      <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition disabled:opacity-50">
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}

// ============================================================
// SETTINGS FORM
// ============================================================
function SettingsForm({
  settings,
  onSave,
  loading,
}: {
  settings: StoreSettings;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [currency, setCurrency] = useState(settings.currency);

  useEffect(() => {
    setStoreName(settings.storeName);
    setWhatsappNumber(settings.whatsappNumber);
    setCurrency(settings.currency);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ storeName, whatsappNumber, currency });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Store Settings</h3>
        <div>
          <label className="block text-sm font-medium mb-1.5">Store Name</label>
          <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">WhatsApp Number</label>
          <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="1234567890 (with country code)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          <p className="text-xs text-gray-400 mt-1">Include country code without + (e.g., 1234567890). Used for WhatsApp checkout.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Currency Symbol</label>
          <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition disabled:opacity-50">
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}

// ============================================================
// SECURITY FORM
// ============================================================
function SecurityForm({
  settings,
  onSave,
  loading,
}: {
  settings: StoreSettings;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}) {
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAccessCode, setAdminAccessCode] = useState(settings.adminAccessCode);
  const [adminPath, setAdminPath] = useState(settings.adminPath);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(settings.maxLoginAttempts.toString());
  const [lockoutMinutes, setLockoutMinutes] = useState(settings.lockoutMinutes.toString());
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    setAdminAccessCode(settings.adminAccessCode);
    setAdminPath(settings.adminPath);
    setMaxLoginAttempts(settings.maxLoginAttempts.toString());
    setLockoutMinutes(settings.lockoutMinutes.toString());
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = {
      adminAccessCode,
      adminPath,
      maxLoginAttempts: parseInt(maxLoginAttempts) || 5,
      lockoutMinutes: parseInt(lockoutMinutes) || 15,
    };
    if (adminPassword) data.adminPassword = adminPassword;
    onSave(data);
  };

  const generateAccessCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setAdminAccessCode(code);
  };

  const copyAdminUrl = () => {
    const url = `${window.location.origin}/${adminPath}`;
    navigator.clipboard.writeText(url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-lg">Security Settings</h3>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700">
              <p className="font-semibold mb-1">Security Notice</p>
              <p>Access Code provides an extra layer of security. When set, users must enter the access code before seeing the password screen.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">New Admin Password</label>
          <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Access Code (Optional Extra Security)</label>
          <div className="flex gap-2">
            <input type="text" value={adminAccessCode} onChange={(e) => setAdminAccessCode(e.target.value.toUpperCase())} placeholder="e.g., SECURE123" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition font-mono" />
            <button type="button" onClick={generateAccessCode} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2">
              <Key className="w-4 h-4" /> Generate
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Leave blank to disable access code requirement.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Admin Panel Path</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-gray-400 text-sm">{typeof window !== "undefined" ? window.location.origin : ""}/</span>
              <input type="text" value={adminPath} onChange={(e) => setAdminPath(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))} className="flex-1 bg-transparent text-sm focus:outline-none font-medium" />
            </div>
            <button type="button" onClick={copyAdminUrl} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2">
              {showCopied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">IMPORTANT: When you set a custom path, /admin will be BLOCKED (404). Use ONLY your custom path to access the panel. Save the path somewhere safe!</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Rate Limiting</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Max Login Attempts</label>
            <input type="number" value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} min="1" max="20" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Lockout Duration (minutes)</label>
            <input type="number" value={lockoutMinutes} onChange={(e) => setLockoutMinutes(e.target.value)} min="1" max="60" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
        </div>
        <p className="text-xs text-gray-400">After {maxLoginAttempts} failed attempts, the IP will be locked out for {lockoutMinutes} minutes.</p>
      </div>

      <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition disabled:opacity-50">
        {loading ? "Saving..." : "Save Security Settings"}
      </button>
    </form>
  );
}