import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

const IMAGE_URL = "https://i.ibb.co/mCmHYXY1/nike-af1-fendi-black-yellow.jpg";
const SLUG_EN = "nike-air-force-1-fendi-black-yellow";
const SLUG_FR = "basket-nike-air-force-1-fendi-noir-jaune";

const LONG_DESC_EN = `<p>Bold Nike Air Force 1 x Fendi collaboration featuring a striking black upper with signature yellow Swoosh overlays. This limited-edition drop fuses Nike's iconic AF1 silhouette with Fendi's luxury Italian heritage - complete with authentic Fendi branding, side-panel zipper detail, and signature pendant.</p>

<p>The premium suede upper is offset by a crisp white Air-cushioned sole and contrast white laces. Yellow accents on both Swooshes make a bold statement, while the Fendi FF logo tags on the tongue and heel confirm the collab authenticity.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Rare Nike x Fendi Collab</strong> - Limited-edition luxury streetwear crossover</li>
  <li><strong>Black + Yellow Colorway</strong> - Bold contrast that stands out from the crowd</li>
  <li><strong>Premium Suede Upper</strong> - Soft-touch material with quality stitching</li>
  <li><strong>Fendi FF Branding</strong> - Authentic tags on tongue, heel, and side panels</li>
  <li><strong>Signature Yellow Swoosh</strong> - Statement colorway on both sides</li>
  <li><strong>Includes Box + Extra Laces + Fendi Pendant</strong> - Complete collector's package</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
  <tr><td>Brand</td><td>Nike x Fendi</td></tr>
  <tr><td>Model</td><td>Air Force 1 Low</td></tr>
  <tr><td>Colour</td><td>Black / Yellow</td></tr>
  <tr><td>Material</td><td>Premium Suede + Leather</td></tr>
  <tr><td>Sole</td><td>Rubber Air Cushioned (White)</td></tr>
  <tr><td>Closure</td><td>Lace-up (white laces)</td></tr>
  <tr><td>Style</td><td>Luxury Streetwear Sneaker</td></tr>
  <tr><td>Available Sizes</td><td>EU 40-47</td></tr>
  <tr><td>Includes</td><td>Original Nike box, extra laces, Fendi pendant, care card</td></tr>
</table>

<p><strong>Styling tip:</strong> Pair these with black jeans, cargo pants, or an all-black fit to let the yellow Swoosh pop. Perfect with luxury streetwear brands like Amiri, Rhude, or Balenciaga.</p>

<p><strong>Limited stock available - grab yours before they sell out. Free shipping across Nigeria and West Africa.</strong></p>`;

const LONG_DESC_FR = `<p>Audacieuse collaboration Nike Air Force 1 x Fendi mettant en vedette une tige noire frappante avec des empi\u00e8cements Swoosh jaunes signature. Ce drop en \u00e9dition limit\u00e9e fusionne la silhouette embl\u00e9matique AF1 de Nike avec l'h\u00e9ritage italien de luxe de Fendi - complet avec le branding Fendi authentique, le d\u00e9tail de fermeture \u00e9clair sur le panneau lat\u00e9ral et le pendentif signature.</p>

<p>La tige en daim premium est mise en valeur par une semelle blanche \u00e0 amorti Air et des lacets blancs contrastants. Les accents jaunes sur les deux Swooshes font une d\u00e9claration audacieuse, tandis que les \u00e9tiquettes FF Fendi sur la languette et le talon confirment l'authenticit\u00e9 de la collab.</p>

<h2>Caract\u00e9ristiques Cl\u00e9s</h2>
<ul>
  <li><strong>Rare Collab Nike x Fendi</strong> - Crossover streetwear de luxe \u00e9dition limit\u00e9e</li>
  <li><strong>Coloris Noir + Jaune</strong> - Contraste audacieux qui se d\u00e9marque</li>
  <li><strong>Tige en Daim Premium</strong> - Mat\u00e9riau doux au toucher avec couture de qualit\u00e9</li>
  <li><strong>Branding Fendi FF</strong> - \u00c9tiquettes authentiques sur languette, talon et panneaux lat\u00e9raux</li>
  <li><strong>Swoosh Jaune Signature</strong> - Coloris statement des deux c\u00f4t\u00e9s</li>
  <li><strong>Inclut Bo\u00eete + Lacets Suppl\u00e9mentaires + Pendentif Fendi</strong> - Package collector complet</li>
</ul>

<h3>Sp\u00e9cifications Produit</h3>
<table class="product-spec-table">
  <tr><td>Marque</td><td>Nike x Fendi</td></tr>
  <tr><td>Mod\u00e8le</td><td>Air Force 1 Low</td></tr>
  <tr><td>Couleur</td><td>Noir / Jaune</td></tr>
  <tr><td>Mati\u00e8re</td><td>Daim Premium + Cuir</td></tr>
  <tr><td>Semelle</td><td>Caoutchouc avec Air Amorti (Blanc)</td></tr>
  <tr><td>Fermeture</td><td>Lacets (lacets blancs)</td></tr>
  <tr><td>Style</td><td>Basket Streetwear de Luxe</td></tr>
  <tr><td>Tailles Disponibles</td><td>EU 40-47</td></tr>
  <tr><td>Inclus</td><td>Bo\u00eete Nike originale, lacets suppl\u00e9mentaires, pendentif Fendi, carte d'entretien</td></tr>
</table>

<p><strong>Conseil style :</strong> Associez-les avec un jean noir, un pantalon cargo ou un look tout noir pour faire ressortir le Swoosh jaune. Parfait avec des marques de streetwear de luxe comme Amiri, Rhude ou Balenciaga.</p>

<p><strong>Stock limit\u00e9 - r\u00e9servez les v\u00f4tres avant qu'elles ne soient \u00e9puis\u00e9es. Livraison gratuite au Nigeria et en Afrique de l'Ouest.</strong></p>`;

