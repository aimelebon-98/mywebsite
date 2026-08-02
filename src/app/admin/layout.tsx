"use client";

import { CurrencyProvider } from "@/lib/currency-context";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
}
