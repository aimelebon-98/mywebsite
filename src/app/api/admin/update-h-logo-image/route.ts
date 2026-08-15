import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sourceUrl = "https://i.ibb.co/HLd9rGnx/Whats-App-Image-2026-08-14-at-12-59-51-PM-1.jpg";
    const slug = "h-logo-chunky-platform-sneaker";

    // Upload new image to Vercel Blob
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/h-logo-chunky-platform-sneaker-v2-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    // Find product
    const found = await db.select().from(products).where(eq(products.slug, slug));
    if (found.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const product = found[0];

    // Update all image fields
    const colors = [
      { name: "Black/White", image: imageUrl },
      { name: "White", image: imageUrl },
    ];
    const images = [imageUrl];

    await db.update(products).set({
      imageUrl,
      images: JSON.stringify(images),
      colors: JSON.stringify(colors),
      ogImage: imageUrl,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Product image updated",
      product: { id: product.id, slug, imageUrl, blobUsed },
      url: `https://www.newdealzone.com/en/product/${slug}`,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}