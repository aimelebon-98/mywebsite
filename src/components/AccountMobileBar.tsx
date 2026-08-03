"use client";

import { Menu } from "lucide-react";

interface Props {
  title: string;
  onOpen: () => void;
}

// Sticky mobile bar for account pages - sits directly below navbar
// Uses top-0 + z-30 so it works regardless of navbar height (which varies by locale)
export default function AccountMobileBar({ title, onOpen }: Props) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 mb-4 shadow-sm">
      <button
        onClick={onOpen}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-sm truncate flex-1">{title}</h1>
    </div>
  );
}