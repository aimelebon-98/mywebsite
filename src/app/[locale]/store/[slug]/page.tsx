"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Store, CheckCircle2, MapPin, Package, Award, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";

const BRAND_RED = "#CA3F2E";

interface StoreData {
  id: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  storeDescriptionFr: string;
  logo: string;
  banner: string;
  trustTagline: string;
  trustTaglineFr: string;
  totalSales: number;
  fulfillmentRate: string;
  country: string;
  city: string;
  approvedAt: string | null;
}

interface Product {
  id: string;
  name: string;
  nameFr: string | null;
  slug: string;
  slugFr: string | null;
  price: string;
  comparePrice: string | null;
  imageUrl: string;
  category: string;
  brand: string;
  rating: string;
  reviewCount: number;
  stock: number;
}

export default function StorefrontPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";
  const { format } = useCurrency();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notExists, setNotExists] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/store/" + slug);
        if (res.status === 404) { setNotExists(true); return; }
        const data = await res.json();
        setStore(data.store);
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (notExists) return notFound();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} />
      </div>
    );
  }

  if (!store) return null;

  const desc = isFr && store.storeDescriptionFr ? store.storeDescriptionFr : store.storeDescription;
  const tagline = isFr && store.trustTaglineFr ? store.trustTaglineFr : store.trustTagline;
  const fulfill = parseFloat(store.fulfillmentRate || "100");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative w-full h-40 md:h-64 bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
        {store.banner ? (
          <img src={store.banner} alt={store.storeName} className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full" style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_RED} 0%, #8B2A1E 100%)` }}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Store header */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-5 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              {store.logo ? (
                <img src={store.logo} alt={store.storeName} className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center border-4 border-white shadow-md flex-shrink-0" style={{ backgroundColor: BRAND_RED }}>
                  <Store className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900">{store.storeName}</h1>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3" />
                    {isFr ? "V\u00e9rifi\u00e9" : "Verified"}
                  </span>
                </div>
                {desc && <p className="text-sm text-gray-600 mb-3 max-w-2xl">{desc}</p>}
                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                  {(store.city || store.country) && (
                    <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{store.city && store.city + ", "}{store.country}</div>
                  )}
                  <div className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{products.length} {products.length === 1 ? (isFr ? "produit" : "product") : (isFr ? "produits" : "products")}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:flex md:gap-4">
                <StatBox label={isFr ? "Ventes" : "Sales"} value={store.totalSales.toString()} Icon={TrendingUp} color="#3B82F6" />
                <StatBox label={isFr ? "Ex\u00e9cution" : "Fulfillment"} value={fulfill.toFixed(0) + "%"} Icon={Award} color="#10B981" />
              </div>
            </div>

            {tagline && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                <Award className="w-4 h-4" style={{ color: BRAND_RED }} />
                <span className="text-gray-700 font-medium">{tagline}</span>
              </div>
            )}
          </div>
        </div>

        {/* Products grid */}
        <div className="pb-16">
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 md:p-16 text-center border border-gray-100">
              <Package className="w-14 h-14 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">{isFr ? "Aucun produit encore" : "No products yet"}</h3>
              <p className="text-gray-500 text-sm">{isFr ? "Revenez bient\u00f4t pour voir les nouveaut\u00e9s." : "Check back soon for new arrivals."}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{isFr ? "Tous les produits" : "All products"}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map(p => {
                  const productName = isFr && p.nameFr ? p.nameFr : p.name;
                  const productSlug = isFr && p.slugFr ? p.slugFr : p.slug;
                  const priceUsd = parseFloat(p.price);
                  const compareUsd = p.comparePrice ? parseFloat(p.comparePrice) : 0;
                  const discount = compareUsd > priceUsd ? Math.round(((compareUsd - priceUsd) / compareUsd) * 100) : 0;
                  const rating = parseFloat(p.rating || "0");

                  return (
                    <Link key={p.id} href={`/${locale}/product/${productSlug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {p.imageUrl && (
                          <Image src={p.imageUrl} alt={productName} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform" />
                        )}
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 text-white text-[10px] font-black px-2 py-0.5 rounded" style={{ backgroundColor: BRAND_RED }}>-{discount}%</span>
                        )}
                        {p.stock === 0 && (
                          <span className="absolute top-2 right-2 bg-gray-900 text-white text-[10px] font-black px-2 py-0.5 rounded">{isFr ? "\u00c9puis\u00e9" : "Sold out"}</span>
                        )}
                      </div>
                      <div className="p-3">
                        {p.brand && <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{p.brand}</div>}
                        <div className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.5em]">{productName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-black text-gray-900">{format(priceUsd)}</span>
                          {discount > 0 && <span className="text-xs text-gray-400 line-through">{format(compareUsd)}</span>}
                        </div>
                        {rating > 0 && (
                          <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                            <span>&#9733;</span>
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-gray-400">({p.reviewCount})</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, Icon, color }: { label: string; value: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[120px]">
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
      <div>
        <div className="text-xs text-gray-500 font-semibold">{label}</div>
        <div className="text-lg font-black text-gray-900">{value}</div>
      </div>
    </div>
  );
}