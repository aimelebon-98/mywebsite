"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AccountLayoutMode = "saas" | "tabs" | "bento";

interface AccountLayoutContextType {
  layout: AccountLayoutMode;
  setLayout: (mode: AccountLayoutMode) => void;
}

const AccountLayoutContext = createContext<AccountLayoutContextType>({
  layout: "saas",
  setLayout: () => {},
});

export function AccountLayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayoutState] = useState<AccountLayoutMode>("saas");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("ndz_account_layout") as AccountLayoutMode;
      if (saved && (saved === "saas" || saved === "tabs" || saved === "bento")) {
        setLayoutState(saved);
      }
    } catch {}
  }, []);

  const setLayout = (mode: AccountLayoutMode) => {
    setLayoutState(mode);
    try {
      localStorage.setItem("ndz_account_layout", mode);
    } catch {}
  };

  return (
    <AccountLayoutContext.Provider value={{ layout: mounted ? layout : "saas", setLayout }}>
      {children}
    </AccountLayoutContext.Provider>
  );
}

export function useAccountLayout() {
  return useContext(AccountLayoutContext);
}