import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and, ilike, or, isNotNull } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";

// Convert supplier price in any currency to NGN using live rates
async function convertSupplierToNgn(supplierPrice: number, supplierCurrency: string): Promise<number> {
  if (!supplierPrice || supplierPrice <= 0) return 0;
  const cur = (supplierCurrency || "NGN").toUpperCase();
  if (cur === "NGN") return Math.round(supplierPrice);
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    const d = await r.json();
    if (d.result !== "success" || !d.rates) return 0;
    const supplierRate = d.rates[cur];
    const ngnRate = d.rates.NGN;
    if (!supplierRate || !ngnRate) return 0;
    const usdAmount = supplierPrice / supplierRate;
    return Math.round(usdAmount * ngnRate);
  } catch {
    return 0;
  }
}
import { sortByShippingTier } from "@/lib/shipping-tier";
import { pingIndexNow } from "@/lib/indexnow-ping";

// Strip sensitive pricing from public responses
const SENSITIVE_FIELDS = ["costPrice", "supplierPrice", "supplierCurrency"];
function stripPricing(p: Record<string, unknown>): Record<string, unknown> {
  const c = { ...p }; SENSITIVE_FIELDS.forEach(f => delete c[f]); return c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("active") !== "false";
    const locale = searchParams.get("locale");

    const conditions = [];
    if (activeOnly) conditions.push(eq(products.active, true));
    if (category && category !== "all") conditions.push(eq(products.category, category));
    if (featured === "true") conditions.push(eq(products.featured, true));

    if (locale === "fr") {
      conditions.push(isNotNull(products.nameFr));
    }

    if (search) {
      if (locale === "fr") {
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

    const result = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt));

    // Optional: sort local products (matching visitor country) first
    const sortByCountry = searchParams.get("sortByCountry");
    const sorted = sortByCountry ? sortByShippingTier(result, sortByCountry) : result;

    return NextResponse.json(sorted.map(p => stripPricing(p as unknown as Record<string, unknown>)));
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const {
      name, slug: slugInput, slugFr, description, shortDescription, longDescription,
      nameFr, descriptionFr, shortDescriptionFr, longDescriptionFr, tagsFr,
      price, comparePrice, costPrice, category, brand, sizes, colors,
      imageUrl, images, stock, featured, active, material, sku, tags, saleEndsAt,
      seoTitle, metaDescription, focusKeyphrase, ogImage, canonicalUrl, noIndex,
      seoTitleFr, metaDescriptionFr, focusKeyphraseFr,
      originCountry, originCity, supplierPrice, supplierCurrency,
    } = body;

    const slug = (slugInput && slugInput.trim()) ? slugInput.trim() : generateSlug(name);

    // If supplierPrice is provided in a non-NGN currency, auto-convert to NGN for costPrice
    let finalCostPrice = costPrice ? String(costPrice) : "0";
    if (supplierPrice && Number(supplierPrice) > 0) {
      const converted = await convertSupplierToNgn(Number(supplierPrice), supplierCurrency || "NGN");
      if (converted > 0) finalCostPrice = String(converted);
    }

    const result = await db.insert(products).values({
      name,
      slug,
      slugFr: (slugFr && slugFr.trim()) ? slugFr.trim() : (nameFr ? generateSlug(nameFr) : null),
      description: description || "",
      shortDescription: shortDescription || "",
      longDescription: longDescription || "",
      nameFr: nameFr ? String(nameFr) : null,
      descriptionFr: descriptionFr ? String(descriptionFr) : null,
      shortDescriptionFr: shortDescriptionFr ? String(shortDescriptionFr) : null,
      longDescriptionFr: longDescriptionFr ? String(longDescriptionFr) : null,
      tagsFr: tagsFr ? JSON.stringify(Array.isArray(tagsFr) ? tagsFr : []) : null,
      price: String(price),
      comparePrice: comparePrice ? String(comparePrice) : null,
      costPrice: finalCostPrice,
      category: category || "sneakers",
      brand: brand || "",
      sizes: JSON.stringify(sizes || []),
      colors: JSON.stringify(colors || []),
      imageUrl: imageUrl || "",
      images: JSON.stringify(images || []),
      stock: stock || 0,
      featured: (featured || (saleEndsAt && new Date(saleEndsAt).getTime() > Date.now())) || false,
      saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
      active: active !== false,
      material: material || "",
      sku: sku || "",
      tags: JSON.stringify(tags || []),
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      focusKeyphrase: focusKeyphrase || null,
      ogImage: ogImage || null,
      canonicalUrl: canonicalUrl || null,
      noIndex: Boolean(noIndex),
      seoTitleFr: seoTitleFr || null,
      metaDescriptionFr: metaDescriptionFr || null,
      focusKeyphraseFr: focusKeyphraseFr || null,
      originCountry: originCountry || "NG",
      originCity: originCity || "Abuja",
      supplierPrice: supplierPrice ? String(supplierPrice) : "0",
      supplierCurrency: supplierCurrency || "NGN",
    }).returning();

    // IndexNow: new product published - ping search engines
    try {
      const newProduct = result[0];
      const enSlug = newProduct.slug;
      const frSlug = newProduct.slugFr || newProduct.slug;
      const urls = [
        `https://www.newdealzone.com/en/product/${enSlug}`,
        `https://www.newdealzone.com/fr/product/${frSlug}`,
        "https://www.newdealzone.com/en/shop",
        "https://www.newdealzone.com/fr/shop",
      ];
      // Fire-and-forget, do not block response
      pingIndexNow(urls).catch(() => {});
    } catch (e) { console.warn("IndexNow ping skipped:", e); }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
