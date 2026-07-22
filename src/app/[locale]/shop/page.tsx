import { db } from "@/db";
import { products, categories as categoriesTable, type Product } from "@/db/schema";
import { eq, desc, asc, and, ilike, gte, lte, gt, isNotNull, or } from "drizzle-orm";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Package } from "lucide-react";
import ShopSidebar from "@/components/ShopSidebar";
import ShopTopBar from "@/components/ShopTopBar";
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

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations("shop");
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
  let categoryOptions: { name: string; slug: string }[] = [{ name: t("catAll"), slug: "all" }];

  try {
    // Fetch active categories with translations
    const cats = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.active, true))
      .orderBy(asc(categoriesTable.sortOrder));

    categoryOptions = [
      { name: t("catAll"), slug: "all" },
      ...cats.map(c => ({
        name: isFr && c.nameFr ? c.nameFr : c.nameEn,
        slug: c.slug,
      })),
    ];

    // Product query
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

    // Brands - only from products visible in current locale
    const brandCond = isFr
      ? and(eq(products.active, true), isNotNull(products.nameFr))
      : eq(products.active, true);
    const allProducts = await db.select({ brand: products.brand })
      .from(products).where(brandCond);
    allBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
  } catch {
    // Tables might not exist yet
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 lg:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categoryOptions.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/shop?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  category === cat.slug
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
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

              {productList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {productList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t("noProducts")}</h3>
                  <p className="text-gray-500 mb-6">{t("noProductsDesc")}</p>
                  <Link href={`/${locale}/shop`} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                    {t("clearAllFilters")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
