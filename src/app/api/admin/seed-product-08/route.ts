import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

const IMAGE_URL = "https://i.ibb.co/XxSf3JTG/new-balance-9060-chunky-black.jpg";
const SLUG_EN = "new-balance-9060-chunky-black";
const SLUG_FR = "basket-new-balance-9060-chunky-noir";

const LONG_DESC_EN = `<p>The New Balance 9060 in triple black - a chunky lifestyle sneaker that fuses Y2K nostalgia with modern streetwear aesthetics. The all-black colorway is a stealth statement piece that pairs with everything in your wardrobe.</p>

<p>Built on the iconic 990 DNA, the 9060 features an exaggerated ABZORB midsole, wavy paneling, and a signature ballistic mesh upper. The oversized N logo and premium detailing make this a must-have for sneakerheads who appreciate quality construction and standout design.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Triple Black Colorway</strong> - Stealth aesthetic that goes with any outfit</li>
  <li><strong>Chunky Y2K Silhouette</strong> - Bold retro-futuristic design</li>
  <li><strong>ABZORB Midsole</strong> - Superior shock absorption for all-day comfort</li>
  <li><strong>Ballistic Mesh Upper</strong> - Breathable and durable premium construction</li>
  <li><strong>Oversized N Logo</strong> - Iconic branding with premium leather trim</li>
  <li><strong>Includes Box + Extra Laces + Insoles</strong> - Complete package</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
  <tr><td>Brand</td><td>New Balance</td></tr>
  <tr><td>Model</td><td>9060</td></tr>
  <tr><td>Colour</td><td>Triple Black</td></tr>
  <tr><td>Material</td><td>Ballistic Mesh + Suede + Leather</td></tr>
  <tr><td>Sole</td><td>ABZORB Chunky Rubber</td></tr>
  <tr><td>Closure</td><td>Lace-up</td></tr>
  <tr><td>Style</td><td>Chunky Lifestyle Sneaker</td></tr>
  <tr><td>Available Sizes</td><td>EU 40-46</td></tr>
  <tr><td>Includes</td><td>Original NB box, extra laces, cushioned insoles</td></tr>
</table>

<p><strong>Styling tip:</strong> These chunky New Balances pair perfectly with baggy jeans, cargo pants, or tailored trousers for that elevated streetwear look. The all-black finish makes them versatile enough for both casual and semi-formal fits.</p>

<p><strong>Limited stock available - grab yours before they sell out. Free shipping across Nigeria and West Africa.</strong></p>`;

const LONG_DESC_FR = `<p>La New Balance 9060 en triple noir - une basket lifestyle chunky qui fusionne la nostalgie Y2K avec l'esth\u00e9tique streetwear moderne. Le coloris tout noir est une pi\u00e8ce statement discr\u00e8te qui s'accorde avec tout dans votre garde-robe.</p>

<p>Construite sur l'ADN embl\u00e9matique de la 990, la 9060 pr\u00e9sente une semelle interm\u00e9diaire ABZORB exag\u00e9r\u00e9e, un panneautage ondul\u00e9 et une tige signature en mesh ballistique. Le logo N surdimensionn\u00e9 et les d\u00e9tails premium en font un incontournable pour les sneakerheads qui appr\u00e9cient la qualit\u00e9 de construction et le design remarquable.</p>

<h2>Caract\u00e9ristiques Cl\u00e9s</h2>
<ul>
  <li><strong>Coloris Triple Noir</strong> - Esth\u00e9tique furtive qui s'accorde avec toute tenue</li>
  <li><strong>Silhouette Chunky Y2K</strong> - Design r\u00e9tro-futuriste audacieux</li>
  <li><strong>Semelle Interm\u00e9diaire ABZORB</strong> - Absorption des chocs sup\u00e9rieure pour un confort toute la journ\u00e9e</li>
  <li><strong>Tige en Mesh Ballistique</strong> - Construction premium respirante et durable</li>
  <li><strong>Logo N Surdimensionn\u00e9</strong> - Branding embl\u00e9matique avec bordure en cuir premium</li>
  <li><strong>Inclut Bo\u00eete + Lacets Suppl\u00e9mentaires + Semelles</strong> - Package complet</li>
</ul>

<h3>Sp\u00e9cifications Produit</h3>
<table class="product-spec-table">
  <tr><td>Marque</td><td>New Balance</td></tr>
  <tr><td>Mod\u00e8le</td><td>9060</td></tr>
  <tr><td>Couleur</td><td>Triple Noir</td></tr>
  <tr><td>Mati\u00e8re</td><td>Mesh Ballistique + Daim + Cuir</td></tr>
  <tr><td>Semelle</td><td>Caoutchouc Chunky ABZORB</td></tr>
  <tr><td>Fermeture</td><td>Lacets</td></tr>
  <tr><td>Style</td><td>Basket Lifestyle Chunky</td></tr>
  <tr><td>Tailles Disponibles</td><td>EU 40-46</td></tr>
  <tr><td>Inclus</td><td>Bo\u00eete NB originale, lacets suppl\u00e9mentaires, semelles amortissantes</td></tr>
</table>

<p><strong>Conseil style :</strong> Ces New Balance chunky se marient parfaitement avec des jeans baggy, des pantalons cargo ou des pantalons tailor\u00e9s pour ce look streetwear \u00e9lev\u00e9. La finition tout noir les rend polyvalentes pour des tenues d\u00e9contract\u00e9es et semi-formelles.</p>

<p><strong>Stock limit\u00e9 - r\u00e9servez les v\u00f4tres avant qu'elles ne soient \u00e9puis\u00e9es. Livraison gratuite au Nigeria et en Afrique de l'Ouest.</strong></p>`;

