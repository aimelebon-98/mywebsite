"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { setFbUserMatch } from "@/lib/fbpixel";

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
}

interface CustomerContextType {
  customer: Customer | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/customer/me");
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer || null);
      } else {
        setCustomer(null);
      }
    } catch { setCustomer(null); }
    setLoading(false);
  };

  const logout = async () => {
    await fetch("/api/customer/logout", { method: "POST" });
    setCustomer(null);
    // Redirect to login page, preserving current locale from URL
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
    const localeMatch = currentPath.match(/^\/(en|fr)(\/|$)/);
    const currentLocale = localeMatch ? localeMatch[1] : "en";
    window.location.href = `/${currentLocale}/account/login`;
  };

  useEffect(() => { refresh(); }, []);

  // Meta Pixel Advanced Matching: sync customer email/phone/id whenever it changes
  useEffect(() => {
    if (customer) {
      setFbUserMatch({
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        externalId: customer.id || undefined,
      });
    } else {
      setFbUserMatch({});
    }
  }, [customer]);

  return (
    <CustomerContext.Provider value={{ customer, loading, refresh, logout }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
