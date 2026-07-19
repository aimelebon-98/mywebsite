"use client";

import { useState } from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const seed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setDone(true);
        window.location.reload();
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  if (done) return <span className="text-green-600 font-semibold">✓ Products added!</span>;

  return (
    <button
      onClick={seed}
      disabled={loading}
      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
    >
      {loading ? "Adding..." : "Add Sample Products"}
    </button>
  );
}
