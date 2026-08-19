"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

const BRAND_RED = "#CA3F2E";

export default function VendorProductsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">VendorProductsMy Products</h1>
      <p className="text-gray-500 text-sm mb-8">VendorProductsManage your product catalog</p>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Coming in next update</h2>
        <p className="text-gray-500 text-sm mb-6">This page is being built. Check back very soon!</p>
        <Link href={"/" + locale + "/vendor/dashboard"} className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}