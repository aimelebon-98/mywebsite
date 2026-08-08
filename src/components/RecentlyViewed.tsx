"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/db/schema";
import ProductCard from "./ProductCard";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface RecentlyViewedProps {
  excludeId?: string;
}

export default function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const t = useTranslations("home");
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const raw = localStorage.getItem("solevault-recently-viewed") || "[]";
        const ids: string[] = JSON.parse(raw);
        if (!Array.isArray(ids) || ids.length === 0) return;

        // Deduplicate while preserving order (most recent first)
        const seen = new Set<string>();
        const uniqueIds = ids.filter((id) => {
          if (!id || typeof id !== "string") return false;
          if (id === excludeId) return false;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }).slice(0, 6);

        if (uniqueIds.length === 0) return;

        // Batch fetch all products in one call
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const allProducts: Product[] = await res.json();

        // Filter and preserve order from localStorage (most recent first)
        const productMap = new Map(allProducts.map((p) => [p.id, p]));
        const matched = uniqueIds
          .map((id) => productMap.get(id))
          .filter((p): p is Product => Boolean(p));

        if (cancelled) return;

        // Clean up stale IDs from localStorage
        try {
          const validIds = matched.map((p) => p.id);
          // Merge with any newer IDs not yet fetched
          const merged = [...new Set([...validIds, ...uniqueIds.filter((id) => productMap.has(id))])];
          localStorage.setItem("solevault-recently-viewed", JSON.stringify(merged));
        } catch { /* ignore */ }

        setRecentProducts(matched);
      } catch {
        // ignore
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [excludeId]);

  if (recentProducts.length === 0) return null;

  let heading = "Recently Viewed";
  let sub = "Products you have viewed recently";
  try {
    heading = t("recentlyViewed");
    sub = t("recentlyViewedDesc");
  } catch { /* fallback */ }

  return (
    <section className="py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">{heading}</h2>
            <p className="text-gray-500 text-sm">{sub}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}