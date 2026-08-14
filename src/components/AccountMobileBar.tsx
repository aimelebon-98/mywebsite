"use client";

import { Menu } from "lucide-react";

interface Props {
  title: string;
  onOpen: () => void;
}

// Sticky mobile bar - stacks naturally with sticky navbar above it
export default function AccountMobileBar({ title, onOpen }: Props) {
  return (
    <div className="lg:hidden sticky top-14 z-30 -mx-4 sm:-mx-6 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm mb-4">
      <button
        onClick={onOpen}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="font-bold text-gray-900 text-sm truncate flex-1 min-w-0">{title}</h1>
    </div>
  );
}