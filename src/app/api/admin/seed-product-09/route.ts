import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

const IMAGE_URL = "https://i.ibb.co/qLhSS4SR/north-face-slip-on-knit-black-white.jpg";
const SLUG_EN = "north-face-slip-on-knit-black-white";
const SLUG_FR = "basket-north-face-slip-on-tricot-noir-blanc";

const LONG_DESC_EN = `<p>The North Face slip-on knit sneaker in classic black and white - an ultra-comfortable everyday shoe that combines outdoor brand heritage with modern minimalist style. The seamless knit upper hugs your foot for a sock-like fit, while the chunky white platform sole adds contemporary streetwear appeal.</p>

<p>Perfect for daily wear, travel, or weekend adventures, these slip-ons eliminate laces entirely for effortless on-and-off comfort. The signature North Face logo in white contrasts beautifully against the black stretch knit upper.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Lace-Free Slip-On</strong> - Effortless on-and-off design, no tying required</li>
  <li><strong>Sock-Fit Knit Upper</strong> - Stretchy breathable knit hugs your foot perfectly</li>
  <li><strong>Iconic North Face Logo</strong> - White branding on side panel</li>
  <li><strong>Chunky White Platform</strong> - Modern streetwear silhouette with extra height</li>
  <li><strong>Cushioned Insole</strong> - Removable padded insole for all-day comfort</li>
  <li><strong>Includes Original Box + Extra Insoles</strong> - Complete package</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
  <tr><td>Brand</td><td>The North Face</td></tr>
  <tr><td>Model</td><td>Slip-On Knit</td></tr>
  <tr><td>Colour</td><td>Black / White</td></tr>
  <tr><td>Material</td><td>Stretch Knit + Rubber</td></tr>
  <tr><td>Sole</td><td>Chunky White Rubber Platform</td></tr>
  <tr><td>Closure</td><td>Slip-On (no laces)</td></tr>
  <tr><td>Style</td><td>Casual / Lifestyle</td></tr>
  <tr><td>Available Sizes</td><td>EU 41-46</td></tr>
  <tr><td>Includes</td><td>Original TNF box, cushioned insoles, care card</td></tr>
</table>

<p><strong>Styling tip:</strong> Pair these with joggers, straight-leg jeans, or shorts for effortless everyday looks. The all-black upper with white sole creates a versatile foundation that works with almost any outfit in your wardrobe.</p>

<p><strong>Limited stock available - grab yours before they sell out. Free shipping across Nigeria and West Africa.</strong></p>`;

