import { db } from "@/db";
import { products, reviews, type Product, type Review } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Try slug first, then ID
    let result = await db.select().from(products).where(eq(products.slug, slug));
    if (result.length === 0) {
      result = await db.select().from(products).where(eq(products.id, slug));
    }
    if (result.length === 0) return { title: "Product Not Found — SoleVault" };

    const product = result[0];
    const price = parseFloat(product.price);

    return {
      title: `${product.name} — SoleVault`,
      description: product.description.slice(0, 160) || `Shop ${product.name} at SoleVault. ${product.brand} ${product.category}. Starting at $${price.toFixed(2)}.`,
      keywords: [product.name, product.brand, product.category, "shoes", "footwear", "SoleVault"].filter(Boolean).join(", "),
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 200),
        images: product.imageUrl ? [{ url: product.imageUrl, width: 800, height: 800, alt: product.name }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description.slice(0, 200),
        images: product.imageUrl ? [product.imageUrl] : [],
      },
    };
  } catch {
    return { title: "Product — SoleVault" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  let product: Product;
  let relatedProducts: Product[] = [];
  let productReviews: Review[] = [];

  try {
    // Find by slug first, fallback to ID
    let result = await db.select().from(products).where(eq(products.slug, slug));
    if (result.length === 0) {
      try {
        result = await db.select().from(products).where(eq(products.id, slug));
      } catch {
        // invalid UUID format for ID lookup — ignore
      }
    }
    if (result.length === 0) notFound();
    product = result[0];

    // Fetch reviews
    productReviews = await db.select().from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt));

    // Fetch related products from same category
    relatedProducts = await db.select().from(products)
      .where(and(eq(products.active, true), eq(products.category, product.category), ne(products.id, product.id)))
      .orderBy(desc(products.rating)).limit(8);

    // Fill with other products if needed
    if (relatedProducts.length < 4) {
      const moreProducts = await db.select().from(products)
        .where(and(eq(products.active, true), ne(products.id, product.id), ne(products.category, product.category)))
        .orderBy(desc(products.rating)).limit(8 - relatedProducts.length);
      relatedProducts = [...relatedProducts, ...moreProducts];
    }
  } catch {
    notFound();
  }

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: { "@type": "Brand", name: product.brand || "SoleVault" },
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: parseFloat(product.rating ?? "0") > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
    } : undefined,
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-20 lg:pt-24">
        <ProductDetails product={product} initialReviews={productReviews} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-14 lg:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">You May Also Like</h2>
                  <p className="text-gray-500 text-sm mt-1">Related products you might enjoy</p>
                </div>
                <Link
                  href={`/shop?category=${product.category}`}
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all"
                >
                  View More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>
      <Footer />
    </main>
  );
}
