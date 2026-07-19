import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { eq, desc, asc, and, ilike, gte, lte, gt } from "drizzle-orm";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Package } from "lucide-react";
import ShopSidebar from "@/components/ShopSidebar";
import ShopTopBar from "@/components/ShopTopBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Shoes",
  description: "Browse our full collection of premium sneakers, running shoes, boots, formal shoes, sandals and casual shoes. Free shipping on orders over $100.",
  openGraph: {
    title: "Shop All Shoes — SoleVault",
    description: "Browse our full collection of premium footwear. 50+ styles available.",
  },
};

const categories = [
  { name: "All", slug: "all" },
  { name: "Sneakers", slug: "sneakers" },
  { name: "Running", slug: "running" },
  { name: "Formal", slug: "formal" },
  { name: "Boots", slug: "boots" },
  { name: "Sandals", slug: "sandals" },
  { name: "Casual", slug: "casual" },
];

interface Props {
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

export default async function ShopPage({ searchParams }: Props) {
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

  try {
    const conditions = [eq(products.active, true)];
    if (category && category !== "all") conditions.push(eq(products.category, category));
    if (search) conditions.push(ilike(products.name, `%${search}%`));
    if (minPrice) conditions.push(gte(products.price, minPrice));
    if (maxPrice) conditions.push(lte(products.price, maxPrice));
    if (brand) conditions.push(eq(products.brand, brand));
    if (ratingFilter) conditions.push(gt(products.rating, ratingFilter));
    if (onSale === "true") {
      conditions.push(gt(products.comparePrice, "0"));
    }

    let orderBy;
    switch (sort) {
      case "price-low": orderBy = asc(products.price); break;
      case "price-high": orderBy = desc(products.price); break;
      case "rating": orderBy = desc(products.rating); break;
      case "name-az": orderBy = asc(products.name); break;
      case "name-za": orderBy = desc(products.name); break;
      default: orderBy = desc(products.createdAt);
    }

    productList = await db.select().from(products)
      .where(and(...conditions)).orderBy(orderBy);

    const allProducts = await db.select({ brand: products.brand })
      .from(products).where(eq(products.active, true));
    allBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
  } catch {
    // Tables might not exist yet
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-28 lg:pt-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            <h1 className="text-3xl lg:text-4xl font-bold mb-1">
              {category !== "all" ? categories.find(c => c.slug === category)?.name || "Shop" : "All Shoes"}
            </h1>
            <p className="text-gray-500 text-sm">
              {productList.length} product{productList.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
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

          {/* Layout: Sidebar + Grid */}
          <div className="flex gap-6">
            {/* Sidebar */}
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

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Top sort bar (mobile filter toggle + sort) */}
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

              {/* Product Grid */}
              {productList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {productList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                  <Link href="/shop" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition">
                    Clear All Filters
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
