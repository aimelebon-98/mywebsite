import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

const IMAGE_URL = "https://i.ibb.co/twJpqtyq/nike-af1-kaws-white-grey.jpg";
const SLUG_EN = "nike-air-force-1-kaws-white-grey";
const SLUG_FR = "basket-nike-air-force-1-kaws-blanc-gris";

const LONG_DESC_EN = `<p>Rare Nike Air Force 1 x KAWS collaboration in a fresh white and grey colorway. This limited drop combines the timeless AF1 silhouette with KAWS' signature XX branding and Mickey Mouse-inspired graphics on the toe box.</p>

<p>The premium leather upper features contrasting grey overlays on the mid-panel, heel counter, and toe cap, while the iconic Swoosh is subtly outlined in the same tone. Grey rope-style laces and a translucent grey Air sole complete the streetwear-ready look.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Rare KAWS Collab</strong> - Limited-edition Nike x KAWS collaboration with authentic branding</li>
  <li><strong>White + Grey Colorway</strong> - Versatile two-tone that pairs with everything</li>
  <li><strong>Premium Leather Upper</strong> - Full-grain leather with contrast overlays</li>
  <li><strong>Signature XX Detail</strong> - KAWS logo embroidered on side panel</li>
  <li><strong>Full Nike Air Cushioning</strong> - All-day comfort you can feel</li>
  <li><strong>Includes Box + Extra Laces + KAWS Keyring</strong> - Complete collector's package</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
  <tr><td>Brand</td><td>Nike x KAWS</td></tr>
  <tr><td>Model</td><td>Air Force 1 Low</td></tr>
  <tr><td>Colour</td><td>White / Grey</td></tr>
  <tr><td>Material</td><td>Premium Leather + Suede</td></tr>
  <tr><td>Sole</td><td>Rubber Air Cushioned</td></tr>
  <tr><td>Closure</td><td>Lace-up (rope laces)</td></tr>
  <tr><td>Style</td><td>Streetwear / Lifestyle Sneaker</td></tr>
  <tr><td>Available Sizes</td><td>EU 40-47</td></tr>
  <tr><td>Includes</td><td>Original Nike box, extra laces, KAWS keyring, insoles</td></tr>
</table>

<p><strong>Styling tip:</strong> These pop with dark denim, cargo pants, or streetwear tracksuits. The grey accents match everything from oversized hoodies to tailored joggers.</p>

<p><strong>Limited stock available - grab yours before they sell out. Free shipping across Nigeria and West Africa.</strong></p>`;

const LONG_DESC_FR = `<p>Rare collaboration Nike Air Force 1 x KAWS dans un coloris blanc et gris frais. Ce drop limit\u00e9 combine la silhouette intemporelle de la AF1 avec le branding XX signature de KAWS et des graphiques inspir\u00e9s de Mickey Mouse sur le toe box.</p>

<p>La tige en cuir premium pr\u00e9sente des empi\u00e8cements gris contrastants sur le panneau central, le contrefort du talon et l'embout, tandis que le Swoosh embl\u00e9matique est subtilement soulign\u00e9 dans le m\u00eame ton. Des lacets en corde gris et une semelle Air gris translucide compl\u00e8tent le look pr\u00eat pour le streetwear.</p>

<h2>Caract\u00e9ristiques Cl\u00e9s</h2>
<ul>
  <li><strong>Collab KAWS Rare</strong> - Collaboration Nike x KAWS \u00e9dition limit\u00e9e avec branding authentique</li>
  <li><strong>Coloris Blanc + Gris</strong> - Deux tons polyvalents qui s'accordent avec tout</li>
  <li><strong>Tige en Cuir Premium</strong> - Cuir pleine fleur avec empi\u00e8cements contrastants</li>
  <li><strong>D\u00e9tail XX Signature</strong> - Logo KAWS brod\u00e9 sur le panneau lat\u00e9ral</li>
  <li><strong>Amorti Nike Air Complet</strong> - Confort toute la journ\u00e9e</li>
  <li><strong>Inclut Bo\u00eete + Lacets Suppl\u00e9mentaires + Porte-cl\u00e9s KAWS</strong> - Package collector complet</li>
</ul>

<h3>Sp\u00e9cifications Produit</h3>
<table class="product-spec-table">
  <tr><td>Marque</td><td>Nike x KAWS</td></tr>
  <tr><td>Mod\u00e8le</td><td>Air Force 1 Low</td></tr>
  <tr><td>Couleur</td><td>Blanc / Gris</td></tr>
  <tr><td>Mati\u00e8re</td><td>Cuir Premium + Daim</td></tr>
  <tr><td>Semelle</td><td>Caoutchouc avec Air Amorti</td></tr>
  <tr><td>Fermeture</td><td>Lacets (lacets en corde)</td></tr>
  <tr><td>Style</td><td>Streetwear / Basket Lifestyle</td></tr>
  <tr><td>Tailles Disponibles</td><td>EU 40-47</td></tr>
  <tr><td>Inclus</td><td>Bo\u00eete Nike originale, lacets suppl\u00e9mentaires, porte-cl\u00e9s KAWS, semelles</td></tr>
</table>

<p><strong>Conseil style :</strong> Ces baskets se marient parfaitement avec du denim fonc\u00e9, des pantalons cargo ou des ensembles de streetwear. Les accents gris s'accordent avec tout, des hoodies oversize aux joggers tailor\u00e9s.</p>

<p><strong>Stock limit\u00e9 - r\u00e9servez les v\u00f4tres avant qu'elles ne soient \u00e9puis\u00e9es. Livraison gratuite au Nigeria et en Afrique de l'Ouest.</strong></p>`;