const PRODUCT_REVIEWS = [
  { customerName: "Ibrahim Sanogo", rating: 5, comment: "The Nike x Fendi collab is fire! Black suede feels premium and the yellow Swoosh gives it that luxury edge. Comfortable from day one.", commentFr: "La collab Nike x Fendi est incroyable! Le daim noir est de qualit\u00e9 premium et le Swoosh jaune lui donne cet effet luxe. Confortables d\u00e8s le premier jour.", verified: true, daysAgo: 11 },
  { customerName: "Camille Rousseau", rating: 5, comment: "J'adore! Le contraste noir et jaune est parfait et le pendentif Fendi est un joli d\u00e9tail. Livraison rapide, emballage soign\u00e9. Je recommande vivement!", commentFr: "J'adore! Le contraste noir et jaune est parfait et le pendentif Fendi est un joli d\u00e9tail. Livraison rapide, emballage soign\u00e9. Je recommande vivement!", verified: true, daysAgo: 32 },
  { customerName: "David Osei", rating: 4, comment: "Great quality sneakers with legit Fendi tags. Fits true to size. Only wish the suede was a bit easier to clean but that's expected with dark suede.", commentFr: "Baskets de bonne qualit\u00e9 avec de vraies \u00e9tiquettes Fendi. Taille juste. J'aurais juste aim\u00e9 que le daim soit plus facile \u00e0 nettoyer mais c'est normal avec du daim fonc\u00e9.", verified: true, daysAgo: 67 },
  { customerName: "Ngozi Okwuosa", rating: 5, comment: "Absolutely stunning collab! The yellow accents pop against the black suede. Getting compliments everywhere I go. Best AF1 in my collection!", commentFr: "Collab absolument magnifique! Les accents jaunes ressortent sur le daim noir. Je re\u00e7ois des compliments partout o\u00f9 je vais. La meilleure AF1 de ma collection!", verified: true, daysAgo: 98 },
];

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "seed-seed-product-07-2026") {
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
      name: "Nike Air Force 1 x Fendi - Black/Yellow",
      nameFr: "Basket Nike Air Force 1 x Fendi - Noir/Jaune",
      slug: SLUG_EN,
      slugFr: SLUG_FR,
      description: "Rare Nike x Fendi Air Force 1 collab in black suede with signature yellow Swoosh, Fendi FF branding, and included pendant. Premium luxury streetwear.",
      descriptionFr: "Rare collab Nike x Fendi Air Force 1 en daim noir avec Swoosh jaune signature, branding Fendi FF et pendentif inclus. Streetwear de luxe premium.",
      shortDescription: "Limited Nike x Fendi AF1 in black suede with yellow Swoosh.",
      shortDescriptionFr: "Nike x Fendi AF1 en \u00e9dition limit\u00e9e, daim noir avec Swoosh jaune.",
      longDescription: LONG_DESC_EN,
      longDescriptionFr: LONG_DESC_FR,
      price: "18.33",
      comparePrice: "22.73",
      costPrice: "18000",
      category: "sneakers",
      brand: "Nike x Fendi",
      stock: 25,
      imageUrl: IMAGE_URL,
      images: JSON.stringify([IMAGE_URL]),
      sizes: JSON.stringify(["40","41","42","43","44","45","46","47"]),
      colors: JSON.stringify([{ name: "Black/Yellow", image: IMAGE_URL }]),
      material: "Premium Suede + Leather",
      sku: "NDZ-NKE-AFF-BY01",
      tags: JSON.stringify(["nike", "fendi", "air force 1", "sneakers", "collab", "luxury streetwear", "black", "yellow"]),
      tagsFr: JSON.stringify(["nike", "fendi", "air force 1", "baskets", "collab", "streetwear de luxe", "noir", "jaune"]),
      seoTitle: "Nike Air Force 1 x Fendi Black/Yellow - Rare Collab | New Deal Zone",
      seoTitleFr: "Nike Air Force 1 x Fendi Noir/Jaune - Collab Rare | New Deal Zone",
      metaDescription: "Shop the rare Nike x Fendi Air Force 1 in black suede with yellow Swoosh. Premium leather, FF branding. Fast delivery Nigeria + West Africa. Limited stock.",
      metaDescriptionFr: "Achetez la rare Nike x Fendi Air Force 1 en daim noir avec Swoosh jaune. Cuir premium, branding FF. Livraison rapide Nigeria + Afrique de l'Ouest.",
      focusKeyphrase: "nike air force 1 fendi",
      focusKeyphraseFr: "nike air force 1 fendi",
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
      priceNgn: 25000,
      priceUsd: 18.33,
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