"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import VendorProductForm, { emptyProduct, type ProductFormData } from "@/components/vendor/VendorProductForm";

const BRAND_RED = "#CA3F2E";

export default function VendorEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const id = (params?.id as string) || "";

  const [initial, setInitial] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/products/" + id);
        if (res.status === 404) { setNotFound(true); setLoading(false); return; }
        const data = await res.json();
        const p = data.product;
        if (!p) { setNotFound(true); setLoading(false); return; }

        const parsed = emptyProduct();
        parsed.name = p.name || "";
        parsed.nameFr = p.nameFr || "";
        parsed.description = p.description || "";
        parsed.descriptionFr = p.descriptionFr || "";
        parsed.shortDescription = p.shortDescription || "";
        parsed.shortDescriptionFr = p.shortDescriptionFr || "";
        parsed.longDescription = p.longDescription || "";
        parsed.longDescriptionFr = p.longDescriptionFr || "";
        parsed.price = p.price || "";
        parsed.comparePrice = p.comparePrice || "";
        parsed.category = p.category || "sneakers";
        parsed.brand = p.brand || "";
        parsed.material = p.material || "";
        parsed.sku = p.sku || "";
        parsed.stock = p.stock || 0;
        parsed.imageUrl = p.imageUrl || "";
        parsed.ogImage = p.ogImage || "";
        parsed.seoTitle = p.seoTitle || "";
        parsed.seoTitleFr = p.seoTitleFr || "";
        parsed.metaDescription = p.metaDescription || "";
        parsed.metaDescriptionFr = p.metaDescriptionFr || "";
        parsed.focusKeyphrase = p.focusKeyphrase || "";
        parsed.focusKeyphraseFr = p.focusKeyphraseFr || "";
        parsed.originCountry = p.originCountry || "NG";
        parsed.originCity = p.originCity || "";
        try { parsed.sizes = JSON.parse(p.sizes || "[]"); } catch {}
        try { parsed.colors = JSON.parse(p.colors || "[]"); } catch {}
        try { parsed.images = JSON.parse(p.images || "[]"); } catch {}
        try { parsed.tags = JSON.parse(p.tags || "[]"); } catch {}
        try { parsed.tagsFr = JSON.parse(p.tagsFr || "[]"); } catch {}
        setInitial(parsed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function submit(data: ProductFormData) {
    const res = await fetch("/api/vendor/products/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Failed");
    router.push(`/${locale}/vendor/products`);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;
  if (notFound || !initial) return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
        <p className="text-gray-500">Product not found</p>
        <Link href={`/${locale}/vendor/products`} className="inline-flex items-center gap-2 mt-4 text-sm font-semibold" style={{ color: BRAND_RED }}>
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <Link href={`/${locale}/vendor/products`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Edit product</h1>
        <p className="text-gray-500 text-sm">Editing will resubmit the product for admin review.</p>
      </div>
      <VendorProductForm initial={initial} submitLabel="Save & resubmit" onSubmit={submit} isEdit />
    </div>
  );
}