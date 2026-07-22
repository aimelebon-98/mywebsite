import { db } from "@/db";
import { products, reviews, type Product, type Review } from "@/db/schema";
import { eq, and, ne, desc, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

// Merge French translations into the product object for display
function localizeProduct(p: Product, isFr: boolean): Product {
  if (!isFr) return p;
  return {
    ...p,
    name: p.nameFr || p.name,
    description: p.descriptionFr || p.description,
    shortDescription: p.shortDescriptionFr || p.shortDescription,
    longDescription: p.longDescriptionFr || p.longDescription,
    tags: p.tagsFr || p.tags,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const isFr = locale === "fr";
  try {
    let result = await db.select().from(products).where(eq(products.slug, slug));
    if (result.length === 0) result = await db.select().from(products).where(eq(products.id, slug));
    if (result.length === 0) return { title: "Product Not Found - SoleVault" };

    const product = localizeProduct(result[0], isFr);
    const price = parseFloat(product.price);

    return {
      title: `${product.name} - SoleVault`,
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
    return { title: "Product - SoleVault" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("product");
  const locale = await getLocale();
  const isFr = locale === "fr";

  let product: Product;
  let relatedProducts: Product[] = [];
  let productReviews: Review[] = [];

  try {
    let result = await db.select().from(products).where(eq(products.slug, slug));
    if (result.length === 0) {
      try {
        result = await db.select().from(products).where(eq(products.id, slug));
      } catch {
        // invalid UUID
      }
    }
    if (result.length === 0) notFound();

    // On French pages, if product doesn't have French translation, 404
    if (isFr && !result[0].nameFr) notFound();

    product = localizeProduct(result[0], isFr);

    productReviews = await db.select().from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt));

    // Related products - respect locale (only show French-translated on /fr)
    const relatedCond = isFr
      ? and(eq(products.active, true), isNotNull(products.nameFr), eq(products.category, product.category), ne(products.id, product.id))
      : and(eq(products.active, true), eq(products.category, product.category), ne(products.id, product.id));

    const relatedRaw = await db.select().from(products)
      .where(relatedCond)
      .orderBy(desc(products.rating)).limit(8);

    relatedProducts = relatedRaw.map(p => localizeProduct(p, isFr));

    if (relatedProducts.length < 4) {
      const moreCond = isFr
        ? and(eq(products.active, true), isNotNull(products.nameFr), ne(products.id, product.id), ne(products.category, product.category))
        : and(eq(products.active, true), ne(products.id, product.id), ne(products.category, product.category));

      const moreRaw = await db.select().from(products)
        .where(moreCond)
        .orderBy(desc(products.rating)).limit(8 - relatedProducts.length);

      relatedProducts = [...relatedProducts, ...moreRaw.map(p => localizeProduct(p, isFr))];
    }
  } catch {
    notFound();
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-20 lg:pt-24">
        <ProductDetails product={product} initialReviews={productReviews} />

        {relatedProducts.length > 0 && (
          <section className="py-14 lg:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">{t("youMayAlsoLike")}</h2>
                  <p className="text-gray-500 text-sm mt-1">{t("relatedDesc")}</p>
                </div>
                <Link
                  href={`/${locale}/shop?category=${product.category}`}
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-900 hover:gap-2 transition-all"
                >
                  {t("viewMore")} <ArrowRight className="w-4 h-4" />
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

        <RecentlyViewed excludeId={product.id} />
      </div>
      <Footer />
    </main>
  );
}