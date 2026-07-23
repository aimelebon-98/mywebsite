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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mywebsite-inky-gamma.vercel.app";
const SITE_NAME = "SoleVault";

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

    const raw = result[0];
    const product = localizeProduct(raw, isFr);
    const price = parseFloat(product.price);
    const currency = "USD";

    // Choose SEO fields with locale awareness + smart fallbacks
    const seoTitle = isFr
      ? (raw.seoTitleFr || raw.seoTitle || `${product.name} - ${SITE_NAME}`)
      : (raw.seoTitle || `${product.name} - ${SITE_NAME}`);

    const metaDescription = isFr
      ? (raw.metaDescriptionFr || raw.metaDescription || product.shortDescription || product.description.slice(0, 155))
      : (raw.metaDescription || product.shortDescription || product.description.slice(0, 155));

    const ogImage = raw.ogImage || product.imageUrl;
    const productUrl = `${SITE_URL}/${locale}/product/${slug}`;
    const canonical = raw.canonicalUrl || productUrl;

    // Keyphrase-driven keywords
    const focusKp = isFr ? (raw.focusKeyphraseFr || raw.focusKeyphrase || "") : (raw.focusKeyphrase || "");
    const keywordList = [
      focusKp,
      product.name,
      product.brand,
      product.category,
      "shoes",
      "footwear",
      SITE_NAME,
    ].filter(Boolean);

    const metadata: Metadata = {
      title: seoTitle,
      description: metaDescription,
      keywords: [...new Set(keywordList)].join(", "),
      alternates: {
        canonical,
        languages: {
          "en-US": `${SITE_URL}/en/product/${slug}`,
          "fr-FR": `${SITE_URL}/fr/product/${slug}`,
          "x-default": `${SITE_URL}/en/product/${slug}`,
        },
      },
      openGraph: {
        title: seoTitle,
        description: metaDescription,
        url: productUrl,
        siteName: SITE_NAME,
        locale: isFr ? "fr_FR" : "en_US",
        type: "website",
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: metaDescription,
        images: ogImage ? [ogImage] : [],
      },
      other: {
        "product:price:amount": price.toFixed(2),
        "product:price:currency": currency,
        "product:availability": product.stock > 0 ? "in stock" : "out of stock",
        "product:brand": product.brand || SITE_NAME,
        "product:category": product.category,
      },
    };

    // Honor noindex flag from admin
    if (raw.noIndex) {
      metadata.robots = {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      };
    }

    return metadata;
  } catch {
    return { title: "Product - SoleVault" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale: paramLocale } = await params;
  const t = await getTranslations("product");
  const locale = await getLocale();
  const isFr = locale === "fr";

  let rawProduct: Product;
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

    if (isFr && !result[0].nameFr) notFound();

    rawProduct = result[0];
    product = localizeProduct(rawProduct, isFr);

    productReviews = await db.select().from(reviews)
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt));

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

  // Enhanced JSON-LD (rich Google snippets)
  const productUrl = `${SITE_URL}/${paramLocale}/product/${slug}`;
  const images: string[] = [];
  if (product.imageUrl) images.push(product.imageUrl);
  try {
    const parsedImages = JSON.parse(product.images) as string[];
    if (Array.isArray(parsedImages)) {
      parsedImages.forEach(img => { if (img && !images.includes(img)) images.push(img); });
    }
  } catch {}

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.length > 0 ? images : undefined,
    url: productUrl,
    brand: { "@type": "Brand", name: product.brand || SITE_NAME },
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "USD",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const ratingNum = parseFloat(product.rating ?? "0");
  if (ratingNum > 0 && (product.reviewCount || 0) > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Include up to 5 real reviews in JSON-LD
  if (productReviews.length > 0) {
    jsonLd.review = productReviews.slice(0, 5).map(r => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customerName },
      datePublished: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      reviewBody: isFr ? (r.commentFr || r.comment) : r.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
        worstRating: "1",
      },
    }));
  }

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${paramLocale}` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/${paramLocale}/shop` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${SITE_URL}/${paramLocale}/shop?category=${product.category}` },
      { "@type": "ListItem", position: 4, name: product.name, item: productUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
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