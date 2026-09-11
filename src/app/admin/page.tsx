"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, BarChart3, BookOpen, CheckCircle, ChevronDown, ChevronRight, Clock, Copy, DollarSign, Download, Edit, ExternalLink, Eye, EyeOff, Gift, Globe, HelpCircle, Home, Key, LifeBuoy, Lock, LogOut, Mail, Menu, MessageSquare, Package, Plus, RefreshCw, Search, Settings, Shield, ShoppingBag, Sparkles, Star, Store, Tag, Ticket, Trash2, TrendingUp, Users, UsersRound, Wallet, X
} from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "@/db/schema";
import AuthorsManager from "@/components/AuthorsManager";
import BlogCategoriesManager from "@/components/BlogCategoriesManager";
import CustomersManager from "@/components/CustomersManager";
import TicketsManager from "@/components/TicketsManager";
import BlogPostsList from "@/components/BlogPostsList";
import BlogPostForm from "@/components/BlogPostForm";
import CommentsManager from "@/components/CommentsManager";
import DashboardBlogStats from "@/components/DashboardBlogStats";
import ProductForm from "@/components/ProductForm";
import OrdersManager from "@/components/OrdersManager";
import DashboardOrderStats from "@/components/DashboardOrderStats";
import ProductFaqsManager from "@/components/ProductFaqsManager";
import Turnstile from "@/components/Turnstile";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import ProfitDashboard from "@/components/ProfitDashboard";
import BundlesManager from "@/components/BundlesManager";
import CurrencySelector from "@/components/CurrencySelector";
import CouponsManager from "@/components/CouponsManager";
import VendorApplicationsManager from "@/components/VendorApplicationsManager";
import ConciergeRequestsManager from "@/components/ConciergeRequestsManager";
import VendorsManager from "@/components/VendorsManager";
import VendorProductsManager from "@/components/VendorProductsManager";
import ReviewsManager from "@/components/ReviewsManager";
import VendorPayoutsManager from "@/components/VendorPayoutsManager";
import AffiliateApplicationsManager from "@/components/AffiliateApplicationsManager";
import AffiliatesManager from "@/components/AffiliatesManager";
import AffiliatePayoutsManager from "@/components/AffiliatePayoutsManager";
import BrokerClaimsManager from "@/components/BrokerClaimsManager";

