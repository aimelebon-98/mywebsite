"use client";
import { sanitizeHtml } from "@/lib/sanitize";
import { useCurrency } from "@/lib/currency-context";
import { parseColorVariants } from "@/lib/color-variants";
import { getProductName, getProductShortDescription, getProductLongDescription } from "@/lib/product-i18n";
import { getColorHexPair } from "@/lib/color-map";
import StockBadge from "@/components/StockBadge";
import { trackEvent } from "@/components/AnalyticsTracker";
import ProductFaqDisplay from "@/components/ProductFaqDisplay";
import { trackViewContent as fbTrackViewContent } from "@/lib/fbpixel";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import type { Product, Review } from "@/db/schema";
import { ChevronDown, ChevronRight, Home, Phone, X,
  ShoppingBag, Heart, Minus, Plus, Check, Star, Truck, Shield, RotateCcw,
  Zap, Package, Ruler, Scale, MessageSquare, Send, Share2, Award, Sparkles, Eye
} from "lucide-react";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import SellerInfoCard from "@/components/SellerInfoCard";

interface ProductDetailsProps {
  product: Product;
  initialReviews?: Review[];
  relatedProducts?: Product[];
  locale?: string;
}

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-emerald-400 to-green-600",
  "from-purple-400 to-violet-600",
  "from-amber-400 to-orange-600",
  "from-teal-400 to-cyan-600",
  "from-red-400 to-red-600",
  "from-indigo-400 to-indigo-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function ProductDetails({ product, initialReviews = [], relatedProducts = [], locale: propLocale }: ProductDetailsProps) {

  // Meta Pixel: fire ViewContent when product page loads
  const __fbProductId = (product as unknown as { id?: string })?.id ?? "";
  const __fbProductName = (product as unknown as { name?: string })?.name ?? "";
  const __fbProductPrice = Number((product as unknown as { price?: string | number })?.price ?? 0);
  const __fbProductBrand = (product as unknown as { brand?: string })?.brand ?? "";
  const __fbProductCategory = (product as unknown as { category?: string })?.category ?? "";
  // eslint-disable-next-line react-hooks/rules-of-hooks
  require("react").useEffect(() => {
    if (!__fbProductId) return;
    try {
      fbTrackViewContent({
        content_ids: [String(__fbProductId)],
        content_name: __fbProductName,
        value: __fbProductPrice,
        currency: "USD",
        content_category: __fbProductCategory,
        brand: __fbProductBrand,
      });
    } catch { /* ignore */ }
  }, [__fbProductId, __fbProductName, __fbProductPrice, __fbProductCategory, __fbProductBrand]);
  const t = useTranslations("productDetails");
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggle: toggleWishlist, isWished } = useWishlist();
  const isFr = locale === "fr";
  const router = useRouter();
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const sizes: string[] = JSON.parse(product.sizes || "[]");
  const colorVariants = parseColorVariants(product.colors);
  const colors: string[] = colorVariants.map(v => v.name);
  const rating = parseFloat(product.rating ?? "0");

  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const { format: formatPrice, currency, visitorCountry } = useCurrency();
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");

  // Sticky mini cart: switches to fixed positioning when scrolled past, hides at tabs end
  const stickyCardRef = useRef<HTMLDivElement | null>(null);
  const stickyPlaceholderRef = useRef<HTMLDivElement | null>(null);
  const tabsEndRef = useRef<HTMLDivElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(true);
  const [stickyIsFixed, setStickyIsFixed] = useState(false);
  const [stickyCardWidth, setStickyCardWidth] = useState<number | "auto">("auto");
  const [stickyCardHeight, setStickyCardHeight] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!tabsEndRef.current || !stickyCardRef.current || !stickyPlaceholderRef.current) return;
      // Only run on desktop
      if (window.innerWidth < 1024) {
        setStickyIsFixed(false);
        setStickyVisible(true);
        return;
      }

      const placeholderRect = stickyPlaceholderRef.current.getBoundingClientRect();
      const boundaryTop = tabsEndRef.current.getBoundingClientRect().top;
      const cardHeight = stickyCardRef.current.getBoundingClientRect().height;
      const OFFSET_TOP = 128; // matches top-32

      // Store dimensions before switching to fixed
      if (!stickyIsFixed && placeholderRect.width > 0) {
        setStickyCardWidth(placeholderRect.width);
        setStickyCardHeight(cardHeight);
      }

      // Should the card become fixed? When placeholder top would go above OFFSET_TOP
      const shouldBeFixed = placeholderRect.top <= OFFSET_TOP;

      // Should the card be visible? Only if tabs section end is still below the fixed card position
      const shouldShow = boundaryTop > OFFSET_TOP + cardHeight;

      setStickyIsFixed(shouldBeFixed && shouldShow);
      setStickyVisible(shouldShow);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [stickyIsFixed]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  // Track product view for analytics
  useEffect(() => {
    trackEvent({
      eventType: "product_view",
      productId: product.id,
      productName: product.name,
    });
  }, [product.id, product.name]);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const REVIEWS_PER_PAGE = 2;
  const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PER_PAGE);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayName = getProductName(product, locale);
  const shortDesc = getProductShortDescription(product, locale);
  const _unusedOldShortDesc = product.shortDescription || product.description || "";
  const longDesc = getProductLongDescription(product, locale);

  useEffect(() => {
    setVisibleReviews(REVIEWS_PER_PAGE);
  }, [reviews.length]);

  useEffect(() => {
    try {
      const key = "solevault-recently-viewed";
      const ids: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [product.id, ...ids.filter(id => id !== product.id)].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [product.id]);

  const cartPayload = { id: product.id, name: product.name, price, imageUrl: product.imageUrl, size: selectedSize, color: selectedColor, quantity };

  const handleAddToCart = () => {
    addItem(cartPayload);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(cartPayload);
    router.push(`/${locale}/cart`);
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName.trim(),
          rating: Number(reviewRating) || 5,
          comment: (reviewComment || "").trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const reviewObj = data?.review || data;
        if (reviewObj && typeof reviewObj === "object" && reviewObj.id) {
          setReviews(prev => [reviewObj, ...prev]);
        }
        setReviewName("");
        setReviewRating(5);
        setReviewComment("");
        setShowReviewForm(false);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 8000);
      } else {
        console.error("[Review submit failed]", data?.error || res.status);
      }
    } catch (err) {
      console.error("[Review submit error]", err);
    }
    setSubmittingReview(false);
  };

  const buildShareMessage = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const priceLine = price ? `\n\n${isFr ? "Prix" : "Price"}: ${formatPrice(price)}` : "";
    const descLine = shortDesc ? `\n\n${shortDesc}` : "";
    return `${displayName}${descLine}${priceLine}\n\n${url}`;
  };
  const handleShare = () => {
    const shareText = buildShareMessage();
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: displayName, text: shareText, url });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    return;
    // legacy fallback (unreachable, kept to preserve original signature)
    if (navigator.share) {
      navigator.share({ title: displayName, text: shortDesc, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const stockLabel = product.stock > 10
    ? `${t("inStock")} (${product.stock})`
    : product.stock > 0
      ? t("onlyLeft", { count: product.stock })
      : t("outOfStock");

  const reviewsLabel = reviews.length === 1
    ? t("reviewCount", { count: reviews.length, name: product.name })
    : t("reviewsCount", { count: reviews.length, name: product.name });

  const tabs = [
    { id: "description" as const, label: t("tabDescription"), icon: Package },
    { id: "details" as const,     label: t("tabDetails"),     icon: Ruler   },
    { id: "shipping" as const,    label: t("tabShipping"),    icon: Truck   },
  ];

  const highlights = [
    { icon: Truck,     label: t("freeShipping"), sub: t("freeShippingDesc") },
    { icon: Shield,    label: t("securePay"),    sub: t("securePayDesc")    },
    { icon: RotateCcw, label: t("returns"),      sub: t("returnsDesc")      },
  ];

  const specs = [
    { label: t("specCategory"), value: product.category },
    { label: t("specBrand"),    value: product.brand || "NewDealZone" },
    { label: t("specSizes"),    value: sizes.join(", ") || t("specOneSize") },
    { label: t("specColors"),   value: colors.join(", ") || t("specDefault") },
    { label: t("specMaterial"), value: product.material || t("specMaterialDefault") },
    { label: t("specSku"),      value: product.sku || `SV-${product.id.slice(0, 8).toUpperCase()}` },
  ];

  const features = [
    t("feature1"), t("feature2"), t("feature3"),
    t("feature4"), t("feature5"), t("feature6"),
  ];

  return (
    <div className="pb-24 lg:pb-0 overflow-x-hidden">
      {/* HERO PRODUCT SECTION */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

          {/* Breadcrumb - pro e-commerce style */}
          <nav
            aria-label="Breadcrumb"
            className="relative -mx-4 sm:mx-0 mb-6 sm:mb-8"
          >
            <ol className="flex items-center gap-1 text-[13px] sm:text-sm text-gray-500 flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-hide px-4 sm:px-0">
              <li className="flex items-center flex-shrink-0">
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#CA3F2E] transition-colors font-medium"
                  aria-label={t("home")}
                >
                  <Home className="w-3.5 h-3.5" strokeWidth={2.25} />
                  <span className="hidden sm:inline">{t("home")}</span>
                </Link>
              </li>
              <li className="flex items-center flex-shrink-0" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" strokeWidth={2.5} />
              </li>
              <li className="flex items-center flex-shrink-0">
                <Link
                  href={`/${locale}/shop`}
                  className="text-gray-500 hover:text-[#CA3F2E] transition-colors font-medium"
                >
                  {t("shop")}
                </Link>
              </li>
              <li className="flex items-center flex-shrink-0" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" strokeWidth={2.5} />
              </li>
              <li className="flex items-center flex-shrink-0">
                <Link
                  href={`/${locale}/shop?category=${product.category}`}
                  className="text-gray-500 hover:text-[#CA3F2E] transition-colors font-medium capitalize"
                >
                  {product.category}
                </Link>
              </li>
              <li className="flex items-center flex-shrink-0" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" strokeWidth={2.5} />
              </li>
              <li className="flex items-center min-w-0">
                <span
                  className="text-gray-900 font-semibold truncate max-w-[160px] sm:max-w-[300px] lg:max-w-[420px]"
                  title={displayName}
                  aria-current="page"
                >
                  {displayName}
                </span>
              </li>
            </ol>
            {/* Fade edge on mobile to hint scrollability */}
            <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
          </nav>

          <div className="grid lg:grid-cols-[1fr_1fr_320px] gap-8 lg:gap-10">
            {/* IMAGE GALLERY */}
            <div className="space-y-4 w-full">
              <div className="relative w-full">
                <ProductGallery
                  images={(() => {
                    const arr: string[] = [];
                    if (product.imageUrl) arr.push(product.imageUrl);
                    try {
                      const parsed = JSON.parse(product.images || "[]") as string[];
                      parsed.forEach(img => { if (img && !arr.includes(img)) arr.push(img); });
                    } catch {}
                    return arr;
                  })()}
                  productName={product.name}
                />

                {/* Floating badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  {discount > 0 && (
                    <span className="pointer-events-auto px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse-glow">
                      -{discount}% OFF
                    </span>
                  )}
                  {product.featured && (
                    <span className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" /> {t("featured")}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-auto">
                  <button onClick={() => toggleWishlist(product.id)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isWished(product.id) ? "bg-red-500 text-white scale-110" : "bg-white/90 backdrop-blur text-gray-700 hover:bg-white"}`}>
                    <Heart className={`w-5 h-5 ${isWished(product.id) ? "fill-white" : ""}`} />
                  </button>
                  <button onClick={handleShare} className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-gray-700 hover:bg-white transition">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 sm:px-0">
                {highlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-white rounded-xl border border-gray-100 shadow-sm min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{item.label}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 line-clamp-1">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share buttons */}
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{isFr ? "Partager :" : "Share:"}</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage())}`}
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Share on X"
                  className="w-11 h-11 rounded-lg bg-gray-900 hover:bg-black text-white flex items-center justify-center transition shadow-md hover:shadow-lg font-bold"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" strokeWidth={2}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&quote=${encodeURIComponent(buildShareMessage())}`}
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="w-11 h-11 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center transition shadow-md hover:shadow-lg font-bold"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.6v3h2.5V21h3.4z"/></svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(buildShareMessage())}`}
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Share on WhatsApp"
                  className="w-11 h-11 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center transition shadow-md hover:shadow-lg font-bold"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <button
                  onClick={handleShare}
                  aria-label="Copy link"
                  className="w-11 h-11 rounded-lg bg-gray-900 hover:bg-black text-white flex items-center justify-center transition shadow-md hover:shadow-lg font-bold"
                >
                  <Share2 className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Social proof */}
              <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl border border-gray-100" style={{ backgroundColor: "#CA3F2E08" }}>
                <div className="flex -space-x-2 flex-shrink-0">
                  {["JW", "SC", "MT"].map((initials, i) => {
                    const colors = ["from-blue-400 to-blue-600", "from-pink-400 to-rose-600", "from-emerald-400 to-green-600"];
                    return (
                      <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[i]} border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm`}>
                        {initials}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-700 flex-1">
                  <span className="font-bold" style={{ color: "#CA3F2E" }}>{Math.floor(Math.random() * 15 + 5)} {isFr ? "personnes" : "people"}</span> {isFr ? "ont achete ceci ces dernieres 24h" : "bought this in the last 24 hours"}
                </div>
              </div>

              {/* 
              {product?.id && <SellerInfoCard productId={product.id} />}

              Complete the Look */}
              {relatedProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">{isFr ? "Completez le look" : "Complete the Look"}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {relatedProducts.slice(0, 3).map((rp) => (
                      <div key={rp.id} className="group relative">
                        <Link
                          href={`/${propLocale || locale}/product/${rp.slug || rp.id}`}
                          className="block"
                        >
                          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 relative">
                            {rp.imageUrl && (
                              <img
                                src={rp.imageUrl}
                                alt={rp.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-gray-700">{rp.name}</div>
                          <div className="text-xs font-bold mt-0.5" style={{ color: "#CA3F2E" }}>{formatPrice(parseFloat(rp.price))}</div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const rSizes: string[] = (() => { try { return JSON.parse(rp.sizes || "[]"); } catch { return []; } })();
                            const rColors: string[] = parseColorVariants(rp.colors).map(v => v.name);
                            addItem({
                              id: rp.id,
                              name: rp.name,
                              price: parseFloat(rp.price),
                              imageUrl: rp.imageUrl,
                              size: rSizes[0] || "One Size",
                              color: rColors[0] || "Default",
                              quantity: 1,
                            });
                          }}
                          aria-label={`Add ${rp.name} to cart`}
                          title={isFr ? "Ajouter au panier" : "Add to cart"}
                          className="absolute top-2 right-2 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                          style={{ backgroundColor: "#CA3F2E" }}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="lg:py-2 min-w-0">
              {/* Brand + Rating */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-widest">{product.brand || product.category}</span>
                {rating > 0 && <span className="text-gray-200">|</span>}
                {rating > 0 && (
                  <a href="#reviews" className="flex items-center gap-1 group">
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <span className="text-sm text-gray-400 group-hover:text-brand-600 transition">({product.reviewCount})</span>
                  </a>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-4 leading-tight break-words">{displayName}</h1>

              {/* Price */}
              <div className="flex flex-wrap items-end gap-x-3 gap-y-2 mb-6 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-2xl">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 break-all">{formatPrice(price)}</span>
                {comparePrice && (
                  <div className="flex flex-wrap items-center gap-2 pb-1 min-w-0">
                    <span className="text-base sm:text-lg text-gray-400 line-through break-all">{formatPrice(comparePrice)}</span>
                    <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg inline-block">
                      {t("saveAmount", { amount: formatPrice(comparePrice - price) })}
                    </span>
                  </div>
                )}
              </div>

              {/* Stock urgency badge */}
              {typeof product.stock === "number" && product.stock > 0 && product.stock <= 10 && (
                <div className="mb-4">
                  <StockBadge stock={product.stock} variant="large" />
                </div>
              )}

              {/* Short Description */}
              <p className="text-gray-500 leading-relaxed mb-8">{shortDesc}</p>

              <div className="border-t border-gray-100 mb-6" />

              {/* Size */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">{t("selectSize")}</h3>
                    <button className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> {t("sizeGuide")}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`w-full h-12 rounded-xl text-sm font-semibold border-2 transition-all ${selectedSize === s ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105" : "border-gray-200 hover:border-gray-400 hover:shadow-md"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color + Quantity row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
              {/* Color */}
              {colors.length > 0 && (
                <div className="">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                    {t("color")} - <span className="font-normal normal-case text-gray-500">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => {
                      const [hex1, hex2] = getColorHexPair(c);
                      const isActive = selectedColor === c;
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            setSelectedColor(c);
                            const variant = colorVariants.find(v => v.name === c);
                            if (variant && variant.image) {
                              window.dispatchEvent(new CustomEvent("swap-main-image", { detail: { url: variant.image } }));
                            }
                          }}
                          className={`inline-flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${isActive ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "border-gray-200 hover:border-gray-400 text-gray-800"}`}
                          title={c}
                        >
                          <span
                            className={`inline-block w-5 h-5 rounded-full border shadow-sm overflow-hidden flex-shrink-0 ${isActive ? "border-white" : "border-gray-300"}`}
                            style={hex2 ? {
                              background: `linear-gradient(135deg, ${hex1} 0%, ${hex1} 50%, ${hex2} 50%, ${hex2} 100%)`
                            } : { backgroundColor: hex1 }}
                          />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
                </div>
                <div>
              {/* Quantity */}
              <div className="">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">{t("quantity")}</h3>
                <div className="inline-flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"><Minus className="w-4 h-4" /></button>
                  <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
                </div>
              </div>


                {/* Delivery info (Abuja - only shown when currency is NGN) */}
                {currency === "NGN" && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 text-amber-700 flex-shrink-0"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    <div className="text-xs leading-relaxed text-amber-900">
                      {isFr ? (
                        <>
                          <strong>Livraison Abuja :</strong> 3 000 - 5 000 {"\u20a6"}.
                          <br />
                          <strong>Livraison le jour m&#234;me</strong> pour toute commande pass&#233;e avant <strong>11h</strong>.
                        </>
                      ) : (
                        <>
                          <strong>Abuja delivery:</strong> {"\u20a6"}3,000 - {"\u20a6"}5,000.
                          <br />
                          <strong>Same-day delivery</strong> for orders placed before <strong>11 AM</strong>.
                        </>
                      )}
                    </div>
                  </div>
                </div>
                )}

              {/* Trust Row - free shipping, secure, returns, authentic */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
                  <Truck className="w-4 h-4 flex-shrink-0" style={{ color: "#CA3F2E" }} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">{isFr ? "Livraison" : "Free Ship"}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{isFr ? `Plus de ${formatPrice(1000)}` : `Over ${formatPrice(1000)}`}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
                  <Shield className="w-4 h-4 flex-shrink-0" style={{ color: "#CA3F2E" }} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">{isFr ? "S\u00e9curis\u00e9" : "Secure"}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{isFr ? "Crypt\u00e9 SSL" : "SSL encrypted"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
                  <RotateCcw className="w-4 h-4 flex-shrink-0" style={{ color: "#CA3F2E" }} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">{isFr ? "Retours" : "Returns"}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{isFr ? "14 jours" : "14 days"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
                  <Award className="w-4 h-4 flex-shrink-0" style={{ color: "#CA3F2E" }} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">{isFr ? "Authentique" : "Authentic"}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{isFr ? "Garanti" : "Guaranteed"}</div>
                  </div>
                </div>
              </div>

              {/* Delivery estimate */}
              <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50">
                <Truck className="w-5 h-5 flex-shrink-0" style={{ color: "#CA3F2E" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900">
                    {isFr ? "Livraison gratuite - Arrive " : "Free shipping - Arrives "}<span style={{ color: "#CA3F2E" }}>{(() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 5);
                      return d.toLocaleDateString(isFr ? "fr-FR" : "en-US", { weekday: "short", month: "short", day: "numeric" });
                    })()}</span>
                  </div>
                  <div className="text-[11px] text-gray-500">{isFr ? "Commandez dans les 24h pour une livraison garantie" : "Order in the next 24h for guaranteed delivery"}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={handleBuyNow} className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl font-bold text-sm sm:text-base whitespace-nowrap hover:from-brand-700 hover:to-brand-800 transition-all shadow-xl shadow-brand-600/25 active:scale-[0.98]">
                    <Zap className="w-5 h-5" /> {t("buyNow")}
                  </button>
                  {isFr ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={added}
                      aria-label="Ajouter au panier"
                      title="Ajouter au panier"
                      className={`lg:hidden flex-shrink-0 w-12 sm:w-14 py-3.5 sm:py-4 flex items-center justify-center rounded-2xl transition-all active:scale-[0.96] ${added ? "bg-green-500 text-white shadow-xl shadow-green-500/25" : "border-2 border-gray-200 hover:border-[#CA3F2E] hover:bg-[#CA3F2E]/5 bg-white"}`}
                    >
                      {added ? <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} /> : <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" strokeWidth={2.25} />}
                    </button>
                  ) : (
                    <button onClick={handleAddToCart} disabled={added} aria-label={t("addToCart")} title={t("addToCart")} className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 sm:px-5 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base whitespace-nowrap transition-all active:scale-[0.98] ${added ? "bg-green-500 text-white shadow-xl shadow-green-500/25" : "bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/25"}`}>
                      {added ? <><Check className="w-5 h-5" /> {t("added")}</> : <><ShoppingBag className="w-5 h-5" /> {t("addToCart")}</>}
                    </button>
                  )}
                  {(visitorCountry === "TG" || visitorCountry === "NG") && (
                    <button
                      onClick={() => setCallModalOpen(true)}
                      aria-label={isFr ? "Appeler" : "Call"}
                      className="lg:hidden flex-shrink-0 w-12 sm:w-14 py-3.5 sm:py-4 flex items-center justify-center rounded-2xl border-2 border-gray-200 hover:border-[#CA3F2E] hover:bg-[#CA3F2E]/5 transition-all active:scale-[0.96] bg-white"
                    >
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" strokeWidth={2.25} />
                    </button>
                  )}
                </div>
              </div>

              {/* Stock + SKU */}
              <div className="flex items-center gap-4 mt-5 text-sm text-gray-500 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-amber-500 animate-pulse" : "bg-red-500"}`} />
                  <span className={product.stock <= 10 && product.stock > 0 ? "text-amber-600 font-semibold" : ""}>
                    {stockLabel}
                  </span>
                </div>
                {product.sku && <span className="text-gray-300">|</span>}
                {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-3.5 h-3.5" /> {Math.floor(Math.random() * 50 + 20)} {t("viewing")}
                </span>
              </div>
            </div>

            {/* RIGHT SIDEBAR - Delivery / Seller / Sales */}
            <aside className="space-y-4 lg:self-start">
              {/* Delivery & Returns card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-base">{isFr ? "Livraison & Retours" : "Delivery & Returns"}</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#CA3F2E15" }}>
                      <Truck className="w-4 h-4" style={{ color: "#CA3F2E" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900">{isFr ? "Livraison" : "Delivery"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{isFr ? "Estimee 3-5 jours ouvres" : "Estimated 3-5 business days"}</div>
                      <div className="text-xs text-gray-700 mt-2">
                        <span className="font-semibold">{isFr ? "Livraison gratuite" : "Free shipping"}</span> {isFr ? `pour les commandes de plus de ${formatPrice(1000)}.` : `on orders over ${formatPrice(1000)}.`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isFr ? "Commandez dans les 24h pour la livraison la plus rapide." : "Order in the next 24h for fastest delivery."}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#CA3F2E15" }}>
                      <RotateCcw className="w-4 h-4" style={{ color: "#CA3F2E" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900">{isFr ? "Politique de retour" : "Return Policy"}</div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: "#CA3F2E" }}>{isFr ? "Retours gratuits 14 jours" : "14-Day Free Returns"}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isFr ? "Pas satisfait ? Retournez les articles non portes sous 14 jours pour un remboursement complet." : "Not satisfied? Return unworn items within 14 days for a full refund."}
                      </div>
                      <Link href={`/${locale}/returns`} className="text-xs font-semibold text-gray-900 underline hover:text-gray-700 mt-1 inline-block">
                        {isFr ? "Lire la politique de retour" : "Read return policy"}
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#CA3F2E15" }}>
                      <Shield className="w-4 h-4" style={{ color: "#CA3F2E" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900">{isFr ? "Garantie d'authenticite" : "Authenticity Guarantee"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {isFr ? "Chaque produit est 100% authentique et inspecte avant l'envoi." : "Every product is 100% authentic and inspected before shipping."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Information card */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-base">{isFr ? "Informations vendeur" : "Seller Information"}</h3>
                  <Link href={`/${locale}/shop`} className="text-xs font-bold px-3 py-1 rounded-lg border border-gray-300 hover:border-gray-900 hover:bg-gray-50 transition" style={{ color: "#CA3F2E" }}>
                    {isFr ? "Voir la boutique" : "View Store"}
                  </Link>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                      <img src="/favicon.svg" alt="New Deal Zone" width="32" height="32" loading="lazy" decoding="async" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900">NewDealZone</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        {isFr ? "Vendeur premium verifie" : "Verified premium seller"}
                      </div>
                    </div>
                  </div>

                  {/* Number of Sales */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">{isFr ? "Nombre de ventes" : "Number of Sales"}</span>
                      <span className="text-sm font-black text-gray-900">
                        {(() => {
                          // Simulate realistic sales count based on product age + rating
                          const base = 50;
                          const boost = Math.floor((product.reviewCount || 0) * 8);
                          const total = base + boost + Math.floor(Math.random() * 30);
                          return total.toLocaleString();
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">{isFr ? "Taux d'execution" : "Fulfillment Rate"}</span>
                      <span className="text-xs font-bold text-green-600">98%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "98%" }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                    <Award className="w-3.5 h-3.5" style={{ color: "#CA3F2E" }} />
                    <span>{isFr ? "2+ annees de vente de chaussures premium" : "2+ years selling premium footwear"}</span>
                  </div>
                </div>
              </div>

              {/* Placeholder to reserve space in the aside so layout does not jump */}
              <div ref={stickyPlaceholderRef} className="hidden lg:block" style={{ height: stickyIsFixed ? stickyCardHeight : "auto" }}>
              {/* Sticky Add-to-Cart mini card - fixed positioning bounded to end of Description tabs */}
              <div ref={stickyCardRef} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md transition-opacity duration-200 ${stickyIsFixed ? "lg:fixed lg:top-32" : ""}`} style={{ opacity: stickyVisible ? 1 : 0, pointerEvents: stickyVisible ? "auto" : "none", width: stickyIsFixed ? stickyCardWidth : "auto", zIndex: stickyIsFixed ? 30 : "auto" }}>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.imageUrl && <img src={product.imageUrl} alt="" width="56" height="56" className="w-full h-full object-cover" loading="lazy" decoding="async" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{displayName}</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-black" style={{ color: "#CA3F2E" }}>{formatPrice(price)}</span>
                        {comparePrice && comparePrice > price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={added}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${added ? "bg-green-500 text-white border-green-500" : "bg-white border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"}`}
                    >
                      {added ? <><Check className="w-4 h-4 inline" /> {isFr ? "Ajoute" : "Added"}</> : (isFr ? "Ajouter au panier" : "Add to Cart")}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-2.5 text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
                      style={{ backgroundColor: "#CA3F2E", boxShadow: "0 4px 14px rgba(202, 63, 46, 0.35)" }}
                    >
                      {isFr ? "Acheter maintenant" : "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* CALL CONFIRMATION MODAL */}
      {callModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setCallModalOpen(false)}
        >
          <div
            className="w-full sm:w-auto sm:min-w-[380px] sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-6 pt-8 pb-2 text-center">
              <button
                onClick={() => setCallModalOpen(false)}
                aria-label={isFr ? "Fermer" : "Close"}
                className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(202, 63, 46, 0.1)" }}
              >
                <Phone className="w-8 h-8" style={{ color: "#CA3F2E" }} strokeWidth={2.25} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {isFr ? "Appeler maintenant ?" : "Call now?"}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                {visitorCountry === "TG"
                  ? (isFr ? "Vous serez connect\u00e9 \u00e0 notre \u00e9quipe au Togo" : "You will be connected to our team in Togo")
                  : (isFr ? "Appel WhatsApp vers notre \u00e9quipe au Nigeria" : "WhatsApp call to our team in Nigeria")}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-2 tracking-wide">
                {visitorCountry === "TG" ? "71 65 53 13" : "+234 813 304 9669"}
              </p>
            </div>
            <div className="p-6 pt-4 flex gap-3">
              <button
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition active:scale-95"
              >
                {isFr ? "Annuler" : "Cancel"}
              </button>
              <a
                href={visitorCountry === "TG" ? "tel:71655313" : "https://wa.me/2348133049669"}
                target={visitorCountry === "TG" ? undefined : "_blank"}
                rel={visitorCountry === "TG" ? undefined : "noopener noreferrer"}
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition active:scale-95"
                style={{ backgroundColor: "#CA3F2E", boxShadow: "0 4px 14px rgba(202, 63, 46, 0.35)" }}
              >
                <Phone className="w-4 h-4" strokeWidth={2.5} />
                {isFr ? "Appeler" : "Call"}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* STICKY MOBILE BOTTOM BAR */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl lg:hidden">
        <div className="px-3 py-2.5 flex items-center gap-2">
          <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gray-100 overflow-hidden">
            {product.imageUrl && <img src={product.imageUrl} alt="" width="56" height="56" className="w-full h-full object-cover" loading="lazy" decoding="async" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-gray-900 truncate leading-tight">{displayName}</div>
            <div className="flex items-baseline gap-1.5 mt-0.5 min-w-0">
              <span className="text-sm font-black truncate" style={{ color: "#CA3F2E" }}>{formatPrice(price)}</span>
              {comparePrice && comparePrice > price && (
                <span className="text-[10px] text-gray-400 line-through truncate hidden xs:inline">{formatPrice(comparePrice)}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`px-3.5 py-2.5 rounded-xl text-white font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 ${added ? "bg-green-500" : ""}`}
            style={!added ? { backgroundColor: "#CA3F2E", boxShadow: "0 4px 14px rgba(202, 63, 46, 0.35)" } : undefined}
          >
            {added ? <><Check className="w-3.5 h-3.5" /> {isFr ? "Ajout\u00e9" : "Added"}</> : <><ShoppingBag className="w-3.5 h-3.5" /> {isFr ? "Ajouter au panier" : "Add to Cart"}</>}
          </button>
        </div>
      </div>
        {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 lg:px-8 py-5 text-sm font-semibold transition whitespace-nowrap relative ${activeTab === tab.id ? "text-gray-900 bg-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 lg:p-10">
            {activeTab === "description" && (
              <div className="max-w-3xl space-y-6">
                {/* Collapsible long description - SEO safe (full text in DOM) */}
                <div className="relative">
                  <div
                      className={`product-long-desc overflow-hidden transition-all duration-500 ${
                        showFullDesc || longDesc.length <= 400 ? "max-h-[10000px]" : "max-h-[220px]"
                      }`}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(longDesc) }}
                    />
                  {/* Fade gradient - only when collapsed and long */}
                  {!showFullDesc && longDesc.length > 400 && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                  )}
                </div>
                {/* Read more / less button - only if content is long enough */}
                {longDesc.length > 400 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-900 hover:text-white transition group"
                  >
                    {showFullDesc ? (locale === "fr" ? "Voir moins" : "Show less") : (locale === "fr" ? "Lire la suite" : "Read more")}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFullDesc ? "rotate-180" : ""}`} />
                  </button>
                )}
                {product.brand && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Award className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{product.brand}</p>
                      <p className="text-xs text-gray-500">{t("trustedBrand")}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-5">{t("specifications")}</h3>
                  <table className="product-spec-table">
                    <tbody>
                      {specs.map((item) => (
                        <tr key={item.label}>
                          <td>{item.label}</td>
                          <td className="capitalize">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-5">{t("keyFeatures")}</h3>
                  <ul className="space-y-3">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Truck className="w-5 h-5 text-green-600" /> {t("shippingTitle")}</h3>
                  <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl mb-5 border border-green-100">
                    <p className="font-bold text-green-800">{t("freeStandardShipping")}</p>
                    <p className="text-sm text-green-600">{t("freeStandardShippingDesc")}</p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t("standardShipping")}</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t("expressShipping")}</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t("nextDayShipping")}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><RotateCcw className="w-5 h-5 text-blue-600" /> {t("returnsTitle")}</h3>
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-5 border border-blue-100">
                    <p className="font-bold text-blue-800">{t("returnPolicy")}</p>
                    <p className="text-sm text-blue-600">{t("returnPolicyDesc")}</p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t("returnRule1")}</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t("returnRule2")}</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{t("returnRule3")}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boundary marker: sticky mini cart hides after this point */}
      <div ref={tabsEndRef} aria-hidden="true" />

      {/* REVIEWS + FAQ SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          <section id="reviews" className="scroll-mt-28 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">{t("customerReviews")}</h2>
              <p className="text-gray-500 mt-1">{reviewsLabel}</p>
            </div>
            <button onClick={() => { const next = !showReviewForm; setShowReviewForm(next); setReviewSuccess(false); if (next) setTimeout(() => {
                  if (reviewFormRef.current) {
                    const y = reviewFormRef.current.getBoundingClientRect().top + window.scrollY - 120;
                    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                  }
                }, 100); }} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition self-start shadow-lg shadow-gray-900/10">
              <MessageSquare className="w-4 h-4" />
              {t("writeReview")}
            </button>
          </div>

          {/* Review Success Banner */}
          {reviewSuccess && (
            <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl animate-fade-in-up flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 text-lg">{isFr ? "Merci ! Votre avis a été soumis et est en attente de modération." : "Thank you! Your review has been submitted and is awaiting admin moderation."}</h4>
                <p className="text-green-700 text-sm mt-1">{isFr ? "Votre avis a ete soumis avec succes." : "Your review has been submitted successfully."}</p>
              </div>
              <button onClick={() => setReviewSuccess(false)} className="text-green-500 hover:text-green-700 transition flex-shrink-0 mt-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Review Form - immediately under Write a Review button */}
          {showReviewForm && (
            <div ref={reviewFormRef} className="mb-10 p-8 bg-white rounded-3xl border-2 border-gray-900 shadow-xl animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-xl">{isFr ? "Partagez votre experience" : "Share Your Experience"}</h4>
                <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                  {isFr ? "Annuler" : "Cancel"}
                </button>
              </div>
              {reviewError && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
                  {reviewError}
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{isFr ? "Votre nom *" : "Your Name *"}</label>
                  <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder={isFr ? "ex: Jean Dupont" : "e.g., Alex Smith"} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{isFr ? "Note" : "Rating"}</label>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button" onClick={() => setReviewRating(i)} className="group">
                        <Star className={`w-9 h-9 transition-all group-hover:scale-110 ${i <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-200 hover:text-amber-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">{isFr ? "Votre commentaire" : "Your Review"}</label>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder={isFr ? "Que pensez-vous de ce produit ?" : "What did you think of this product?"} rows={4} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition text-sm resize-none" />
                </div>
                <button type="button" onClick={handleSubmitReview} disabled={!reviewName.trim() || submittingReview} className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 shadow-lg shadow-gray-900/10">
                  <Send className="w-4 h-4" />{submittingReview ? (isFr ? "Envoi..." : "Submitting...") : (isFr ? "Soumettre mon avis" : "Submit Review")}
                </button>
              </div>
            </div>
          )}

          {/* Rating Summary */}
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-100 p-8 mb-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="text-center flex-shrink-0 md:pr-10 md:border-r border-gray-200">
                <div className="text-6xl font-black text-gray-900 leading-none">{rating || "0.0"}</div>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`w-6 h-6 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />)}
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">{reviews.length} {t("reviews")}</p>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-14 justify-end flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-700">{star}</span>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm text-gray-400 w-8 text-right font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-5 mb-16">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl">
                <MessageSquare className="w-14 h-14 mx-auto mb-4 text-gray-200" />
                <p className="font-bold text-lg text-gray-800">{t("noReviews")}</p>
                <p className="text-gray-500 mt-1 mb-6">{t("noReviewsDesc")}</p>
                <button onClick={() => setShowReviewForm(true)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  {t("writeReview")}
                </button>
              </div>
            ) : (
              reviews.slice(0, visibleReviews).map((review, idx) => (
                <div key={review.id} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(review.customerName)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-sm font-bold text-white">{review.avatar || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <span className="font-bold text-gray-900">{review.customerName}</span>
                        <div className="flex items-center gap-2">
                          {review.verified && (
                            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                              <Check className="w-3 h-3" /> {t("verifiedPurchase")}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />)}
                      </div>
                      {(() => { const displayComment = (locale === "fr" && review.commentFr) ? review.commentFr : review.comment; return displayComment ? <p className="text-gray-600 leading-relaxed">{displayComment}</p> : null; })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination controls */}
          {reviews.length > REVIEWS_PER_PAGE && (
            <div className="flex flex-col items-center gap-3 mb-16 -mt-8">
              <p className="text-sm text-gray-500">
                {t("showingReviews", { visible: Math.min(visibleReviews, reviews.length), total: reviews.length })}
              </p>
              {visibleReviews < reviews.length ? (
                <button
                  onClick={() => setVisibleReviews((v) => Math.min(v + REVIEWS_PER_PAGE, reviews.length))}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-900 hover:text-white transition"
                >
                  {t("loadMoreReviews")}
                </button>
              ) : (
                <button
                  onClick={() => setVisibleReviews(REVIEWS_PER_PAGE)}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm text-gray-500 hover:text-gray-900 transition"
                >
                  {t("showLess")}
                </button>
              )}
            </div>
          )}
        </section>

          {/* FAQ Sidebar */}
          <aside className="min-w-0">
            <ProductFaqDisplay />
          </aside>
        </div>
      </div>
    </div>
  );
}
