import { db } from "@/db";
import { products, categories as categoriesTable, type Product } from "@/db/schema";
import { eq, desc, asc, and, ilike, gte, lte, gt, isNotNull, or, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Package, ChevronRight, Home, Sparkles } from "lucide-react";
import ShopSidebar from "@/components/ShopSidebar";
import ShopTopBar from "@/components/ShopTopBar";
import ActiveFilterChips from "@/components/ActiveFilterChips";
import CategoryShowcase from "@/components/CategoryShowcase";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full collection of premium sneakers, running shoes, boots, formal shoes, sandals and casual shoes. Free shipping on orders over $100.",
  openGraph: {
    title: "Shop All Products - SoleVault",
    description: "Browse our full collection of premium footwear. 50+ styles available.",
  },
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    rating?: string;
    onSale?: string;
  }>;
}

interface CategoryOption {
  name: string;
  slug: string;
  imageUrl?: string;
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("shop");
  const tNav = await getTranslations("nav");
  const isFr = locale === "fr";

  const sp = await searchParams;
  const category = sp.category || "all";
  const search = sp.search || "";
  const sort = sp.sort || "newest";
  const minPrice = sp.minPrice || "";
  const maxPrice = sp.maxPrice || "";
  const brand = sp.brand || "";
  const ratingFilter = sp.rating || "";
  const onSale = sp.onSale || "";

  let productList: Product[] = [];
  let allBrands: string[] = [];
  let categoryOptions: CategoryOption[] = [{ name: t("catAll"), slug: "all" }];

  try {
    const cats = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.active, true))
      .orderBy(asc(categoriesTable.sortOrder));

    const selectedIds = cats.map(c => c.imageProductId).filter((x): x is string => Boolean(x));

    const selectedProducts = selectedIds.length > 0
      ? await db.select({ id: products.id, imageUrl: products.imageUrl })
          .from(products)
          .where(inArray(products.id, selectedIds))
      : [];
    const selectedImageMap = new Map(selectedProducts.map(p => [p.id, p.imageUrl]));

    const fallbackImageMap = new Map<string, string>();
    for (const cat of cats) {
      if (!cat.imageProductId) {
        const firstProduct = await db.select({ imageUrl: products.imageUrl })
          .from(products)
          .where(and(eq(products.category, cat.slug), eq(products.active, true)))
          .orderBy(desc(products.createdAt))
          .limit(1);
        if (firstProduct.length > 0) {
          fallbackImageMap.set(cat.slug, firstProduct[0].imageUrl);
        }
      }
    }

    categoryOptions = [
      { name: t("catAll"), slug: "all" },
      ...cats.map(c => ({
        name: isFr && c.nameFr ? c.nameFr : c.nameEn,
        slug: c.slug,
        imageUrl: c.imageProductId
          ? selectedImageMap.get(c.imageProductId) || fallbackImageMap.get(c.slug)
          : fallbackImageMap.get(c.slug),
      })),
    ];

    const conditions = [eq(products.active, true)];
    if (isFr) conditions.push(isNotNull(products.nameFr));
    if (category && category !== "all") conditions.push(eq(products.category, category));
    if (search) {
      if (isFr) {
        conditions.push(
          or(
            ilike(products.nameFr, `%${search}%`),
            ilike(products.descriptionFr, `%${search}%`)
          )!
        );
      } else {
        conditions.push(ilike(products.name, `%${search}%`));
      }
    }
    if (minPrice) conditions.push(gte(products.price, minPrice));
    if (maxPrice) conditions.push(lte(products.price, maxPrice));
    if (brand) conditions.push(eq(products.brand, brand));
    if (ratingFilter) conditions.push(gt(products.rating, ratingFilter));
    if (onSale === "true") conditions.push(gt(products.comparePrice, "0"));

    let orderBy;
    switch (sort) {
      case "price-low":  orderBy = asc(products.price);       break;
      case "price-high": orderBy = desc(products.price);      break;
      case "rating":     orderBy = desc(products.rating);     break;
      case "name-az":    orderBy = isFr ? asc(products.nameFr) : asc(products.name); break;
      case "name-za":    orderBy = isFr ? desc(products.nameFr) : desc(products.name); break;
      default:           orderBy = desc(products.createdAt);
    }

    productList = await db.select().from(products)
      .where(and(...conditions)).orderBy(orderBy);

    const brandCond = isFr
      ? and(eq(products.active, true), isNotNull(products.nameFr))
      : eq(products.active, true);
    const allProducts = await db.select({ brand: products.brand })
      .from(products).where(brandCond);
    allBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
  } catch {
    // Tables might not exist yet
  }

  const currentCategoryName = categoryOptions.find(c => c.slug === category)?.name || t("catAll");
  const pageTitle = category !== "all" ? currentCategoryName : t("catAll");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 lg:pt-28 relative overflow-hidden bg-[#0a0a0a]">
        {/* Layer 1: Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-neutral-800" />

        {/* Layer 2: Soft radial glows (ash / white light) */}
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(148,163,184,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.10) 0%, transparent 50%), radial-gradient(circle at 60% 10%, rgba(120,120,120,0.15) 0%, transparent 40%)",
          }}
        />

        {/* Layer 3: Fine grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />

        {/* Layer 4: Noise / grain texture */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Layer 5: Floating orbs */}
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] rounded-full bg-neutral-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-slate-400/10 blur-3xl pointer-events-none" />

        {/* Layer 6: Top & bottom fade lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition">
              <Home className="w-3.5 h-3.5" />
              {tNav("home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/shop`} className="hover:text-white transition">
              {tNav("shopAll")}
            </Link>
            {category !== "all" && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white font-medium">{currentCategoryName}</span>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-semibold uppercase tracking-widest text-white/80 mb-4">
                <Sparkles className="w-3 h-3" />
                Premium Collection
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
                {pageTitle}
              </h1>
              <div className="h-1 w-16 bg-gradient-to-r from-white to-transparent rounded-full mt-3" />
              <p className="text-sm text-gray-400 mt-3 leading-relaxed max-w-xs">
                {t("headerTagline")}
              </p>
            </div>

            <div className="lg:col-span-8 relative">
              <CategoryShowcase
                categories={categoryOptions}
                activeCategory={category}
              />
            </div>
          </div>
        </div>

        {/* Bottom smooth transition to white content area */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {categoryOptions.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/shop?category=${cat.slug}`}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  category === cat.slug
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat.name}
                {category === cat.slug && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gray-900 rounded-t-full" />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <ShopSidebar
            category={category}
            search={search}
            sort={sort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            brand={brand}
            rating={ratingFilter}
            onSale={onSale}
            brands={allBrands}
          />

          <div className="flex-1 min-w-0">
            <ShopTopBar
              category={category}
              search={search}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              brand={brand}
              rating={ratingFilter}
              onSale={onSale}
              brands={allBrands}
              totalResults={productList.length}
            />

            <ActiveFilterChips
              category={category}
              search={search}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              brand={brand}
              rating={ratingFilter}
              onSale={onSale}
            />

            {productList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {productList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t("noProducts")}</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">{t("noProductsDesc")}</p>
                <Link href={`/${locale}/shop`} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                  {t("clearAllFilters")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
