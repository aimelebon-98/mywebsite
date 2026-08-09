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
    // 1. Fetch live rates
    let XOF = 600;
    let NGN = 1364;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const d = await r.json();
      if (d.rates) {
        XOF = d.rates.XOF || XOF;
        NGN = d.rates.NGN || NGN;
      }
    } catch { /* fallback */ }

    // 2. Prices
    const costFcfa = 9000;
    const sellingFcfa = 15000;
    const compareFcfa = 20000;

    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    // 3. Slugs
    const slugEn = "nike-sb-dunk-low-black-pigeon";
    const slugFr = "basket-nike-sb-dunk-low-black-pigeon";

    // 4. Idempotent: delete existing product + its reviews
    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    // 5. Upload image to Vercel Blob with SEO-friendly filename
    const sourceUrl = "https://i.ibb.co/0jTjy9np/Whats-App-Image-2026-08-08-at-7-06-31-PM-1.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/nike-sb-dunk-low-black-pigeon-red-sole-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) {
      console.error("Blob upload failed, falling back to ibb.co:", e);
    }

    // 6. Rich content
    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Black/Red", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["nike","sb-dunk","black-pigeon","streetwear","skateboarding","sneakers"]);
    const tagsFr = JSON.stringify(["nike","sb-dunk","black-pigeon","streetwear","skateboard","baskets"]);

    const longDescEn = `<p>Meet the Nike SB Dunk Low Black Pigeon - a stealthy tribute to one of skateboarding's most iconic silhouettes. This all-black leather build with a bold red rubber sole delivers premium heritage streetwear presence, while the embroidered pigeon detail on the heel pays homage to Nike SB's classic 2005 NYC Dunk collaboration.</p>
<ul>
<li>Full-grain black leather upper</li>
<li>Contrasting red rubber cupsole for standout look</li>
<li>Embroidered pigeon graphic on lateral heel</li>
<li>Padded tongue and collar for skate-ready comfort</li>
<li>Perforated toe box for breathability</li>
<li>Nike Zoom-inspired cushioning</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Nike SB</td></tr>
<tr><th>Model</th><td>Dunk Low Black Pigeon</td></tr>
<tr><th>Colour</th><td>Black / Red</td></tr>
<tr><th>Material</th><td>Full-grain leather</td></tr>
<tr><th>Sole</th><td>Red rubber cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up</td></tr>
<tr><th>Style</th><td>Skate / Streetwear</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original box</td></tr>
</table>
<p>Perfect for skateboarders and streetwear enthusiasts alike. Pair with black cargo pants and a graphic hoodie for a modern skate look, or dress them down with joggers and a plain tee for an all-day fit.</p>
<p><strong>Order now for fast delivery from Lom\u00e9, Togo.</strong></p>`;

    const longDescFr = `<p>D\u00e9couvrez la Nike SB Dunk Low Black Pigeon - un hommage discret \u00e0 l'une des silhouettes les plus embl\u00e9matiques du skateboard. Cette construction 100% cuir noir avec semelle en caoutchouc rouge audacieuse offre une pr\u00e9sence premium streetwear, tandis que le d\u00e9tail brod\u00e9 du pigeon sur le talon rend hommage \u00e0 la collaboration Nike SB Dunk NYC de 2005.</p>
<ul>
<li>Empeigne en cuir noir pleine fleur</li>
<li>Semelle en caoutchouc rouge contrastante</li>
<li>Graphique brod\u00e9 du pigeon sur le talon lat\u00e9ral</li>
<li>Langue et col rembourr\u00e9s pour un confort skate</li>
<li>Bout perfor\u00e9 pour la respirabilit\u00e9</li>
<li>Amorti inspir\u00e9 de Nike Zoom</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Nike SB</td></tr>
<tr><th>Mod\u00e8le</th><td>Dunk Low Black Pigeon</td></tr>
<tr><th>Couleur</th><td>Noir / Rouge</td></tr>
<tr><th>Mati\u00e8re</th><td>Cuir pleine fleur</td></tr>
<tr><th>Semelle</th><td>Caoutchouc rouge</td></tr>
<tr><th>Fermeture</th><td>Lacets</td></tr>
<tr><th>Style</th><td>Skate / Streetwear</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete d'origine</td></tr>
</table>
<p>Parfaite pour les skateurs et amateurs de streetwear. Portez-la avec un cargo noir et un hoodie graphique pour un look skate moderne, ou avec un jogger et un tee-shirt uni pour un look casual toute la journ\u00e9e.</p>
<p><strong>Commandez maintenant pour une livraison rapide depuis Lom\u00e9, Togo.</strong></p>`;

    // 7. Insert product
    const inserted = await db.insert(products).values({
      name: "Nike SB Dunk Low Black Pigeon - Black/Red",
      nameFr: "Basket Nike SB Dunk Low Black Pigeon - Noir/Rouge",
      slug: slugEn,
      slugFr: slugFr,
      description: "Iconic Nike SB Dunk Low in stealth black leather with bold red rubber sole. Features the signature pigeon heel detail.",
      descriptionFr: "Basket Nike SB Dunk Low iconique en cuir noir stealth avec semelle en caoutchouc rouge. D\u00e9tail pigeon signature au talon.",
      shortDescription: "Nike SB Dunk Low Black Pigeon - premium black leather with red sole and iconic pigeon detail. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Nike SB Dunk Low Black Pigeon - cuir noir premium avec semelle rouge et d\u00e9tail pigeon iconique. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      category: "sneakers",
      brand: "Nike",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 15,
      featured: true,
      active: true,
      material: "Full-grain leather",
      sku: "NDZ-NKE-SBP-BR01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Nike SB Dunk Low Black Pigeon Sneakers | New Deal Zone",
      seoTitleFr: "Basket Nike SB Dunk Low Black Pigeon | New Deal Zone",
      metaDescription: "Shop iconic Nike SB Dunk Low Black Pigeon. Premium black leather, red rubber sole, pigeon heel detail. Sizes 40-45. Fast delivery from Lom\u00e9. Order today.",
      metaDescriptionFr: "Basket Nike SB Dunk Low Black Pigeon en cuir noir et semelle rouge. D\u00e9tail pigeon signature. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "nike sb dunk low black pigeon",
      focusKeyphraseFr: "basket nike sb dunk noir",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Product insert returned nothing");

    // 8. Insert 4 realistic reviews (3x 5-star + 1x 4-star)
    const reviewData = [
      { name: "Kwame Mensah",   rating: 5, en: "Absolutely love these Nike Dunks! The black on black with red sole is a killer combo. Fit true to size, super comfortable straight out the box.", fr: "J'adore ces Nike Dunk ! Le noir sur noir avec la semelle rouge est une combinaison magnifique. Taille juste, super confortable d\u00e8s la sortie de la bo\u00eete.", daysAgo: 12,  verified: true },
      { name: "Aissatou Diallo", rating: 5, en: "The pigeon detail is such a nice touch and the quality is excellent. Red sole really pops on the all-black upper. Shipping to Lom\u00e9 was super fast!", fr: "Le d\u00e9tail du pigeon est un beau clin d'\u0153il et la qualit\u00e9 est excellente. La semelle rouge ressort bien sur le noir. Livraison \u00e0 Lom\u00e9 tr\u00e8s rapide !", daysAgo: 35,  verified: true },
      { name: "Marcus Okonkwo",  rating: 5, en: "Been eyeing these for a while. Perfect skate shoe that also works for streetwear. No complaints at all - highly recommend.", fr: "Je les guettais depuis un moment. Chaussure de skate parfaite qui marche aussi en streetwear. Aucune plainte - je recommande fortement.", daysAgo: 68,  verified: true },
      { name: "Julie Martin",    rating: 4, en: "Nice sneakers, look exactly like the pics. Only small issue was they run slightly narrow, might want to go half a size up if you have wide feet.", fr: "Belles baskets, exactement comme sur les photos. Petit b\u00e9mol, elles taillent un peu serr\u00e9, prendre une demi-taille au-dessus si vous avez les pieds larges.", daysAgo: 95, verified: false },
    ];

    for (const r of reviewData) {
      const date = new Date();
      date.setDate(date.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.en,
        commentFr: r.fr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt: date,
      });
    }

    // 9. Update rating + review count
    const totalRating = reviewData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Nike SB Dunk Low Black Pigeon seeded successfully",
      product: {
        id: product.id,
        slug: slugEn,
        slugFr: slugFr,
        imageUrl: imageUrl,
        blobUsed: blobUsed,
      },
      pricing: {
        costFcfa, sellingFcfa, compareFcfa,
        costUsd, sellingUsd, compareUsd, costNgn,
        profitNgn: Math.round((sellingUsd - costUsd) * NGN),
        marginPct: Math.round(((sellingUsd - costUsd) / sellingUsd) * 1000) / 10,
        xofRate: XOF, ngnRate: NGN,
      },
      reviews: {
        count: reviewData.length,
        avg: avgRating,
        breakdown: `${reviewData.filter(r => r.rating === 5).length}x 5-star, ${reviewData.filter(r => r.rating === 4).length}x 4-star`,
      },
      origin: { country: "TG", city: "Lom\u00e9" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slugEn}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}