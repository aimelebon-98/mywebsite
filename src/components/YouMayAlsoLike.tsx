import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import ProductCard from "./ProductCard";
import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface Props {
  currentProductId?: string;
  category?: string;
  locale: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

// BLOAT_STRIP - remove heavy text fields not needed for product cards
function slim(p: Product): Product {
  return {
    ...p,
    description: "",
    descriptionFr: null,
    longDescription: "",
    longDescriptionFr: null,
    metaDescription: null,
    metaDescriptionFr: null,
    seoTitle: null,
    seoTitleFr: null,
    focusKeyphrase: null,
    focusKeyphraseFr: null,
    ogImage: null,
    canonicalUrl: null,
  };
}

export default async function YouMayAlsoLike({
  currentProductId,
  category,
  locale,
  limit = 4,
  title,
  subtitle,
}: Props) {
  let items: Product[] = [];

  try {
    if (category) {
      const conditions = [
        eq(products.active, true),
        ne(products.category, category),
      ];
      if (currentProductId) {
        conditions.push(ne(products.id, currentProductId));
      }
      items = await db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }

    if (items.length === 0) {
      const conds = [eq(products.active, true), eq(products.featured, true)];
      if (currentProductId) conds.push(ne(products.id, currentProductId));
      items = await db
        .select()
        .from(products)
        .where(and(...conds))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }

    if (items.length === 0) {
      const conds = [eq(products.active, true)];
      if (currentProductId) conds.push(ne(products.id, currentProductId));
      items = await db
        .select()
        .from(products)
        .where(and(...conds))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }
  } catch (err) {
    console.error("YouMayAlsoLike fetch error:", err);
    return null;
  }

  if (items.length === 0) return null;

  const isFr = locale === "fr";
  // Slim each product before localizing so heavy fields are gone
  const localized = items.map((p) => {
    const s = slim(p);
    return {
      ...s,
      name: isFr && p.nameFr ? p.nameFr : p.name,
    };
  });

  const t = await getTranslations("home");
  let heading = title;
  let sub = subtitle;
  if (!heading) {
    try {
      heading = t("youMayAlsoLike");
    } catch {
      heading = isFr ? "Vous pourriez aussi aimer" : "You may also like";
    }
  }
  if (!sub) {
    try {
      sub = t("youMayAlsoLikeDesc");
    } catch {
      sub = isFr
        ? "D\u00e9couvrez d'autres cat\u00e9gories"
        : "Explore different categories";
    }
  }

  return (
    <section className="py-10 lg:py-14 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{heading}</h2>
            <p className="text-gray-500 text-sm">{sub}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {localized.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}