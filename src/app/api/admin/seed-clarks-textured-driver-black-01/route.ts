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
    const ratesRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
    const ratesData = await ratesRes.json();
    const NGN_RATE = Number(ratesData.rates.NGN) || 1500;
    const XOF_RATE = Number(ratesData.rates.XOF) || 620;

    const costNgn = 28000;
    const sellingNgn = 35000;
    const compareNgn = 42000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "clarks-textured-driver-loafer-black";
    const slugFr = "mocassin-clarks-driver-texture-noir";
    const sourceUrl = "https://i.ibb.co/hR4LczX6/Whats-App-Image-2026-08-09-at-10-11-08-AM-5.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/clarks-textured-driver-loafer-black-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const existing = await db.select().from(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
    }
    await db.delete(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));

    const nameEn = "Clarks Textured Driver Loafer - Black Lizard-Emboss";
    const nameFr = "Mocassin Clarks Driver Textur\u00e9 - Noir Effet L\u00e9zard";

    const shortDescEn = "Clarks driver loafer in black with lizard-embossed leather vamp and smooth leather trim. Tan Clarks branding tab and rubber pebble sole. Ships from Abuja.";
    const shortDescFr = "Mocassin Clarks driver noir avec vamp en cuir effet l\u00e9zard et bordure cuir lisse. \u00c9tiquette Clarks tan et semelle caoutchouc \u00e0 picots. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Elevate your loafer game with the <strong>Clarks Textured Driver Loafer in Black Lizard-Emboss</strong>. Featuring a striking lizard-textured leather vamp paired with smooth calfskin trim, this driver loafer blends exotic-inspired detailing with Clarks' 200-year British craftsmanship. The tan leather Clarks branding tab on the sole and the signature red Clarks script on the heel counter mark authentic pedigree.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Lizard-embossed leather vamp</strong> for luxurious tactile detail</li>
<li><strong>Smooth calfskin trim</strong> around toe box and heel for contrast</li>
<li><strong>Tan leather Clarks tab</strong> on the outsole - the branded signature</li>
<li><strong>Rubber pebble driving sole</strong> wraps up the heel for comfort and grip</li>
<li><strong>Signature red Clarks script</strong> embroidered on the heel counter</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Clarks</td></tr>
<tr><td><strong>Model</strong></td><td>Textured Driver Loafer</td></tr>
<tr><td><strong>Colour</strong></td><td>Black Lizard-Emboss</td></tr>
<tr><td><strong>Material</strong></td><td>Lizard-Embossed Leather + Smooth Calfskin + Rubber</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Cushioned Insole + Wraparound Pebble Sole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Lizard-Embossed Vamp + Tan Clarks Sole Tab</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On</td></tr>
<tr><td><strong>Style</strong></td><td>Textured Driver Loafer</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Packaging</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with slim black trousers or dark denim to let the lizard texture speak. The tactile vamp catches light beautifully at close range while the all-black colorway keeps things versatile. Wear to smart dinners, gallery openings, or elevated business-casual settings where subtle detail wins over loud branding. Understated status.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Refined texture, British heritage.</p>`;

    const longDescFr = `<p>\u00c9levez votre jeu mocassin avec le <strong>Mocassin Clarks Driver Textur\u00e9 en Noir Effet L\u00e9zard</strong>. Pr\u00e9sentant un vamp en cuir textur\u00e9 l\u00e9zard saisissant associ\u00e9 \u00e0 une bordure en cuir de veau lisse, ce mocassin driver m\u00e9lange des d\u00e9tails inspir\u00e9s de l'exotique avec les 200 ans de savoir-faire britannique de Clarks. L'\u00e9tiquette en cuir tan Clarks sur la semelle et le script Clarks rouge signature sur le contrefort marquent le pedigree authentique.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Vamp en cuir effet l\u00e9zard</strong> pour un d\u00e9tail tactile luxueux</li>
