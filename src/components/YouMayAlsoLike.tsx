import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { eq, and, ne, desc, or } from "drizzle-orm";
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
    // Try: same category, excluding current, active only
    if (category) {
      const conditions = [
        eq(products.category, category),
        eq(products.active, true),
      ];
      if (currentProductId) {
        conditions.push(ne(products.id, currentProductId));
      }
      items = await db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(desc(products.featured), desc(products.createdAt))
        .limit(limit);
    }

    // Fallback: any active product excluding current
    if (items.length === 0) {
      const conds = [eq(products.active, true)];
      if (currentProductId) conds.push(ne(products.id, currentProductId));
      items = await db
        .select()
        .from(products)
        .where(and(...conds))
        .orderBy(desc(products.featured), desc(products.createdAt))
        .limit(limit);
    }
  } catch (err) {
    console.error("YouMayAlsoLike fetch error:", err);
    return null;
  }

  // Hide section entirely if nothing to show
  if (items.length === 0) return null;

  // Localize product names/descriptions
  const isFr = locale === "fr";
  const localized = items.map((p) => ({
    ...p,
    name: isFr && p.nameFr ? p.nameFr : p.name,
    description: isFr && p.descriptionFr ? p.descriptionFr : p.description,
  }));

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
        ? "S\u00e9lection soigneusement choisie pour vous"
        : "Handpicked selection just for you";
    }
  }

  return (
    <section className="py-10 lg:py-14 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
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