import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";
import { sortByShippingTier } from "@/lib/shipping-tier";

// Strip sensitive pricing from public responses
const SENSITIVE_FIELDS = ["costPrice", "supplierPrice", "supplierCurrency"];
function stripPricing(p: Record<string, unknown>): Record<string, unknown> {
  const c = { ...p };
  SENSITIVE_FIELDS.forEach((f) => delete c[f]);
  return c;
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

    if (search) {
      if (locale === "fr") {
        conditions.push(
          or(
            ilike(products.nameFr, `%${search}%`),
            ilike(products.name, `%${search}%`),
            ilike(products.descriptionFr, `%${search}%`)
          )!
        );
      } else {
        conditions.push(
          or(
            ilike(products.name, `%${search}%`),
            ilike(products.description, `%${search}%`)
          )!
        );
      }
    }

    const result = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt));

    const sortByCountry = searchParams.get("sortByCountry");
    const sorted = sortByCountry ? sortByShippingTier(result, sortByCountry) : result;

    return NextResponse.json(sorted.map((p) => stripPricing(p as unknown as Record<string, unknown>)));
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}