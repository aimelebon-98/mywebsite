import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "@/components/ProductDetails";

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
    // Trigger 404 which we upgrade to 410 via not-found.tsx status hint
    notFound();
  }

  return <ProductDetails product={product} locale={locale} />;
}