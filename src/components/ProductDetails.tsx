"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product, Review } from "@/db/schema";
import {
  ShoppingBag, Heart, Minus, Plus, Check, Star, Truck, Shield, RotateCcw,
  Zap, Package, Ruler, Scale, MessageSquare, Send, Share2, Award, Sparkles, Eye
} from "lucide-react";
import Link from "next/link";

interface ProductDetailsProps {
  product: Product;
  initialReviews?: Review[];
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

export default function ProductDetails({ product, initialReviews = [] }: ProductDetailsProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const sizes: string[] = JSON.parse(product.sizes || "[]");
  const colors: string[] = JSON.parse(product.colors || "[]");
  const rating = parseFloat(product.rating ?? "0");

  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Derive descriptions
  const shortDesc = product.shortDescription || product.description || "";
  const longDesc = product.longDescription || product.description || "";

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
    router.push("/cart");
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, customerName: reviewName, rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        setReviewName(""); setReviewRating(5); setReviewComment(""); setShowReviewForm(false);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 6000);
      }
    } catch { /* ignore */ }
    setSubmittingReview(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <div>
      {/* ===== HERO PRODUCT SECTION ===== */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <Link href="/" className="hover:text-gray-900 transition">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/shop" className="hover:text-gray-900 transition">Shop</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-gray-900 transition capitalize">{product.category}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* ===== IMAGE ===== */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="eager"
                      decoding="async"
                      className={`w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        setImageLoaded(true);
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.querySelector(".img-fallback")?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`img-fallback absolute inset-0 flex items-center justify-center text-gray-300 ${product.imageUrl && imageLoaded ? "hidden" : ""}`}>
                    <span className="text-9xl">👟</span>
                  </div>
                </div>
                {!imageLoaded && product.imageUrl && (
                  <div className="absolute inset-0 rounded-3xl bg-gray-100 animate-pulse" />
                )}

                {/* Floating badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse-glow">
                      -{discount}% OFF
                    </span>
                  )}
                  {product.featured && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" /> Featured
                    </span>
                  )}
                </div>

                {/* Action buttons on image */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button onClick={() => setWishlist(!wishlist)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${wishlist ? "bg-red-500 text-white scale-110" : "bg-white/90 backdrop-blur text-gray-700 hover:bg-white"}`}>
                    <Heart className={`w-5 h-5 ${wishlist ? "fill-white" : ""}`} />
                  </button>
                  <button onClick={handleShare} className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-gray-700 hover:bg-white transition">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick highlights under image */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "Orders $100+" },
                  { icon: Shield, label: "Secure Pay", sub: "100% Safe" },
                  { icon: RotateCcw, label: "30-Day", sub: "Free Returns" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-tight">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== DETAILS ===== */}
            <div className="lg:py-2">
              {/* Brand */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-widest">{product.brand || product.category}</span>
                {rating > 0 && (
                  <span className="text-gray-200">|</span>
                )}
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
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 leading-tight">{product.name}</h1>

              {/* Price block */}
              <div className="flex items-end gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-2xl -ml-4 pl-4">
                <span className="text-4xl font-black text-gray-900">${price.toFixed(2)}</span>
                {comparePrice && (
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-lg text-gray-400 line-through">${comparePrice.toFixed(2)}</span>
                    <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      SAVE ${(comparePrice - price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-500 leading-relaxed mb-8">{shortDesc}</p>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-6" />

              {/* Size */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">Select Size</h3>
                    <button className="text-xs text-brand-600 hover:underline flex items-center gap-1"><Ruler className="w-3 h-3" /> Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`w-14 h-12 rounded-xl text-sm font-semibold border-2 transition-all ${selectedSize === s ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105" : "border-gray-200 hover:border-gray-400 hover:shadow-md"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                    Color — <span className="font-normal normal-case text-gray-500">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${selectedColor === c ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "border-gray-200 hover:border-gray-400"}`}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Quantity</h3>
                <div className="inline-flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"><Minus className="w-4 h-4" /></button>
                  <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl font-bold text-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-xl shadow-brand-600/25 active:scale-[0.98]">
                    <Zap className="w-5 h-5" /> Buy Now
                  </button>
                  <button onClick={handleAddToCart} disabled={added} className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${added ? "bg-green-500 text-white shadow-xl shadow-green-500/25" : "bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/25"}`}>
                    {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
                  </button>
                </div>
              </div>

              {/* Stock + SKU */}
              <div className="flex items-center gap-4 mt-5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-amber-500 animate-pulse" : "bg-red-500"}`} />
                  <span className={product.stock <= 10 && product.stock > 0 ? "text-amber-600 font-semibold" : ""}>
                    {product.stock > 10 ? `In Stock (${product.stock})` : product.stock > 0 ? `⚡ Only ${product.stock} left!` : "Out of stock"}
                  </span>
                </div>
                {product.sku && <span className="text-gray-300">|</span>}
                {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-gray-400"><Eye className="w-3.5 h-3.5" /> {Math.floor(Math.random() * 50 + 20)} viewing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS: Description / Details / Shipping ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {[
                { id: "description" as const, label: "Description", icon: Package },
                { id: "details" as const, label: "Product Details", icon: Ruler },
                { id: "shipping" as const, label: "Shipping & Returns", icon: Truck },
              ].map((tab) => (
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
                {longDesc !== shortDesc && shortDesc && (
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-200">
                    <p className="text-gray-800 font-medium">{shortDesc}</p>
                  </div>
                )}
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{longDesc}</p>
                {product.brand && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Award className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{product.brand}</p>
                      <p className="text-xs text-gray-500">Trusted brand by SoleVault</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-5">Specifications</h3>
                  <div className="divide-y divide-gray-100">
                    {[
                      { label: "Category", value: product.category },
                      { label: "Brand", value: product.brand || "SoleVault" },
                      { label: "Available Sizes", value: sizes.join(", ") || "One Size" },
                      { label: "Available Colors", value: colors.join(", ") || "Default" },
                      { label: "Material", value: product.material || "Premium Quality" },
                      { label: "SKU", value: product.sku || `SV-${product.id.slice(0, 8).toUpperCase()}` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-5">Key Features</h3>
                  <ul className="space-y-3">
                    {["Premium quality construction","Comfortable cushioned insole","Durable outsole for long-lasting wear","Breathable materials for all-day comfort","Modern design aesthetic","Easy to clean and maintain"].map((f, i) => (
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
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Truck className="w-5 h-5 text-green-600" /> Shipping</h3>
                  <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl mb-5 border border-green-100">
                    <p className="font-bold text-green-800">🚚 Free Standard Shipping</p>
                    <p className="text-sm text-green-600">On all orders over $100</p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Standard Shipping: 5-7 business days</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Express Shipping: 2-3 business days (+$15)</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Next Day Delivery available (+$25)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><RotateCcw className="w-5 h-5 text-blue-600" /> Returns & Exchanges</h3>
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-5 border border-blue-100">
                    <p className="font-bold text-blue-800">🔄 30-Day Return Policy</p>
                    <p className="text-sm text-blue-600">Free returns on all orders</p>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Return within 30 days of delivery</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Items must be unworn with tags attached</li>
                    <li className="flex items-start gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Free exchanges for different sizes</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== REVIEWS SECTION ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="reviews" className="mt-16 scroll-mt-28">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Customer Reviews</h2>
              <p className="text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""} for {product.name}</p>
            </div>
            <button onClick={() => { setShowReviewForm(!showReviewForm); setReviewSuccess(false); }} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition self-start shadow-lg shadow-gray-900/10">
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </button>
          </div>

          {/* Review Success Message */}
          {reviewSuccess && (
            <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl animate-fade-in-up flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-900 text-lg">Thank you for your review! 🎉</h4>
                <p className="text-green-700 text-sm mt-1">Your review has been submitted successfully and is now visible on this page. We appreciate your feedback — it helps other customers make informed decisions.</p>
              </div>
              <button onClick={() => setReviewSuccess(false)} className="text-green-400 hover:text-green-600 transition flex-shrink-0 mt-1">✕</button>
            </div>
          )}

          {/* Rating Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-100 p-8 mb-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="text-center flex-shrink-0 md:pr-10 md:border-r border-gray-200">
                <div className="text-6xl font-black text-gray-900 leading-none">{rating || "0.0"}</div>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`w-6 h-6 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />)}
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">{reviews.length} reviews</p>
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

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-10 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm animate-fade-in-up">
              <h4 className="font-bold text-xl mb-6">Share Your Experience</h4>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Your Name</label>
                  <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="e.g., John Doe" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Your Rating</label>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} onClick={() => setReviewRating(i)} className="group">
                        <Star className={`w-9 h-9 transition-all group-hover:scale-110 ${i <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-200 hover:text-amber-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Your Review</label>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="What did you like or dislike about this product? How does it fit? Is it comfortable?" rows={5} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition text-sm resize-none" />
                </div>
                <button onClick={handleSubmitReview} disabled={!reviewName.trim() || submittingReview} className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50">
                  <Send className="w-4 h-4" />{submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-5 mb-16">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl">
                <MessageSquare className="w-14 h-14 mx-auto mb-4 text-gray-200" />
                <p className="font-bold text-lg text-gray-800">No reviews yet</p>
                <p className="text-gray-500 mt-1 mb-6">Be the first to share your experience!</p>
                <button onClick={() => setShowReviewForm(true)} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  Write a Review
                </button>
              </div>
            ) : (
              reviews.map((review, idx) => (
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
                              <Check className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />)}
                      </div>
                      {review.comment && <p className="text-gray-600 leading-relaxed">{review.comment}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
