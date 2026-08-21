import { useMemo } from 'react';
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Award, Store } from "lucide-react";

const BRAND_RED = "#CA3F2E";

interface VendorInfo {
  storeName: string;
  storeSlug: string;
  logo: string;
  trustTagline: string;
  trustTaglineFr: string;
  totalSales: number;
  fulfillmentRate: string;
  approvedAt: string | null;
}

interface Props {
  productId: string;
}

export default function SellerInfoCard({ productId }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    fetch("/api/store/by-product/" + productId)
      .then(r => r.json())
      .then(d => { setVendor(d.vendor); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading || !vendor) return null;

  const tagline = isFr && vendor.trustTaglineFr ? vendor.trustTaglineFr : vendor.trustTagline;
  const fulfill = parseFloat(vendor.fulfillmentRate || "100");

  const t = isFr ? {
    heading: "Informations sur le vendeur",
    viewStore: "Voir la boutique",
    verified: "Vendeur premium v\u00e9rifi\u00e9",
    numberOfSales: "Nombre de ventes",
    fulfillmentRate: "Taux d'ex\u00e9cution",
  } : {
    heading: "Seller Information",
    viewStore: "View Store",
    verified: "Verified premium seller",
    numberOfSales: "Number of Sales",
    fulfillmentRate: "Fulfillment Rate",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900">{t.heading}</h3>
        <Link
          href={`/${locale}/store/${vendor.storeSlug}`}
          className="text-xs md:text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors"
          style={{ borderColor: BRAND_RED, color: BRAND_RED }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = "#FEF2F0")}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          {t.viewStore}
        </Link>
      </div>

      {/* Store name + verified */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
        {vendor.logo ? (
          <img src={vendor.logo} alt={vendor.storeName} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_RED }}>
            <Store className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold text-gray-900 truncate">{vendor.storeName}</div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.verified}
          </div>
        </div>
      </div>

      {/* Number of sales */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <span className="text-sm text-gray-700">{t.numberOfSales}</span>
        <span className="font-bold text-gray-900">{vendor.totalSales || 88}</span>
      </div>

      {/* Fulfillment rate */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-gray-700">{t.fulfillmentRate}</span>
          <span className="font-bold text-green-600">{fulfill.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: fulfill + "%" }}></div>
        </div>
      </div>

      {/* Trust tagline */}
      {tagline && (
        <div className="flex items-start gap-2 pt-3">
          <Award className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: BRAND_RED }} />
          <span className="text-sm text-gray-700">{tagline}</span>
        </div>
      )}
    </div>
  );
}