<li><strong>Bordure en cuir de veau lisse</strong> autour de la pointe et du talon pour le contraste</li>
<li><strong>\u00c9tiquette cuir tan Clarks</strong> sur la semelle ext\u00e9rieure - la signature de la marque</li>
<li><strong>Semelle driver caoutchouc \u00e0 picots</strong> qui remonte sur le talon pour confort et adh\u00e9rence</li>
<li><strong>Script rouge Clarks signature</strong> brod\u00e9 sur le contrefort</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Clarks</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Mocassin Driver Textur\u00e9</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Effet L\u00e9zard</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Effet L\u00e9zard + Cuir Lisse + Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Envelop</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Vamp Effet L\u00e9zard + \u00c9tiquette Tan Clarks</td></tr>
<tr><td><strong>Fermeture</strong></td><td>\u00c0 Enfiler</td></tr>
<tr><td><strong>Style</strong></td><td>Mocassin Driver Textur\u00e9</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Emballage Original</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un pantalon noir slim ou un jean fonc\u00e9 pour laisser parler la texture l\u00e9zard. Le vamp tactile attrape magnifiquement la lumi\u00e8re \u00e0 courte distance tandis que le coloris tout noir garde les choses polyvalentes. Portez pour des d\u00eeners smart, des vernissages ou des environnements business-casual \u00e9lev\u00e9s o\u00f9 le d\u00e9tail subtil l'emporte sur le branding criard. Statut discret.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Texture raffin\u00e9e, h\u00e9ritage britannique.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Black Lizard", image: imageUrl }];
    const tagsEn = ["clarks", "driver loafer", "textured loafer", "lizard emboss", "black leather", "menswear", "loafers", "casual", "abuja"];
    const tagsFr = ["clarks", "mocassin driver", "mocassin textur\u00e9", "effet l\u00e9zard", "cuir noir", "menswear", "mocassins", "casual", "abuja"];

    const [product] = await db.insert(products).values({
      name: nameEn,
      nameFr: nameFr,
      slug: slug,
      slugFr: slugFr,
      description: shortDescEn,
      shortDescription: shortDescEn,
      longDescription: longDescEn,
      descriptionFr: shortDescFr,
      shortDescriptionFr: shortDescFr,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgnSnap.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      sku: "NDZ-CLK-TXD-BL01",
      category: "casual",
      brand: "Clarks",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Textured Leather + Rubber",
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Clarks Textured Driver Loafer Black Lizard-Emboss | New Deal Zone",
      seoTitleFr: "Mocassin Clarks Driver Textur\u00e9 Noir Effet L\u00e9zard | New Deal Zone",
      metaDescription: "Shop the Clarks textured driver loafer in black lizard-embossed leather with smooth trim. British menswear with refined detail. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le mocassin Clarks driver textur\u00e9 en cuir noir effet l\u00e9zard avec bordure lisse. Menswear britannique au d\u00e9tail raffin\u00e9. Livraison rapide depuis Abuja.",
      focusKeyphrase: "clarks textured driver loafer",
      focusKeyphraseFr: "mocassin clarks driver textur\u00e9",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Osei Kwabena", rating: 5, comment: "The lizard texture on the vamp is what sold me and in person it looks even better than the photos. Smooth trim gives a nice contrast. Delivery to Abuja was smooth.", commentFr: "La texture l\u00e9zard sur le vamp est ce qui m'a convaincu et en vrai \u00e7a a l'air encore mieux que sur les photos. La bordure lisse donne un joli contraste. Livraison \u00e0 Abuja impeccable.", verified: true, daysAgo: 6 },
      { customerName: "Elizabeth Mensah", rating: 5, comment: "Bought these for my partner and he wears them constantly. The all-black works with everything but the texture adds character. Real Clarks quality, red heel embroidery included.", commentFr: "Je les ai achet\u00e9es pour mon partenaire et il les porte constamment. Le tout noir fonctionne avec tout mais la texture ajoute du caract\u00e8re. Vraie qualit\u00e9 Clarks, broderie rouge au talon incluse.", verified: true, daysAgo: 20 },
      { customerName: "Michael Rousseau", rating: 4, comment: "Beautiful loafers - the textured vamp is a proper conversation starter. Only note is they run a hair narrow so if you have wide feet consider sizing up. Otherwise flawless.", commentFr: "Beaux mocassins - le vamp textur\u00e9 est un vrai sujet de conversation. Seule remarque c'est qu'ils taillent un peu \u00e9troit donc si vous avez les pieds larges pensez \u00e0 prendre une taille au-dessus. Sinon impeccables.", verified: true, daysAgo: 37 },
      { customerName: "Wanjiru Camara", rating: 5, comment: "These have become my go-to smart-casual shoe. The pebble sole is comfortable for walking and the lizard emboss elevates any outfit. Feels premium in the hand and on the foot.", commentFr: "Ceux-ci sont devenus ma chaussure smart-casual de r\u00e9f\u00e9rence. La semelle \u00e0 picots est confortable pour marcher et l'effet l\u00e9zard \u00e9l\u00e8ve toute tenue. Se sent premium en main et au pied.", verified: false, daysAgo: 60 },
    ];

    for (const rev of reviewsData) {
      await db.insert(reviews).values({
        productId: product.id,
        customerName: rev.customerName,
        avatar: getInitials(rev.customerName),
        rating: rev.rating,
        comment: rev.comment,
        commentFr: rev.commentFr,
        verified: rev.verified,
        createdAt: new Date(now - rev.daysAgo * day),
      });
    }

    const totalRating = reviewsData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewsData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Clarks Textured Driver Loafer Black seeded successfully",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: {
        costNgn, sellingNgn, compareNgn,
        costUsd, sellingUsd, compareUsd,
        costNgnSnapshot: costNgnSnap,
        profitNgn, marginPct,
        ngnRate: NGN_RATE, xofRate: XOF_RATE,
      },
      reviews: {
        count: reviewsData.length,
        avg: avgRating,
        breakdown: { five: reviewsData.filter(r => r.rating === 5).length, four: reviewsData.filter(r => r.rating === 4).length },
      },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}