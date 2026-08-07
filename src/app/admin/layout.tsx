"use client";

import { CurrencyProvider } from "@/lib/currency-context";
import { getServerCurrency } from "@/lib/server-currency";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const initialCurrency = await getServerCurrency();
  return (
    <CurrencyProvider initialCurrency={initialCurrency}>
      {children}
    </CurrencyProvider>
  );
}
