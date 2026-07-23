import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and, ilike, or, isNotNull } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, description, shortDescription, longDescription,
      nameFr, descriptionFr, shortDescriptionFr, longDescriptionFr, tagsFr,
      price, comparePrice, category, brand, sizes, colors,
      imageUrl, images, stock, featured, active, material, sku, tags,
      seoTitle, metaDescription, focusKeyphrase, ogImage, canonicalUrl, noIndex,
      seoTitleFr, metaDescriptionFr, focusKeyphraseFr,
    } = body;

    const slug = generateSlug(name);

    const result = await db.insert(products).values({
      name,
      slug,
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
      category: category || "sneakers",
      brand: brand || "",
      sizes: JSON.stringify(sizes || []),
      colors: JSON.stringify(colors || []),
      imageUrl: imageUrl || "",
      images: JSON.stringify(images || []),
      stock: stock || 0,
      featured: featured || false,
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
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
