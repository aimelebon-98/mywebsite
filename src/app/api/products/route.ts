import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const activeOnly = searchParams.get("active") !== "false";

    const conditions = [];
    if (activeOnly) conditions.push(eq(products.active, true));
    if (category && category !== "all") conditions.push(eq(products.category, category));
    if (featured === "true") conditions.push(eq(products.featured, true));
    if (search) conditions.push(ilike(products.name, `%${search}%`));

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
    const { name, description, price, comparePrice, category, brand, sizes, colors, imageUrl, images, stock, featured, active, material, sku, tags } = body;

    const slug = generateSlug(name);

    const result = await db.insert(products).values({
      name,
      slug,
      description: description || "",
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
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