const LONG_DESC_FR = `<p>La basket slip-on tricot\u00e9e The North Face en noir et blanc classique - une chaussure quotidienne ultra-confortable qui combine l'h\u00e9ritage de la marque outdoor avec un style minimaliste moderne. La tige tricot\u00e9e sans couture \u00e9pouse votre pied pour un ajustement chaussette, tandis que la semelle plateforme blanche chunky ajoute un attrait streetwear contemporain.</p>

<p>Parfaites pour le port quotidien, les voyages ou les aventures du week-end, ces slip-ons \u00e9liminent enti\u00e8rement les lacets pour un confort d'enfilage sans effort. Le logo signature North Face en blanc contraste magnifiquement avec la tige tricot\u00e9e stretch noire.</p>

<h2>Caract\u00e9ristiques Cl\u00e9s</h2>
<ul>
  <li><strong>Slip-On Sans Lacets</strong> - Design d'enfilage facile, aucun no\u0153ud n\u00e9cessaire</li>
  <li><strong>Tige Tricot\u00e9e Ajustement Chaussette</strong> - Tricot stretch respirant qui \u00e9pouse parfaitement le pied</li>
  <li><strong>Logo North Face Embl\u00e9matique</strong> - Branding blanc sur le panneau lat\u00e9ral</li>
  <li><strong>Plateforme Blanche Chunky</strong> - Silhouette streetwear moderne avec hauteur suppl\u00e9mentaire</li>
  <li><strong>Semelle Int\u00e9rieure Amortissante</strong> - Semelle rembourr\u00e9e amovible pour un confort toute la journ\u00e9e</li>
  <li><strong>Inclut Bo\u00eete Originale + Semelles Suppl\u00e9mentaires</strong> - Package complet</li>
</ul>

<h3>Sp\u00e9cifications Produit</h3>
<table class="product-spec-table">
  <tr><td>Marque</td><td>The North Face</td></tr>
  <tr><td>Mod\u00e8le</td><td>Slip-On Tricot</td></tr>
  <tr><td>Couleur</td><td>Noir / Blanc</td></tr>
  <tr><td>Mati\u00e8re</td><td>Tricot Stretch + Caoutchouc</td></tr>
  <tr><td>Semelle</td><td>Plateforme Caoutchouc Chunky Blanche</td></tr>
  <tr><td>Fermeture</td><td>Slip-On (sans lacets)</td></tr>
  <tr><td>Style</td><td>D\u00e9contract\u00e9 / Lifestyle</td></tr>
  <tr><td>Tailles Disponibles</td><td>EU 41-46</td></tr>
  <tr><td>Inclus</td><td>Bo\u00eete TNF originale, semelles amortissantes, carte d'entretien</td></tr>
</table>

<p><strong>Conseil style :</strong> Associez-les avec des joggers, des jeans droits ou des shorts pour des looks quotidiens sans effort. La tige tout noir avec semelle blanche cr\u00e9e une base polyvalente qui fonctionne avec presque toutes les tenues de votre garde-robe.</p>

<p><strong>Stock limit\u00e9 - r\u00e9servez les v\u00f4tres avant qu'elles ne soient \u00e9puis\u00e9es. Livraison gratuite au Nigeria et en Afrique de l'Ouest.</strong></p>`;

