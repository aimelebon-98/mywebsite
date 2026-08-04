"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import { Star, Loader2, Trash2, Package, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

interface ReviewRow {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  commentFr: string | null;
  verified: boolean;
  createdAt: string;
  productName: string | null;
  productImage: string | null;
  productSlug: string | null;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star
          key={s}
          className="w-3.5 h-3.5"
          fill={s <= rating ? "#CA3F2E" : "none"}
          stroke={s <= rating ? "#CA3F2E" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

export default function Page() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  const fetchReviews = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const res = await fetch("/api/customer/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      } else {
        setError(isFr ? d("Impossible de charger les avis.") : "Failed to load reviews.");
      }
    } catch {
      setError(isFr ? d("Erreur r\u00e9seau.") : "Network error.");
    }
    setFetching(false);
  }, [isFr]);

  useEffect(() => {
    if (customer) fetchReviews();
  }, [customer, fetchReviews]);

  const handleDelete = async (id: string) => {
    const msg = isFr
      ? d("Supprimer cet avis ? Cette action est irr\u00e9versible.")
      : "Delete this review? This cannot be undone.";
    if (!confirm(msg)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/customer/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch { /* ignore */ }
    setDeleting(null);
  };

  if (loading || !customer) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
    </div>
  );

  const title = isFr ? "Mes avis" : "My Reviews";

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 lg:pt-8 lg:pb-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 lg:w-7 lg:h-7 text-[#CA3F2E]" />
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{title}</h1>
                </div>
                <button onClick={fetchReviews} className="p-2 rounded-xl hover:bg-gray-100 transition" title="Refresh">
                  <RefreshCw className={"w-4 h-4 text-gray-500" + (fetching ? " animate-spin" : "")} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {fetching ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {isFr ? d("Aucun avis pour l\u0027instant") : "No reviews yet"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-5">
                    {isFr
                      ? d("Vos avis appara\u00eetront ici apr\u00e8s votre achat.")
                      : "Your reviews will appear here after you make a purchase."}
                  </p>
                  <Link
                    href={`/${locale}/shop`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition"
                  >
                    {isFr ? "Parcourir la boutique" : "Browse Shop"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">
                    {reviews.length} {reviews.length === 1
                      ? (isFr ? "avis" : "review")
                      : (isFr ? "avis" : "reviews")}
                    {" "}{isFr ? d("publi\u00e9s sous le nom") : "posted as"}{" "}
                    <span className="font-semibold text-gray-800">{customer.name}</span>
                  </p>

                  {reviews.map(r => (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4">
                      {/* Product image */}
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                        {r.productImage ? (
                          <img src={r.productImage} alt={r.productName || ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {r.productSlug ? (
                              <Link
                                href={`/${locale}/product/${r.productSlug}`}
                                className="text-sm font-bold text-gray-900 hover:text-[#CA3F2E] transition line-clamp-1"
                              >
                                {r.productName || r.productId}
                              </Link>
                            ) : (
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                {r.productName || r.productId}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <StarRow rating={r.rating} />
                              {r.verified && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                  {isFr ? d("V\u00e9rifi\u00e9") : "Verified"}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting === r.id}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-40 flex-shrink-0"
                            title={isFr ? "Supprimer" : "Delete"}
                          >
                            {deleting === r.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </div>

                        {r.comment && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                            {isFr && r.commentFr ? r.commentFr : r.comment}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(r.createdAt).toLocaleDateString(isFr ? "fr-FR" : "en-US", {
                            year: "numeric", month: "long", day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <p className="font-semibold mb-1">{isFr ? "Comment" : "How reviews work"}</p>
                    <p>
                      {isFr
                        ? d("Les avis sont li\u00e9s \u00e0 votre nom d\u0027affichage. Si vous changez votre nom, les anciens avis ne seront plus affich\u00e9s ici.")
                        : "Reviews are matched by your display name. If you change your name, older reviews may not appear here."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
