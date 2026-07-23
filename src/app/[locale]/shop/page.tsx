import { db } from "@/db";
import { products, categories as categoriesTable, type Product } from "@/db/schema";
import { eq, desc, asc, and, ilike, gte, lte, gt, isNotNull, or, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Package, ChevronRight, Home } from "lucide-react";
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

    // Get selected image product IDs
    const selectedIds = cats.map(c => c.imageProductId).filter((x): x is string => Boolean(x));

    // Fetch selected products' images
    const selectedProducts = selectedIds.length > 0
      ? await db.select({ id: products.id, imageUrl: products.imageUrl })
          .from(products)
          .where(inArray(products.id, selectedIds))
      : [];
    const selectedImageMap = new Map(selectedProducts.map(p => [p.id, p.imageUrl]));

    // Fetch fallback: first product per category (used if no specific product selected)
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

      <div className="pt-24 lg:pt-28 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-gray-900 transition">
              <Home className="w-3.5 h-3.5" />
              {tNav("home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/shop`} className="hover:text-gray-900 transition">
              {tNav("shopAll")}
            </Link>
            {category !== "all" && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 font-medium">{currentCategoryName}</span>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                {pageTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
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
