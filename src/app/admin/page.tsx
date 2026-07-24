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
import ProductForm from "@/components/ProductForm";
import OrdersManager from "@/components/OrdersManager";
import DashboardOrderStats from "@/components/DashboardOrderStats";

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

type Tab = "dashboard" | "products" | "add" | "edit" | "categories" | "reviews" | "settings" | "security" | "blog" | "blog-add" | "blog-edit" | "authors" | "comments" | "orders";

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
  const [notifCounts, setNotifCounts] = useState<{ orders: number; comments: number; reviews: number }>({ orders: 0, comments: 0, reviews: 0 });
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

  // Fetch notification badge counts every 30 seconds
  useEffect(() => {
    if (authStep !== "authenticated") return;
    const fetchCounts = () => {
      fetch("/api/admin/notification-counts")
        .then(r => r.ok ? r.json() : { orders: 0, comments: 0, reviews: 0 })
        .then(setNotifCounts)
        .catch(() => {});
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [authStep]);

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

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform lg:relative lg:translate-x-0 flex flex-col h-screen lg:h-auto lg:sticky lg:top-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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

        <nav className="px-3 space-y-1 flex-1 overflow-y-auto pb-4 min-h-0">
          {[
            { id: "dashboard" as Tab, icon: BarChart3, label: "Dashboard", badge: 0 },
            { id: "products" as Tab, icon: Package, label: "Products", badge: 0 },
            { id: "orders" as Tab, icon: ShoppingBag, label: "Orders", badge: notifCounts.orders },
            { id: "add" as Tab, icon: Plus, label: "Add Product", badge: 0 },
            { id: "categories" as Tab, icon: Tag, label: "Categories", badge: 0 },
            { id: "reviews" as Tab, icon: MessageSquare, label: "Reviews", badge: notifCounts.reviews },
            { id: "blog" as Tab, icon: BookOpen, label: "Blog Posts", badge: 0 },
            { id: "authors" as Tab, icon: UsersRound, label: "Authors", badge: 0 },
            { id: "comments" as Tab, icon: MessageSquare, label: "Comments", badge: notifCounts.comments },
            { id: "settings" as Tab, icon: Settings, label: "Store Settings", badge: 0 },
            { id: "security" as Tab, icon: Shield, label: "Security", badge: 0 },
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
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span
                  className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    activeTab === item.id
                      ? "bg-white text-gray-900"
                      : "text-white"
                  }`}
                  style={activeTab !== item.id ? { backgroundColor: "#CA3F2E" } : undefined}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex-none p-3 space-y-1 border-t border-gray-100 bg-white">
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

      <div className="flex-1 min-w-0 flex flex-col h-screen lg:h-auto lg:min-h-screen">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 flex-none">
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

          {activeTab === "orders" && (
            <OrdersManager onNotify={showNotification} />
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