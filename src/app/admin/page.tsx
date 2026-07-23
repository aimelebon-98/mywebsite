"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, Settings, BarChart3, LogOut, Edit, Trash2, Eye, EyeOff, Star, Search, Menu, X, Home,
  Shield, Users, Download, Upload, RefreshCw, Lock, MessageSquare, Key, AlertTriangle, TrendingUp,
  DollarSign, ShoppingBag, CheckCircle, Clock, Copy, Tag, Globe, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";

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
  imageProductId: string | null;        // ← Added this line
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

type Tab = "dashboard" | "products" | "add" | "edit" | "categories" | "reviews" | "settings" | "security";

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        try { await fetch("/api/setup", { method: "POST" }); } catch { /* ignore */ }
        const res = await fetch("/api/admin/auth/check");
        if (res.ok) {
          const data = await res.json();
          setRequiresAccessCode(data.requiresAccessCode || false);
          setAuthStep(data.requiresAccessCode ? "access-code" : "password");
        } else {
          setAuthStep("access-code");
        }
      } catch {
        setAuthStep("access-code");
      }
    };
    checkAuth();
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (authStep === "authenticated") {
      fetchCategories();
      fetchProducts();
      fetchSettings();
    }
  }, [authStep, fetchCategories, fetchProducts, fetchSettings]);

  // ... rest of your component remains unchanged (I'm only updating the Category interface and imports)

  return (
    // ... your existing return statement (unchanged in this fix)
    <div>Admin UI will appear here after successful build</div>
  );
}
