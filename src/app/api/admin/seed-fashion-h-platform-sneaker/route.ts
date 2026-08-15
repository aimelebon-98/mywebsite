import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

export async function GET() {
  try {
    const sourceUrl = "https://i.ibb.co/bjbNkh9b/Whats-App-Image-2026-08-14-at-12-59-51-PM.jpg";
    const slug = "h-logo-chunky-platform-sneaker";
    const slugFr = "basket-plateforme-logo-h";

    // Fetch live rates
    let ngnRate = 1364;
    let xofRate = 568;
    try {
      const rateRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        ngnRate = Number(rateData?.rates?.NGN) || 1364;
        xofRate = Number(rateData?.rates?.XOF) || 568;
      }
    } catch (e) { console.error("Rate fetch failed:", e); }

    // Supplier prices in NGN
    const costNgn = 19000;
    const sellingNgn = 25000;
    const compareNgn = 32000;

    const costUsd = Math.round((costNgn / ngnRate) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / ngnRate) * 100) / 100;
    const compareUsd = Math.round((compareNgn / ngnRate) * 100) / 100;
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 100);

    // Upload image to Vercel Blob
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/h-logo-chunky-platform-sneaker-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    // Cleanup existing
    const existing = await db.select().from(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const colors = [
      { name: "Black/White", image: imageUrl },
      { name: "White", image: imageUrl },
    ];

    const sizes = ["40", "41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["sneakers", "platform", "chunky", "streetwear", "h-logo", "lifestyle", "fashion", "abuja"];
    const tagsFr = ["baskets", "plateforme", "\u00e9paisses", "streetwear", "logo-h", "lifestyle", "mode", "abuja"];

    const longDescEn = `<p>Elevate your street style with the H-Logo Chunky Platform Sneaker \u2013 a bold statement piece designed to turn heads on every walk. This standout sneaker fuses modern minimalism with unmistakable branding, thanks to the oversized "H" side panel and thick platform sole.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium leather upper with contrast canvas panels</li>
  <li>Signature bold H-logo branding on the side</li>
  <li>Chunky rubber platform sole for height and comfort</li>
  <li>Cushioned insole for all-day wear</li>
  <li>Available in Black/White and All White colorways</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Fashion</td></tr>
  <tr><th>Model</th><td>H-Logo Chunky Platform Sneaker</td></tr>
  <tr><th>Colour</th><td>Black/White, White</td></tr>
  <tr><th>Material</th><td>Leather + Canvas + Rubber Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber platform</td></tr>
  <tr><th>Signature Detail</th><td>Oversized H side branding</td></tr>
  <tr><th>Closure</th><td>Chunky lace-up</td></tr>
  <tr><th>Style</th><td>Streetwear lifestyle</td></tr>
  <tr><th>Sizes</th><td>40 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Branded box, dust protection</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with cropped denim, cargo pants, or oversized hoodies for authentic streetwear vibes. The chunky sole adds instant height and attitude, while the bold H-logo elevates even the simplest fit.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Rehaussez votre style urbain avec la Basket Plateforme Logo H \u2013 une pi\u00e8ce audacieuse con\u00e7ue pour attirer tous les regards. Cette basket fusionne minimalisme moderne et branding distinctif, avec le grand "H" sur le panneau lat\u00e9ral et la semelle \u00e9paisse.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir premium avec panneaux en toile contrast\u00e9s</li>
  <li>Logo H signature audacieux sur le c\u00f4t\u00e9</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc pour hauteur et confort</li>
  <li>Semelle int\u00e9rieure rembourr\u00e9e pour un port toute la journ\u00e9e</li>
  <li>Disponible en Noir/Blanc et Blanc int\u00e9gral</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Fashion</td></tr>
  <tr><th>Mod\u00e8le</th><td>Basket Plateforme Logo H</td></tr>
  <tr><th>Couleur</th><td>Noir/Blanc, Blanc</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir + Toile + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme \u00e9paisse caoutchouc</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Logo H surdimensionn\u00e9</td></tr>
  <tr><th>Fermeture</th><td>Lacets \u00e9pais</td></tr>
  <tr><th>Style</th><td>Streetwear lifestyle</td></tr>
  <tr><th>Tailles</th><td>40 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque, protection anti-poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>Associez avec un jean court, un pantalon cargo ou un hoodie oversize pour un look streetwear authentique. La semelle \u00e9paisse ajoute instantan\u00e9ment hauteur et attitude, tandis que le logo H audacieux \u00e9l\u00e8ve m\u00eame les tenues les plus simples.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "H-Logo Chunky Platform Sneaker - Black & White",
      nameFr: "Basket Plateforme Logo H - Noir et Blanc",
      slug,
      slugFr,
      description: "Bold H-logo chunky platform sneaker with premium leather upper and thick rubber sole. Available in Black/White and White. Ships from Abuja.",
      descriptionFr: "Basket \u00e0 plateforme \u00e9paisse avec logo H audacieux, tige en cuir premium et semelle \u00e9paisse en caoutchouc. Disponible en Noir/Blanc et Blanc. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Bold H-logo chunky platform sneaker. Leather + canvas upper, thick rubber sole. Ships from Abuja.",
      shortDescriptionFr: "Basket plateforme audacieuse avec logo H. Cuir et toile, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Fashion",
      category: "sneakers",
      sku: "NDZ-FSH-HPL-BW01",
      material: "Leather + Canvas + Rubber Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 25,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: false,
      seoTitle: "H-Logo Chunky Platform Sneaker | New Deal Zone",
      seoTitleFr: "Basket Plateforme Logo H | New Deal Zone",
      metaDescription: "Bold H-logo chunky platform sneaker. Premium leather, thick rubber sole, Black/White & White. Fast delivery from Abuja.",
      metaDescriptionFr: "Basket plateforme audacieuse avec logo H. Cuir premium, semelle \u00e9paisse, Noir/Blanc et Blanc. Livraison rapide depuis Abuja.",
      focusKeyphrase: "chunky platform sneaker",
      focusKeyphraseFr: "basket plateforme \u00e9paisse",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    // Reviews
    const reviewData = [
      { name: "Chioma Okonkwo", rating: 5, daysAgo: 5, verified: true,
        commentEn: "Absolutely love these! The platform gives me such a boost and the H logo is stunning. Delivery to Abuja was next day.",
        commentFr: "J\u2019adore ces baskets! La plateforme donne un vrai boost et le logo H est magnifique. Livraison \u00e0 Abuja en un jour." },
      { name: "Amadou Diallo", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Quality is top notch, feels premium and the sole is solid. Got the black/white, matches everything.",
        commentFr: "Qualit\u00e9 au top, tr\u00e8s premium et la semelle est solide. J\u2019ai pris le noir/blanc, va avec tout." },
      { name: "Sophie Moreau", rating: 5, daysAgo: 41, verified: true,
        commentEn: "Perfect fit and super comfortable. The chunky sole is exactly what I wanted for street style. Highly recommend.",
        commentFr: "Taille parfaite et super confortable. La semelle \u00e9paisse c\u2019est exactement ce que je voulais pour le style urbain. Je recommande." },
      { name: "Kwabena Osei", rating: 4, daysAgo: 63, verified: false,
        commentEn: "Nice shoes, look great and comfy. Took a bit longer to arrive but worth the wait. Would order again.",
        commentFr: "Belles chaussures, tr\u00e8s classes et confortables. La livraison a pris un peu de temps mais \u00e7a valait le coup. Je recommanderai." },
      { name: "Blessing Adeyemi", rating: 5, daysAgo: 87, verified: true,
        commentEn: "Got so many compliments wearing these. The white version is clean and the H branding pops. Great purchase.",
        commentFr: "Beaucoup de compliments quand je les porte. La version blanche est propre et le logo H ressort bien. Super achat." },
    ];

    let totalRating = 0;
    for (const r of reviewData) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.commentEn,
        commentFr: r.commentFr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt,
      });
      totalRating += r.rating;
    }

    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Product + reviews seeded",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: { costNgn, sellingNgn, compareNgn, costUsd, sellingUsd, compareUsd, profitNgn, marginPct, ngnRate, xofRate },
      reviews: { count: reviewData.length, avg: avgRating },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}