const PRODUCT_REVIEWS = [
  { customerName: "Ama Boateng", rating: 5, comment: "Super comfortable slip-ons! The knit material is so soft and stretchy. Perfect for running errands or a quick coffee run. Best casual sneakers I own!", commentFr: "Slip-ons super confortables! Le tricot est si doux et \u00e9lastique. Parfaits pour les courses ou une pause caf\u00e9. Les meilleures baskets d\u00e9contract\u00e9es que j'ai!", verified: true, daysAgo: 13 },
  { customerName: "Aissatou Ndiaye", rating: 5, comment: "J'adore la simplicit\u00e9 de ces baskets North Face! Aucun lacet, tr\u00e8s pratique. Le tricot est respirant et confortable m\u00eame par temps chaud.", commentFr: "J'adore la simplicit\u00e9 de ces baskets North Face! Aucun lacet, tr\u00e8s pratique. Le tricot est respirant et confortable m\u00eame par temps chaud.", verified: true, daysAgo: 35 },
  { customerName: "Blessing Adekunle", rating: 4, comment: "Really comfortable and easy to slip on. The white sole is a nice contrast. Only small issue is that white sole can scuff easily but that's expected.", commentFr: "Vraiment confortables et faciles \u00e0 enfiler. La semelle blanche est un joli contraste. Le seul petit probl\u00e8me est que la semelle blanche peut se rayer facilement mais c'est normal.", verified: true, daysAgo: 71 },
  { customerName: "Steven Ochieng", rating: 5, comment: "Perfect for daily wear! Bought them for casual Fridays at work and they're now my go-to. Sizing is spot on. Ordered from Nairobi and delivery was fast.", commentFr: "Parfaites pour le port quotidien! Achet\u00e9es pour les vendredis casual au travail et elles sont devenues mes pr\u00e9f\u00e9r\u00e9es. Taille parfaite. Command\u00e9es de Nairobi et livraison rapide.", verified: true, daysAgo: 102 },
];

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "seed-seed-product-09-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await db.select().from(products).where(or(eq(products.slug, SLUG_EN), eq(products.slugFr, SLUG_FR)));
    for (const ex of existing) {
      await db.delete(reviews).where(eq(reviews.productId, ex.id));
    }
    await db.delete(products).where(or(eq(products.slug, SLUG_EN), eq(products.slugFr, SLUG_FR)));

    const [product] = await db.insert(products).values({
      name: "The North Face Slip-On Knit - Black/White",
      nameFr: "Basket The North Face Slip-On Tricot - Noir/Blanc",
      slug: SLUG_EN,
      slugFr: SLUG_FR,
      description: "The North Face slip-on knit sneaker in black/white. Sock-fit stretch upper, chunky white platform sole, iconic TNF branding. Effortless everyday comfort.",
      descriptionFr: "Basket slip-on tricot\u00e9e The North Face en noir/blanc. Tige stretch ajustement chaussette, semelle plateforme blanche chunky, branding TNF embl\u00e9matique.",
      shortDescription: "TNF slip-on knit sneaker with sock-fit comfort and platform sole.",
      shortDescriptionFr: "Basket slip-on tricot\u00e9e TNF avec confort chaussette et semelle plateforme.",
      longDescription: LONG_DESC_EN,
      longDescriptionFr: LONG_DESC_FR,
      price: "16.86",
      comparePrice: "20.53",
      costPrice: "16000",
      category: "casual",
      brand: "The North Face",
      stock: 25,
      imageUrl: IMAGE_URL,
      images: JSON.stringify([IMAGE_URL]),
      sizes: JSON.stringify(["41","42","43","44","45","46"]),
      colors: JSON.stringify([{ name: "Black/White", image: IMAGE_URL }]),
      material: "Stretch Knit + Rubber",
      sku: "NDZ-TNF-SLP-BW01",
      tags: JSON.stringify(["north face", "slip-on", "knit sneaker", "casual", "black", "white", "platform", "sock-fit"]),
      tagsFr: JSON.stringify(["north face", "slip-on", "basket tricot", "casual", "noir", "blanc", "plateforme", "chaussette"]),
      seoTitle: "The North Face Slip-On Knit Black/White | New Deal Zone",
      seoTitleFr: "The North Face Slip-On Tricot Noir/Blanc | New Deal Zone",
      metaDescription: "Shop The North Face slip-on knit sneaker in black/white. Sock-fit stretch upper, platform sole, lace-free comfort. Fast delivery Nigeria + West Africa.",
      metaDescriptionFr: "Achetez la basket slip-on tricot\u00e9e The North Face en noir/blanc. Tige stretch, semelle plateforme, confort sans lacets. Livraison rapide Afrique de l'Ouest.",
      focusKeyphrase: "north face slip-on knit",
      focusKeyphraseFr: "north face slip-on tricot",
      canonicalUrl: "https://www.newdealzone.com/en/product/" + SLUG_EN,
      ogImage: IMAGE_URL,
      featured: false,
      active: true,
      noIndex: false,
    }).returning();

    const reviewInserts = PRODUCT_REVIEWS.map((r) => ({
      productId: product.id,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      commentFr: r.commentFr,
      avatar: getInitials(r.customerName),
      verified: r.verified,
      createdAt: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
    }));
    await db.insert(reviews).values(reviewInserts);

    const totalRating = PRODUCT_REVIEWS.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / PRODUCT_REVIEWS.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: PRODUCT_REVIEWS.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Product + reviews seeded successfully",
      slug: SLUG_EN,
      slugFr: SLUG_FR,
      priceNgn: 23000,
      priceUsd: 16.86,
      reviews: {
        count: PRODUCT_REVIEWS.length,
        avgRating,
      },
      urls: {
        en: "https://www.newdealzone.com/en/product/" + SLUG_EN,
        fr: "https://www.newdealzone.com/fr/product/" + SLUG_FR,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}