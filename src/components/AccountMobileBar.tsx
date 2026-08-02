"use client";

import { Menu } from "lucide-react";

interface Props {
  title: string;
  onOpen: () => void;
}

export default function AccountMobileBar({ title, onOpen }: Props) {
  return (
    <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 mb-4 -mx-4 sm:-mx-6">
      <button
        onClick={onOpen}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-sm">{title}</h1>
    </div>
  );
}