const PRODUCT_REVIEWS = [
  { customerName: "Kofi Asante", rating: 5, comment: "The New Balance 9060 in all black is fire! The chunky silhouette is exactly the Y2K vibe I was going for. ABZORB midsole is incredibly comfortable.", commentFr: "La New Balance 9060 tout noir est incroyable! La silhouette chunky est exactement le vibe Y2K que je cherchais. La semelle ABZORB est incroyablement confortable.", verified: true, daysAgo: 7 },
  { customerName: "Isabelle Petit", rating: 5, comment: "J'adore ces baskets! Le noir triple est parfait, elles vont avec tout. La qualit\u00e9 New Balance est au rendez-vous, tr\u00e8s confortables d\u00e8s le premier port.", commentFr: "J'adore ces baskets! Le noir triple est parfait, elles vont avec tout. La qualit\u00e9 New Balance est au rendez-vous, tr\u00e8s confortables d\u00e8s le premier port.", verified: true, daysAgo: 26 },
  { customerName: "Jordan Baptiste", rating: 4, comment: "Solid pair of chunky sneakers. Runs slightly big so I would recommend going half a size down. The ballistic mesh feels premium and the N logo pops.", commentFr: "Belle paire de baskets chunky. Taille l\u00e9g\u00e8rement grand, je recommande de prendre une demi-taille en dessous. Le mesh ballistique est premium et le logo N est visible.", verified: true, daysAgo: 54 },
  { customerName: "Adaora Chukwu", rating: 5, comment: "Absolutely love the stealth all-black look. Perfect for pairing with baggy jeans. Delivery to Enugu was fast and the packaging was on point.", commentFr: "J'adore absolument le look tout noir furtif. Parfait pour porter avec des jeans baggy. La livraison \u00e0 Enugu \u00e9tait rapide et l'emballage \u00e9tait au top.", verified: true, daysAgo: 88 },
  { customerName: "Yusuf Musa", rating: 5, comment: "Been wanting the 9060 for months! These are the real deal - authentic branding, quality stitching, and the chunky sole gives just the right amount of height.", commentFr: "Je voulais la 9060 depuis des mois! Ce sont les vraies - branding authentique, couture de qualit\u00e9, et la semelle chunky donne juste la bonne hauteur.", verified: true, daysAgo: 115 },
];

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "seed-seed-product-08-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Idempotent: delete existing product + its reviews
    const existing = await db.select().from(products).where(or(eq(products.slug, SLUG_EN), eq(products.slugFr, SLUG_FR)));
    for (const ex of existing) {
      await db.delete(reviews).where(eq(reviews.productId, ex.id));
    }
    await db.delete(products).where(or(eq(products.slug, SLUG_EN), eq(products.slugFr, SLUG_FR)));

    // Insert product
    const [product] = await db.insert(products).values({
      name: "New Balance 9060 Chunky - Triple Black",
      nameFr: "Basket New Balance 9060 Chunky - Noir Triple",
      slug: SLUG_EN,
      slugFr: SLUG_FR,
      description: "New Balance 9060 in triple black - chunky Y2K lifestyle sneaker with ABZORB midsole, ballistic mesh, and premium construction. Stealth aesthetic.",
      descriptionFr: "New Balance 9060 en noir triple - basket lifestyle chunky Y2K avec semelle ABZORB, mesh ballistique et construction premium. Esth\u00e9tique furtive.",
      shortDescription: "Chunky New Balance 9060 in stealth triple black with ABZORB comfort.",
      shortDescriptionFr: "New Balance 9060 chunky en noir triple furtif avec confort ABZORB.",
      longDescription: LONG_DESC_EN,
      longDescriptionFr: LONG_DESC_FR,
      price: "21.99",
      comparePrice: "24.93",
      costPrice: "23000",
      category: "sneakers",
      brand: "New Balance",
      stock: 25,
      imageUrl: IMAGE_URL,
      images: JSON.stringify([IMAGE_URL]),
      sizes: JSON.stringify(["40","41","42","43","44","45","46"]),
      colors: JSON.stringify([{ name: "Triple Black", image: IMAGE_URL }]),
      material: "Ballistic Mesh + Suede + Leather",
      sku: "NDZ-NBL-906-BK01",
      tags: JSON.stringify(["new balance", "9060", "chunky sneaker", "triple black", "y2k", "lifestyle", "abzorb"]),
      tagsFr: JSON.stringify(["new balance", "9060", "basket chunky", "noir triple", "y2k", "lifestyle", "abzorb"]),
      seoTitle: "New Balance 9060 Chunky Triple Black - Y2K Sneaker | New Deal Zone",
      seoTitleFr: "New Balance 9060 Chunky Noir Triple - Basket Y2K | New Deal Zone",
      metaDescription: "Shop the New Balance 9060 in triple black. Chunky Y2K silhouette, ABZORB midsole, ballistic mesh. Free delivery Nigeria + West Africa. Limited stock.",
      metaDescriptionFr: "Achetez la New Balance 9060 en noir triple. Silhouette chunky Y2K, semelle ABZORB, mesh ballistique. Livraison gratuite Nigeria + Afrique de l'Ouest.",
      focusKeyphrase: "new balance 9060 black",
      focusKeyphraseFr: "new balance 9060 noir",
      canonicalUrl: "https://www.newdealzone.com/en/product/" + SLUG_EN,
      ogImage: IMAGE_URL,
      featured: false,
      active: true,
      noIndex: false,
    }).returning();

    // Insert reviews
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

    // Update product rating + reviewCount
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
      priceNgn: 30000,
      priceUsd: 21.99,
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