"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wrench, Sparkles, Loader2 } from "lucide-react";
import { displayCurrency } from "@/lib/vendor-currency";
import VendorProductForm, { emptyProduct, type ProductFormData } from "@/components/vendor/VendorProductForm";
import ConciergeForm from "@/components/vendor/ConciergeForm";

const BRAND_RED = "#CA3F2E";

type Mode = "diy" | "concierge";

export default function VendorAddProductPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";

  const [mode, setMode] = useState<Mode>("diy");
  const [vendorCurrency, setVendorCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/me").then(r => r.json()).then(d => {
      setVendorCurrency(d.vendor?.preferredCurrency || "USD");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function submit(data: ProductFormData) {
    const payload = { ...data, description: data.shortDescription || data.name, currency: data.currency || vendorCurrency };
    const res = await fetch("/api/vendor/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Failed");
    router.push(`/${locale}/vendor/products`);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;

  const initial: ProductFormData = { ...emptyProduct(), currency: vendorCurrency };

  return (
    <div className="max-w-4xl">
      <Link href={`/${locale}/vendor/products`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Add new product</h1>
        <p className="text-gray-500 text-sm">Choose how you want to add this product. Prices in <strong>{displayCurrency(vendorCurrency)}</strong> - <Link href={`/${locale}/vendor/settings`} className="underline" style={{ color: BRAND_RED }}>change</Link>.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-8">
        <button
          type="button"
          onClick={() => setMode("diy")}
          className={`text-left p-5 rounded-2xl border-2 transition ${mode === "diy" ? "" : "border-gray-200 hover:border-gray-300 bg-white"}`}
          style={mode === "diy" ? { borderColor: BRAND_RED, backgroundColor: "#FEF2F0" } : undefined}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: mode === "diy" ? BRAND_RED : "#F3F4F6" }}>
              <Wrench className={`w-5 h-5 ${mode === "diy" ? "text-white" : "text-gray-500"}`} />
            </div>
            <div>
              <div className="font-bold text-gray-900">Do it myself</div>
              <div className="text-sm text-gray-500">Free</div>
            </div>
          </div>
          <p className="text-xs text-gray-600">Full control - you fill in every detail, upload images, write descriptions.</p>
        </button>

        <button
          type="button"
          onClick={() => setMode("concierge")}
          className={`text-left p-5 rounded-2xl border-2 transition ${mode === "concierge" ? "" : "border-gray-200 hover:border-gray-300 bg-white"}`}
          style={mode === "concierge" ? { borderColor: BRAND_RED, backgroundColor: "#FEF2F0" } : undefined}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: mode === "concierge" ? BRAND_RED : "#F3F4F6" }}>
              <Sparkles className={`w-5 h-5 ${mode === "concierge" ? "text-white" : "text-gray-500"}`} />
            </div>
            <div>
              <div className="font-bold text-gray-900">Add for me</div>
              <div className="text-sm text-gray-500">From $1</div>
            </div>
          </div>
          <p className="text-xs text-gray-600">Send us your images + basic info. We create the listing for you. Live in 24h.</p>
        </button>
      </div>

      {mode === "diy" ? (
        <VendorProductForm initial={initial} submitLabel="Submit for review" onSubmit={submit} />
      ) : (
        <ConciergeForm onSuccess={() => router.push(`/${locale}/vendor/concierge`)} />
      )}
    </div>
  );
}