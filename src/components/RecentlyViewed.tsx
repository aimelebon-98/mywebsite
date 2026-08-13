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
        if (!Array.isArray(ids) || ids.length === 0) {
          if (typeof window !== "undefined") {
            console.log("[RecentlyViewed] No IDs in localStorage");
          }
          return;
        }

        // Dedup while preserving order
        const seen = new Set<string>();
        const uniqueIds = ids.filter((id) => {
          if (!id || typeof id !== "string") return false;
          if (id === excludeId) return false;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        }).slice(0, 6);

        if (typeof window !== "undefined") {
          console.log("[RecentlyViewed] localStorage IDs:", ids.length, "| unique after filter:", uniqueIds.length);
        }

        if (uniqueIds.length === 0) return;

        // Batch fetch all products
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) {
          console.warn("[RecentlyViewed] /api/products failed:", res.status);
          return;
        }
        const allProducts: Product[] = await res.json();
        const productMap = new Map(allProducts.map((p) => [p.id, p]));

        const matched = uniqueIds
          .map((id) => productMap.get(id))
          .filter((p): p is Product => Boolean(p));

        if (typeof window !== "undefined") {
          console.log("[RecentlyViewed] matched products:", matched.length);
        }

        if (cancelled) return;

        // Cleanup: remove stale IDs (deleted products) from localStorage
        try {
          const validIds = ids.filter((id) => productMap.has(id));
          if (validIds.length !== ids.length) {
            localStorage.setItem("solevault-recently-viewed", JSON.stringify(validIds));
          }
        } catch { /* ignore */ }

        setRecentProducts(matched);
      } catch (err) {
        console.error("[RecentlyViewed] error:", err);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [excludeId]);

  if (recentProducts.length === 0) return null;

  let heading = "Recently Viewed";
  let sub = "Pick up where you left off";
  try {
    heading = t("recentlyViewed");
    sub = t("recentlyViewedDesc");
  } catch { /* fallback */ }

  return (
    <section className="py-10 lg:py-14 overflow-x-hidden">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-full">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}