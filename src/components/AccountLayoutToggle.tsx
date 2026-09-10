"use client";

import { useAccountLayout, AccountLayoutMode } from "@/lib/account-layout-context";
import { Sidebar, Layers, LayoutGrid } from "lucide-react";

interface Props {
  isFr?: boolean;
}

export default function AccountLayoutToggle({ isFr = false }: Props) {
  const { layout, setLayout } = useAccountLayout();

  const options: { id: AccountLayoutMode; label: string; icon: typeof Sidebar }[] = [
    { id: "saas", label: isFr ? "SaaS" : "SaaS", icon: Sidebar },
    { id: "tabs", label: isFr ? "Onglets" : "Tabs", icon: Layers },
    { id: "bento", label: isFr ? "Bento" : "Bento", icon: LayoutGrid },
  ];

  return (
    <div className="inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm text-xs font-medium">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = layout === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setLayout(opt.id)}
            type="button"
            className={
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 whitespace-nowrap " +
              (isActive
                ? "bg-[#CA3F2E] text-white shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}