const PRODUCT_REVIEWS = [
  { customerName: "Kwabena Mensah", rating: 5, comment: "Copped these the moment they dropped! The KAWS x Nike collab is legit and the white/grey combo is cleaner in person than in pics. Fits true to size, super comfy.", commentFr: "Achet\u00e9es d\u00e8s leur sortie! La collab KAWS x Nike est authentique et le combo blanc/gris est encore plus propre en vrai qu'en photo. Taille juste, super confortables.", verified: true, daysAgo: 9 },
  { customerName: "Aminata Toure", rating: 5, comment: "The XX branding and Mickey graphics are perfectly detailed. Package came with the extra laces and KAWS keyring as promised. Definitely worth it!", commentFr: "Le branding XX et les graphiques Mickey sont parfaitement d\u00e9taill\u00e9s. Le colis est arriv\u00e9 avec les lacets suppl\u00e9mentaires et le porte-cl\u00e9s KAWS comme promis. Vraiment vaut le coup!", verified: true, daysAgo: 28 },
  { customerName: "Marcus Blake", rating: 4, comment: "Beautiful sneakers, great quality leather. Delivery to Port Harcourt took about a week which was slightly longer than expected but worth the wait.", commentFr: "Belles baskets, cuir de tr\u00e8s bonne qualit\u00e9. La livraison \u00e0 Port Harcourt a pris environ une semaine, un peu plus long que pr\u00e9vu mais \u00e7a valait l'attente.", verified: true, daysAgo: 52 },
  { customerName: "Wanjiru Njoroge", rating: 5, comment: "These are incredible! The rope laces add such a cool detail and the Air cushioning is comfortable for all-day wear. Getting so many compliments!", commentFr: "Elles sont incroyables! Les lacets en corde ajoutent un d\u00e9tail cool et l'amorti Air est confortable toute la journ\u00e9e. Je re\u00e7ois plein de compliments!", verified: true, daysAgo: 89 },
];

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "seed-seed-product-06-2026") {
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
      name: "Nike Air Force 1 x KAWS - White/Grey",
      nameFr: "Basket Nike Air Force 1 x KAWS - Blanc/Gris",
      slug: SLUG_EN,
      slugFr: SLUG_FR,
      description: "Rare Nike x KAWS Air Force 1 collab in white/grey with signature XX branding, Mickey graphics, and grey rope laces. Premium leather upper.",
      descriptionFr: "Rare collab Nike x KAWS Air Force 1 en blanc/gris avec branding XX signature, graphiques Mickey et lacets en corde gris. Tige en cuir premium.",
      shortDescription: "Limited Nike x KAWS AF1 collab in premium white/grey leather.",
      shortDescriptionFr: "Collab Nike x KAWS AF1 en \u00e9dition limit\u00e9e, cuir premium blanc/gris.",
      longDescription: LONG_DESC_EN,
      longDescriptionFr: LONG_DESC_FR,
      price: "18.33",
      comparePrice: "21.99",
      costPrice: "18000",
      category: "sneakers",
      brand: "Nike x KAWS",
      stock: 25,
      imageUrl: IMAGE_URL,
      images: JSON.stringify([IMAGE_URL]),
      sizes: JSON.stringify(["40","41","42","43","44","45","46","47"]),
      colors: JSON.stringify([{ name: "White/Grey", image: IMAGE_URL }]),
      material: "Premium Leather + Suede",
      sku: "NDZ-NKE-AFK-WG01",
      tags: JSON.stringify(["nike", "kaws", "air force 1", "sneakers", "collab", "streetwear", "white", "grey"]),
      tagsFr: JSON.stringify(["nike", "kaws", "air force 1", "baskets", "collab", "streetwear", "blanc", "gris"]),
      seoTitle: "Nike Air Force 1 x KAWS White/Grey - Rare Collab | New Deal Zone",
      seoTitleFr: "Nike Air Force 1 x KAWS Blanc/Gris - Collab Rare | New Deal Zone",
      metaDescription: "Shop the rare Nike x KAWS Air Force 1 in white/grey. Premium leather, XX branding, rope laces. Fast delivery Nigeria + West Africa. Limited stock.",
      metaDescriptionFr: "Achetez la rare Nike x KAWS Air Force 1 en blanc/gris. Cuir premium, branding XX, lacets corde. Livraison rapide Nigeria + Afrique de l'Ouest.",
      focusKeyphrase: "nike air force 1 kaws",
      focusKeyphraseFr: "nike air force 1 kaws",
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