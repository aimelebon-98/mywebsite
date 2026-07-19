"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/db/schema";
import ProductCard from "./ProductCard";
import { Clock } from "lucide-react";

interface RecentlyViewedProps {
  excludeId?: string;
}

export default function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("solevault-recently-viewed") || "[]");
      if (ids.length === 0) return;
      const uniqueIds = [...new Set(ids)].filter(id => id !== excludeId).slice(0, 6);
      if (uniqueIds.length === 0) return;

      Promise.all(
        uniqueIds.map(id =>
          fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null)
        )
      ).then(results => {
        setRecentProducts(results.filter(Boolean) as Product[]);
      });
    } catch {
      // ignore
    }
  }, [excludeId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">Recently Viewed</h2>
            <p className="text-gray-500 text-sm">Pick up where you left off</p>
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
