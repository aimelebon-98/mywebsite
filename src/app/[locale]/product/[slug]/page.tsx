import { db } from "@/db";
import { products, reviews as reviewsTable, type Product, type Review } from "@/db/schema";
import { eq, or, and, ne, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import RecentlyViewed from "@/components/RecentlyViewed";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getProduct(slug: string) {
  const rows = await db
    .select()
    .from(products)
    .where(or(eq(products.slug, slug), eq(products.slugFr, slug)))
    .limit(1);
  return rows[0] || null;
}

async function getReviews(productId: string): Promise<Review[]> {
  try {
    return await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.createdAt));
  } catch {
    return [];
  }
}

async function getRelated(currentId: string, category: string): Promise<Product[]> {
  try {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.category, category),
        ne(products.id, currentId),
        eq(products.active, true),
      ))
      .orderBy(desc(products.featured), desc(products.createdAt))
      .limit(4);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.active) {
    return {
      title: "Product Not Available | New Deal Zone",
      description: "This product is no longer available.",
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      },
    };
  }

  const isFr = locale === "fr";
  const name = isFr && product.nameFr ? product.nameFr : product.name;
  const desc = isFr && product.descriptionFr ? product.descriptionFr : product.description;
  const canonicalSlug = isFr && product.slugFr ? product.slugFr : product.slug;
  const seoTitle = isFr && product.seoTitleFr ? product.seoTitleFr : product.seoTitle;
  const metaDesc = isFr && product.metaDescriptionFr ? product.metaDescriptionFr : product.metaDescription;

  return {
    title: seoTitle || `${name} | New Deal Zone`,
    description: metaDesc || desc || "",
    alternates: {
      canonical: `https://www.newdealzone.com/${locale}/product/${canonicalSlug}`,
      languages: {
        en: `https://www.newdealzone.com/en/product/${product.slug}`,
        fr: `https://www.newdealzone.com/fr/product/${product.slugFr || product.slug}`,
        "x-default": `https://www.newdealzone.com/en/product/${product.slug}`,
      },
    },
    openGraph: {
      title: seoTitle || name || "",
      description: metaDesc || desc || "",
      images: product.ogImage ? [product.ogImage] : product.imageUrl ? [product.imageUrl] : [],
      type: "website",
      url: `https://www.newdealzone.com/${locale}/product/${canonicalSlug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.active) {
    notFound();
  }

  const [related, initialReviews] = await Promise.all([
    getRelated(product.id, product.category),
    getReviews(product.id),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white overflow-x-hidden max-w-full">
        <ProductDetails
          product={product}
          locale={locale}
          relatedProducts={related}
          initialReviews={initialReviews}
        />
        <YouMayAlsoLike
          currentProductId={product.id}
          category={product.category}
          locale={locale}
        />
        <RecentlyViewed excludeId={product.id} />
      </main>
      <Footer />
    </>
  );
}