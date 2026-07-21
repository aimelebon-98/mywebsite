"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, Settings, BarChart3, LogOut, Edit, Trash2, Eye, EyeOff, Star, Search, Menu, X, Home,
  Shield, Users, Download, Upload, RefreshCw, Lock, MessageSquare, Key, AlertTriangle, TrendingUp,
  DollarSign, ShoppingBag, CheckCircle, Clock, Copy
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
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

type Tab = "dashboard" | "products" | "add" | "edit" | "reviews" | "settings" | "security";

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<"loading" | "access-code" | "password" | "authenticated">("loading");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Ensure database tables exist first
        try {
          await fetch("/api/setup", { method: "POST" });
        } catch { /* ignore setup errors */ }

        // First check if access code is required
        const configRes = await fetch("/api/admin/auth");
        const config = await configRes.json();
        setRequiresAccessCode(config.requiresAccessCode);

        // Check existing session
        const sessionRes = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify-session" }),
        });
        
        if (sessionRes.ok) {
          const data = await sessionRes.json();
          if (data.valid) {
            setAuthStep("authenticated");
            return;
          }
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
      fetchSettings();
    }
  }, [authStep, fetchProducts, fetchSettings]);

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

  // Loading state
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

  // Access Code Screen
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
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition">&larr; Back to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  // Password Screen
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
                &larr; Back
              </button>
            )}
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition">Back to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard (authenticated)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + parseFloat(p.price) * p.stock, 0);
  const activeCount = products.filter(p => p.active).length;
  const featuredCount = products.filter(p => p.featured).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-slide-in flex items-center gap-2 ${
          notificationType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {notificationType === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {notification}
        </div>
      )}

      {/* Sidebar */}
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
            { id: "reviews" as Tab, icon: MessageSquare, label: "Reviews" },
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

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold capitalize">
              {activeTab === "add" ? "Add Product" : activeTab === "edit" ? "Edit Product" : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchProducts} className="p-2 hover:bg-gray-100 rounded-xl" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total Products", value: products.length, icon: Package, color: "blue" },
                  { label: "Active", value: activeCount, icon: CheckCircle, color: "green" },
                  { label: "Featured", value: featuredCount, icon: Star, color: "amber" },
                  { label: "Total Stock", value: totalStock, icon: ShoppingBag, color: "purple" },
                  { label: "Low Stock", value: lowStockCount, icon: AlertTriangle, color: "orange" },
                  { label: "Out of Stock", value: outOfStockCount, icon: X, color: "red" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className={`w-8 h-8 bg-${stat.color}-50 rounded-lg flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Value & Quick Actions */}
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
                    <button onClick={handleExportProducts} className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Recent Products</h3>
                  <button onClick={() => setActiveTab("products")} className="text-sm text-brand-600 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">ðŸ‘Ÿ</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{p.category} Â· {p.stock} in stock</p>
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

          {/* Products Tab */}
          {activeTab === "products" && (
            <ProductsTab
              products={filteredProducts}
              searchTerm={searchTerm}
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

          {/* Add Product Tab */}
          {activeTab === "add" && (
            <ProductForm
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

          {/* Edit Product Tab */}
          {activeTab === "edit" && editingProduct && (
            <ProductForm
              product={editingProduct}
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

          {/* Reviews Tab */}
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

          {/* Settings Tab */}
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

          {/* Security Tab */}
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
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

// Products Tab Component
function ProductsTab({
  products, searchTerm, setSearchTerm, onEdit, onDelete, onToggleActive, onToggleFeatured, onBulkAction, onExport, onAdd, loading
}: {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
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
                    <input type="checkbox" checked={selectedIds.length === products.length} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
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
                            <div className="w-full h-full flex items-center justify-center">ðŸ‘Ÿ</div>
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[150px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500 hidden sm:table-cell">{p.category}</td>
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

// Product Form Component
function ProductForm({
  product,
  onSave,
  loading,
}: {
  product?: Product;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [shortDescription, setShortDescription] = useState((product as unknown as Record<string, string>)?.shortDescription || "");
  const [longDescription, setLongDescription] = useState((product as unknown as Record<string, string>)?.longDescription || "");
  const [price, setPrice] = useState(product?.price || "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice || "");
  const [category, setCategory] = useState(product?.category || "sneakers");
  const [brand, setBrand] = useState(product?.brand || "");
  const [sizesStr, setSizesStr] = useState(product ? (JSON.parse(product.sizes || "[]") as string[]).join(", ") : "7, 8, 9, 10, 11, 12");
  const [colorsStr, setColorsStr] = useState(product ? (JSON.parse(product.colors || "[]") as string[]).join(", ") : "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active !== false);
  const [material, setMaterial] = useState(product?.material || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [tagsStr, setTagsStr] = useState(product?.tags ? (JSON.parse(product.tags) as string[]).join(", ") : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(",").map((c) => c.trim()).filter(Boolean);
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);

    onSave({
      name, description, shortDescription, longDescription,
      price: parseFloat(price) || 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      category, brand, sizes, colors,
      imageUrl,
      images: imageUrl ? [imageUrl] : [],
      stock: parseInt(stock) || 0,
      featured, active,
      material, sku, tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Basic Information</h3>
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
            <p className="text-xs text-gray-400 mb-1.5">Detailed product description shown on the product page. Include materials, features, use cases, etc.</p>
            <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} placeholder="Provide a detailed description of the product including materials, comfort features, design details, ideal use cases, care instructions, etc." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none" />
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
              <option value="sneakers">Sneakers</option>
              <option value="running">Running</option>
              <option value="formal">Formal</option>
              <option value="boots">Boots</option>
              <option value="sandals">Sandals</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Brand</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-lg">Variants & Media</h3>
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
            <label className="block text-sm font-medium mb-1.5">Image URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/shoe.jpg" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
            {imageUrl && <div className="mt-3 w-24 h-24 bg-gray-100 rounded-xl overflow-hidden"><img src={imageUrl} alt="Preview" className="w-full h-full object-cover" /></div>}
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
            <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
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

// Settings Form Component
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

// Security Form Component  
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
          <p className="text-xs text-gray-400 mt-1">⚠️ IMPORTANT: When you set a custom path, `/admin` will be BLOCKED (404). Use ONLY your custom path to access the panel. Save the path somewhere safe!</p>
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