interface Product {
  id: string;
  name: string;
  slug?: string;
  slugFr?: string | null;
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

type Tab = "dashboard" | "broker-claims" | "products" | "add" | "edit" | "categories" | "reviews" | "settings" | "security" | "blog" | "blog-add" | "blog-edit" | "authors" | "comments" | "orders" | "product-faqs" | "analytics" | "newsletter" | "bundles" | "blog-categories" | "customers" | "tickets" | "coupons" | "profit" | "vendor-applications" | "concierge-requests" | "vendors" | "vendor-products" | "vendor-payouts" | "affiliate-applications" | "affiliates" | "affiliate-payouts";

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<"loading" | "verify" | "access-code" | "password" | "authenticated">("loading");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);

  const [activeTab, setActiveTabRaw] = useState<Tab>("dashboard");

  const setActiveTab = (tab: Tab) => {
    setActiveTabRaw(tab);
    try {
      localStorage.setItem("sv_admin_tab", tab);
      if (tab !== "edit" && tab !== "blog-edit") {
        window.history.replaceState(null, "", "#" + tab);
      }
    } catch { /* ignore */ }
  };

  const [tabRestored, setTabRestored] = useState(false);
  useEffect(() => {
    if (authStep !== "authenticated") return;
    if (tabRestored) return;
    try {
      const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
      const stored = typeof window !== "undefined" ? localStorage.getItem("sv_admin_tab") : null;
      const candidate = hash || stored || "";
      const validTabs: Tab[] = ["dashboard","broker-claims","products","add","edit","categories","reviews","settings","security","blog","blog-add","blog-edit","authors","comments","orders","analytics","product-faqs","newsletter","customers","tickets","bundles","blog-categories","coupons","profit","vendor-applications","concierge-requests","vendors","vendor-products","vendor-payouts","affiliate-applications","affiliates","affiliate-payouts"];
      if (candidate && validTabs.includes(candidate as Tab)) {
        if (candidate === "edit") setActiveTabRaw("products");
        else if (candidate === "blog-edit") setActiveTabRaw("blog");
        else setActiveTabRaw(candidate as Tab);
      }
      setTabRestored(true);
    } catch {
      setTabRestored(true);
    }
  }, [authStep, tabRestored]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "NewDealZone",
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
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [notifCounts, setNotifCounts] = useState<{ orders: number; comments: number; reviews: number; newsletter: number; tickets: number; vendorApplications: number; conciergeRequests: number; vendorProducts: number; vendorPayouts: number }>({ orders: 0, comments: 0, reviews: 0, newsletter: 0, tickets: 0, vendorApplications: 0, conciergeRequests: 0, vendorProducts: 0, vendorPayouts: 0 });
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        try { await fetch("/api/setup", { method: "POST" }); } catch {}
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
        setAuthStep("verify");
      } catch {
        setAuthStep("verify");
      }
    };
    checkAuth();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?active=false");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.storeName) setStoreSettings(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (authStep === "authenticated") {
      fetchProducts();
      fetchCategories();
      fetchSettings();
    }
  }, [authStep, fetchProducts, fetchCategories, fetchSettings]);

  useEffect(() => {
    if (authStep !== "authenticated") return;
    const fetchCounts = () => {
      Promise.all([
        fetch("/api/admin/notification-counts").then(r => r.ok ? r.json() : { orders: 0, comments: 0, reviews: 0, newsletter: 0, vendorApplications: 0, conciergeRequests: 0, vendorProducts: 0, vendorPayouts: 0 }),
        fetch("/api/admin/tickets/unread").then(r => r.ok ? r.json() : { count: 0 }),
      ]).then(([counts, unread]) => {
        setNotifCounts({ ...counts, tickets: unread.count || 0 });
      }).catch(() => {});
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
          accessCode: requiresAccessCode ? accessCode : undefined,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthStep("authenticated");
        setAuthError("");
      } else {
        setAuthError(data.error || "Invalid password");
        setTurnstileToken("");
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
    } catch {}
    setAuthStep("verify");
    setPassword("");
    setTurnstileToken("");
    setAccessCode("");
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

  if (authStep === "verify") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${turnstileToken ? "bg-green-500 scale-110" : "bg-gray-900"}`}>
              {turnstileToken ? <CheckCircle className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-2xl font-bold">{turnstileToken ? "Verified!" : "Security Verification"}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {turnstileToken ? "Redirecting..." : "Verifying you are human..."}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`flex justify-center items-center min-h-[65px] relative transition-opacity duration-300 ${turnstileToken ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="relative z-10">
                <Turnstile
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setAuthError("");
                    setTimeout(() => {
                      setAuthStep(requiresAccessCode ? "access-code" : "password");
                    }, 800);
                  }}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                  theme="light"
                />
              </div>
            </div>
            {authError && <p className="text-red-500 text-sm mt-4 text-center">{authError}</p>}
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
        </div>
      </div>
    );
  }

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

      {/* GROUPED SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform lg:relative lg:translate-x-0 flex flex-col h-screen lg:sticky lg:top-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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

        <nav className="admin-scroll px-3 space-y-4 flex-1 overflow-y-auto pb-4 min-h-0 text-xs">
          {/* GROUP 1: E-COMMERCE */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              E-Commerce & Sales
            </div>
            {[
              { id: "dashboard" as Tab, icon: BarChart3, label: "Dashboard", badge: 0 },
              { id: "analytics" as Tab, icon: TrendingUp, label: "Analytics", badge: 0 },
              { id: "profit" as Tab, icon: DollarSign, label: "Profit & Sales", badge: 0 },
              { id: "orders" as Tab, icon: ShoppingBag, label: "Orders", badge: notifCounts.orders },
              { id: "customers" as Tab, icon: Users, label: "Customers", badge: 0 },
              { id: "tickets" as Tab, icon: LifeBuoy, label: "Support Tickets", badge: notifCounts.tickets },
              { id: "bundles" as Tab, icon: Gift, label: "Bundles", badge: 0 },
              { id: "coupons" as Tab, icon: Ticket, label: "Coupons", badge: 0 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${
                  activeTab === item.id ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-red-600">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* PRODUCTS CATALOG COLLAPSIBLE */}
          <div className="space-y-1">
            <button
              onClick={() => setProductsMenuOpen(!productsMenuOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${
                activeTab === "products" || activeTab === "add" || activeTab === "edit" || activeTab === "categories" || activeTab === "reviews" || activeTab === "product-faqs"
                  ? "bg-gray-900 text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Package className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Products Catalog</span>
              {productsMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {productsMenuOpen && (
              <div className="ml-3 space-y-1 border-l-2 border-gray-100 pl-2">
                <button onClick={() => { setActiveTab("products"); setSidebarOpen(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${activeTab === "products" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>All Products</button>
                <button onClick={() => { setActiveTab("add"); setSidebarOpen(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${activeTab === "add" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>+ Add Product</button>
                <button onClick={() => { setActiveTab("categories"); setSidebarOpen(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${activeTab === "categories" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>Categories</button>
                <button onClick={() => { setActiveTab("reviews"); setSidebarOpen(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${activeTab === "reviews" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>Reviews</button>
                <button onClick={() => { setActiveTab("product-faqs"); setSidebarOpen(false); }} className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${activeTab === "product-faqs" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>Product FAQs</button>
              </div>
            )}
          </div>

          {/* GROUP 2: AFFILIATE NETWORK */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Affiliate Network & MLMs
            </div>
            {[
              { id: "broker-claims" as Tab, icon: Gift, label: "Broker Claims ($20 Promo)", badge: 0 },
              { id: "affiliate-applications" as Tab, icon: Sparkles, label: "Applications", badge: 0 },
              { id: "affiliates" as Tab, icon: Users, label: "Affiliate Members", badge: 0 },
              { id: "affiliate-payouts" as Tab, icon: Wallet, label: "Affiliate Payouts", badge: 0 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${
                  activeTab === item.id ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </div>

          {/* GROUP 3: MULTI-VENDOR */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Multi-Vendor Marketplace
            </div>
            {[
              { id: "vendor-applications" as Tab, icon: Store, label: "Vendor Applications", badge: notifCounts.vendorApplications },
              { id: "concierge-requests" as Tab, icon: Sparkles, label: "Concierge Requests", badge: notifCounts.conciergeRequests },
              { id: "vendors" as Tab, icon: Store, label: "Vendors List", badge: 0 },
              { id: "vendor-products" as Tab, icon: Package, label: "Vendor Products", badge: notifCounts.vendorProducts },
              { id: "vendor-payouts" as Tab, icon: DollarSign, label: "Vendor Payouts", badge: notifCounts.vendorPayouts },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${
                  activeTab === item.id ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-red-600">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* GROUP 4: BLOG & CONTENT */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Content & Blog
            </div>
            {[
              { id: "blog" as Tab, icon: BookOpen, label: "Blog Posts", badge: 0 },
              { id: "blog-categories" as Tab, icon: Tag, label: "Blog Categories", badge: 0 },
              { id: "authors" as Tab, icon: UsersRound, label: "Authors", badge: 0 },
              { id: "comments" as Tab, icon: MessageSquare, label: "Comments", badge: notifCounts.comments },
              { id: "newsletter" as Tab, icon: Mail, label: "Newsletter", badge: notifCounts.newsletter },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${
                  activeTab === item.id ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-red-600">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* GROUP 5: SYSTEM */}
          <div className="space-y-1 pt-1 border-t border-gray-100">
            {[
              { id: "settings" as Tab, icon: Settings, label: "Store Settings", badge: 0 },
              { id: "security" as Tab, icon: Shield, label: "Security", badge: 0 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${
                  activeTab === item.id ? "bg-gray-900 text-white font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </div>
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
              {activeTab === "broker-claims" ? "Partner Broker Claims ($20 Promo)" : activeTab === "add" ? "Add Product" : activeTab === "edit" ? "Edit Product" : activeTab === "blog-add" ? "New Blog Post" : activeTab === "blog-edit" ? "Edit Blog Post" : activeTab === "blog" ? "Blog Posts" : activeTab === "blog-categories" ? "Blog Categories" : activeTab === "customers" ? "Customers" : activeTab === "tickets" ? "Support Tickets" : activeTab === "coupons" ? "Coupons" : activeTab === "newsletter" ? "Newsletter Subscribers" : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <button onClick={() => { fetchProducts(); fetchCategories(); }} className="p-2 hover:bg-gray-100 rounded-xl" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "broker-claims" && (
            <BrokerClaimsManager />
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <DashboardOrderStats onOpenOrders={() => setActiveTab("orders")} />
            </div>
          )}

          {activeTab === "profit" && <ProfitDashboard />}
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "customers" && <CustomersManager />}
          {activeTab === "tickets" && <TicketsManager />}
          {activeTab === "vendor-applications" && <VendorApplicationsManager />}
          {activeTab === "concierge-requests" && <ConciergeRequestsManager />}
          {activeTab === "vendors" && <VendorsManager />}
          {activeTab === "vendor-products" && <VendorProductsManager />}
          {activeTab === "vendor-payouts" && <VendorPayoutsManager />}
          {activeTab === "affiliate-applications" && <AffiliateApplicationsManager />}
          {activeTab === "affiliates" && <AffiliatesManager />}
          {activeTab === "affiliate-payouts" && <AffiliatePayoutsManager />}
          {activeTab === "bundles" && <BundlesManager />}
          {activeTab === "coupons" && <CouponsManager onNotify={showNotification} />}
          {activeTab === "product-faqs" && <ProductFaqsManager />}
          {activeTab === "newsletter" && <NewsletterTab onNotify={showNotification} />}
          {activeTab === "orders" && <OrdersManager onNotify={showNotification} />}
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}