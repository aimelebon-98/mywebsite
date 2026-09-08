import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories as categoriesTable } from "@/db/schema";
import { eq, desc, asc, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const steps: Record<string, any> = {};

  // Step 1: Categories
  try {
    const cats = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.active, true))
      .orderBy(asc(categoriesTable.sortOrder));
    steps.step1_categories = { success: true, count: cats.length, sample: cats[0] };
  } catch (e: any) {
    steps.step1_categories = { success: false, error: e.message, stack: e.stack };
  }

  // Step 2: Products simple
  try {
    const prods = await db.select().from(products)
      .where(eq(products.active, true))
      .orderBy(desc(products.createdAt));
    steps.step2_products_simple = { success: true, count: prods.length };
  } catch (e: any) {
    steps.step2_products_simple = { success: false, error: e.message, stack: e.stack };
  }

  // Step 3: Exact Shop Page query
  try {
    const conditions = [eq(products.active, true)];
    const _rawProducts = await db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
    
    const productList = _rawProducts.map(p => ({
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
    }));
    steps.step3_shop_query = { success: true, count: productList.length };
  } catch (e: any) {
    steps.step3_shop_query = { success: false, error: e.message, stack: e.stack };
  }

  // Step 4: Brands query
  try {
    const brandCond = eq(products.active, true);
    const allProducts = await db.select({ brand: products.brand })
      .from(products).where(brandCond);
    const allBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
    steps.step4_brands = { success: true, count: allBrands.length, brands: allBrands };
  } catch (e: any) {
    steps.step4_brands = { success: false, error: e.message, stack: e.stack };
  }

  return NextResponse.json(steps);
}