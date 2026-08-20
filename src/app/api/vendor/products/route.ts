import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, vendorProducts } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getCurrentVendor } from "@/lib/vendor-auth";

export const dynamic = "force-dynamic";

async function slugifyUnique(base: string): Promise<string> {
  const safe = base.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "product";
  let slug = safe;
  let i = 1;
  while (true) {
    const [exists] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!exists) return slug;
    i++;
    slug = `${safe}-${i}`;
    if (i > 999) return `${safe}-${Date.now()}`;
  }
}

// Fetch live USD rates
async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.rates || {};
  } catch {
    return { USD: 1, NGN: 1364, XOF: 568, EUR: 0.92, GHS: 13, GBP: 0.79, KES: 130, ZAR: 18 };
  }
}

function toUsd(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === "USD") return amount;
  const rate = rates[currency];
  if (!rate) return amount;
  return amount / rate;
}

export async function GET() {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myVps = await db.select().from(vendorProducts)
      .where(eq(vendorProducts.vendorId, vendor.id))
      .orderBy(desc(vendorProducts.submittedAt));

    if (myVps.length === 0) return NextResponse.json({ products: [] });

    const productIds = myVps.map(v => v.productId);
    const prods = await db.select().from(products).where(inArray(products.id, productIds));

    const merged = myVps.map(vp => {
      const p = prods.find(x => x.id === vp.productId);
      if (!p) return null;
      return {
        id: p.id,
        vendorProductId: vp.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        price: p.price,
        stock: p.stock,
        category: p.category,
        brand: p.brand,
        active: p.active,
        vendorStatus: vp.status,
        adminNote: vp.adminNote,
        submittedAt: vp.submittedAt,
        approvedAt: vp.approvedAt,
      };
    }).filter(Boolean);

    return NextResponse.json({ products: merged });
  } catch (error) {
    const msg = process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const vendor = await getCurrentVendor();
    if (!vendor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (vendor.status !== "approved") return NextResponse.json({ error: "Your account must be approved" }, { status: 403 });

    const body = await req.json();
    const {
      name, nameFr,
      description, descriptionFr,
      shortDescription, shortDescriptionFr,
      longDescription, longDescriptionFr,
      price, comparePrice, currency,
      category, brand, material, sku,
      sizes, colors, images, imageUrl,
      stock, tags, tagsFr,
      seoTitle, seoTitleFr,
      metaDescription, metaDescriptionFr,
      focusKeyphrase, focusKeyphraseFr,
      ogImage,
      originCountry, originCity,
    } = body;

    if (!name || !price || !imageUrl) {
      return NextResponse.json({ error: "Name, price and at least one image are required" }, { status: 400 });
    }

    const priceNum = parseFloat(String(price));
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Convert to USD if currency is set
    const vAny = vendor as unknown as { preferredCurrency?: string };
    const vendorCurrency = String(currency || vAny.preferredCurrency || "USD");
    const rates = await fetchRates();
    const priceUsd = toUsd(priceNum, vendorCurrency, rates);
    const compareNum = parseFloat(String(comparePrice || "0"));
    const compareUsd = compareNum > 0 ? toUsd(compareNum, vendorCurrency, rates) : null;

    const slug = await slugifyUnique(name);
    const slugFr = nameFr ? await slugifyUnique(nameFr) : slug + "-fr";

    const [newProduct] = await db.insert(products).values({
      name: String(name).slice(0, 200),
      nameFr: nameFr ? String(nameFr).slice(0, 200) : null,
      slug,
      slugFr,
      description: String(description || shortDescription || "").slice(0, 500),
      descriptionFr: descriptionFr ? String(descriptionFr).slice(0, 500) : null,
      shortDescription: String(shortDescription || "").slice(0, 500),
      shortDescriptionFr: shortDescriptionFr ? String(shortDescriptionFr).slice(0, 500) : null,
      longDescription: String(longDescription || "").slice(0, 20000),
      longDescriptionFr: longDescriptionFr ? String(longDescriptionFr).slice(0, 20000) : null,
      price: priceUsd.toFixed(2),
      costPrice: "0",
      comparePrice: compareUsd ? compareUsd.toFixed(2) : null,
      category: String(category || "sneakers"),
      brand: String(brand || "").slice(0, 100),
      material: String(material || "").slice(0, 200),
      sku: String(sku || "").slice(0, 60),
      sizes: JSON.stringify(Array.isArray(sizes) ? sizes : []),
      colors: JSON.stringify(Array.isArray(colors) ? colors : []),
      imageUrl: String(imageUrl).slice(0, 500),
      images: JSON.stringify(Array.isArray(images) ? images : [imageUrl]),
      stock: parseInt(String(stock || "0"), 10) || 0,
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      tagsFr: tagsFr ? JSON.stringify(Array.isArray(tagsFr) ? tagsFr : []) : null,
      seoTitle: seoTitle || null,
      seoTitleFr: seoTitleFr || null,
      metaDescription: metaDescription || null,
      metaDescriptionFr: metaDescriptionFr || null,
      focusKeyphrase: focusKeyphrase || null,
      focusKeyphraseFr: focusKeyphraseFr || null,
      ogImage: ogImage || imageUrl,
      originCountry: String(originCountry || vendor.country || "NG").slice(0, 5),
      originCity: String(originCity || vendor.city || "Abuja").slice(0, 60),
      supplierPrice: priceNum.toFixed(2),
      supplierCurrency: vendorCurrency,
      active: false,
    }).returning();

    await db.insert(vendorProducts).values({
      productId: newProduct.id,
      vendorId: vendor.id,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Product submitted for approval",
      product: { id: newProduct.id, slug: newProduct.slug, priceUsd: priceUsd.toFixed(2), currency: vendorCurrency },
    });
  } catch (error) {
    const msg = process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}