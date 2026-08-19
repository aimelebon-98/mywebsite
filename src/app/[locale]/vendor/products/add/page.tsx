"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VendorProductForm, { emptyProduct, type ProductFormData } from "@/components/vendor/VendorProductForm";

const BRAND_RED = "#CA3F2E";

export default function VendorAddProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

  async function submit(data: ProductFormData) {
    const payload = {
      ...data,
      description: data.shortDescription || data.name,
    };
    const res = await fetch("/api/vendor/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Failed");
    router.push(`/${locale}/vendor/products`);
  }

  return (
    <div className="max-w-4xl">
      <Link href={`/${locale}/vendor/products`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Add new product</h1>
        <p className="text-gray-500 text-sm">Fill in the details. Product will be submitted for admin review before going live.</p>
      </div>
      <VendorProductForm initial={emptyProduct()} submitLabel="Submit for review" onSubmit={submit} />
    </div>
  );
}