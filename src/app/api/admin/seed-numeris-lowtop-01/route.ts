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
    let XOF = 568, NGN = 1364;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const d = await r.json();
      if (d.rates) { XOF = d.rates.XOF || XOF; NGN = d.rates.NGN || NGN; }
    } catch {}

    const costFcfa = 15000, sellingFcfa = 22000, compareFcfa = 30000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "numeris-low-top-sneaker-white-blue-pattern";
    const slugFr = "basket-numeris-low-top-blanc-motif-bleu";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/gbNLb1TT/Whats-App-Image-2026-08-08-at-7-06-26-PM-3.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/numeris-low-top-sneaker-white-blue-pattern-luxury-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "White/Blue Pattern", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["numeris","luxury","low-top","designer-inspired","white-sneakers","patterned","chunky-sole","boutique","premium"]);
    const tagsFr = JSON.stringify(["numeris","luxe","low-top","inspiration-designer","baskets-blanches","motif","semelle-chunky","boutique","premium"]);

    const longDescEn = `<p>Discover the Numeris Low-Top Sneaker in an elegant White with signature blue-grey pattern - a boutique-crafted alternative to designer luxury sneakers at a fraction of the price. Featuring premium leather panels, a signature patterned overlay, and a chunky serrated white cupsole for maximum street presence.</p>
<ul>
<li>Premium white leather with patterned overlay panels</li>
<li>Subtle blue-grey monogram-style print</li>
<li>Numeris branded tongue label</li>
<li>Oversized flat cotton laces for luxe aesthetic</li>
<li>Chunky serrated cupsole with ribbed detailing</li>
<li>Padded collar and tongue for supreme comfort</li>
<li>Ships with Numeris branded packaging</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Numeris</td></tr>
<tr><th>Model</th><td>Low-Top Signature Sneaker</td></tr>
<tr><th>Colour</th><td>White / Blue-Grey Pattern</td></tr>
<tr><th>Material</th><td>Premium leather + patterned canvas panels</td></tr>
<tr><th>Sole</th><td>Chunky serrated white cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up with oversized flat laces</td></tr>
<tr><th>Style</th><td>Boutique luxury / Designer-inspired</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Numeris branded box</td></tr>
</table>
<p>The Numeris Low-Top delivers designer luxury aesthetics without the four-figure price tag. Perfect for the fashion-forward customer who wants premium quality and unique styling. Pair with tailored trousers and a fitted knit for elevated smart-casual looks, or with distressed denim and a cropped tee for luxury streetwear vibes. The patterned overlay creates depth and interest that plain white sneakers can't match.</p>
<p><strong>Boutique quality at accessible prices. Fast delivery from Lom\u00e9, Togo.</strong></p>`;

    const longDescFr = `<p>D\u00e9couvrez la Basket Numeris Low-Top en Blanc \u00e9l\u00e9gant avec motif bleu-gris signature - une alternative confectionn\u00e9e en boutique aux baskets de luxe designer \u00e0 une fraction du prix. Dot\u00e9e de panneaux en cuir premium, d'une superposition \u00e0 motif signature, et d'une semelle blanche chunky dentel\u00e9e pour une pr\u00e9sence street maximale.</p>
<ul>
<li>Cuir blanc premium avec panneaux de superposition \u00e0 motif</li>
<li>Imprim\u00e9 subtil style monogramme bleu-gris</li>
<li>\u00c9tiquette Numeris sur la langue</li>
<li>Lacets plats surdimensionn\u00e9s en coton pour esth\u00e9tique luxe</li>
<li>Cupsole chunky dentel\u00e9e avec d\u00e9tails nervur\u00e9s</li>
<li>Col et langue rembourr\u00e9s pour un confort supr\u00eame</li>
<li>Livr\u00e9e avec emballage Numeris</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Numeris</td></tr>
<tr><th>Mod\u00e8le</th><td>Basket Low-Top Signature</td></tr>
<tr><th>Couleur</th><td>Blanc / Motif Bleu-Gris</td></tr>
<tr><th>Mati\u00e8re</th><td>Cuir premium + panneaux toile \u00e0 motif</td></tr>
<tr><th>Semelle</th><td>Cupsole blanche chunky dentel\u00e9e</td></tr>
<tr><th>Fermeture</th><td>Lacets plats surdimensionn\u00e9s</td></tr>
<tr><th>Style</th><td>Luxe boutique / Inspiration designer</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Numeris</td></tr>
</table>
<p>La Numeris Low-Top offre l'esth\u00e9tique de luxe designer sans l'\u00e9tiquette de prix \u00e0 quatre chiffres. Parfaite pour le client avant-gardiste en mode qui recherche une qualit\u00e9 premium et un style unique. Portez-la avec un pantalon ajust\u00e9 et un pull ajust\u00e9 pour des looks smart-casual \u00e9lev\u00e9s, ou avec un jean d\u00e9chir\u00e9 et un tee-shirt court pour des vibes streetwear luxe. La superposition \u00e0 motif cr\u00e9e une profondeur et un int\u00e9r\u00eat que les baskets blanches unies ne peuvent \u00e9galer.</p>
<p><strong>Qualit\u00e9 boutique \u00e0 prix accessibles. Livraison rapide depuis Lom\u00e9, Togo.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Numeris Low-Top Sneaker - White/Blue Pattern",
      nameFr: "Basket Numeris Low-Top - Blanc/Motif Bleu",
      slug: slugEn,
      slugFr: slugFr,
      description: "Boutique-crafted Numeris Low-Top in premium white leather with signature blue-grey pattern. Chunky serrated sole for luxury streetwear presence.",
      descriptionFr: "Basket Numeris Low-Top confectionn\u00e9e en boutique en cuir blanc premium avec motif bleu-gris signature. Semelle chunky dentel\u00e9e pour une pr\u00e9sence streetwear luxe.",
      shortDescription: "Numeris Low-Top designer-inspired sneaker in white with blue pattern. Premium leather, chunky sole. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Basket Numeris Low-Top inspir\u00e9e designer en blanc avec motif bleu. Cuir premium, semelle chunky. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "sneakers",
      brand: "Numeris",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 20,
      featured: false,
      active: true,
      material: "Premium leather + patterned canvas panels",
      sku: "NDZ-NUM-LTS-WB01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Numeris Low-Top Sneaker White Blue Pattern Luxury | New Deal Zone",
      seoTitleFr: "Basket Numeris Low-Top Blanc Motif Bleu Luxe | New Deal Zone",
      metaDescription: "Shop Numeris Low-Top Sneaker in premium white leather with signature blue pattern. Boutique designer-inspired quality. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Basket Numeris Low-Top en cuir blanc premium avec motif bleu signature. Qualit\u00e9 boutique inspiration designer. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "numeris low-top sneaker",
      focusKeyphraseFr: "basket numeris low-top",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "James Mensah",     daysAgo: 5,   rating: 5, en: "Absolutely stunning quality for the price! The leather is buttery, patterned overlay is well-executed, chunky sole gives amazing presence. Look like they cost 5x what I paid.", fr: "Qualit\u00e9 absolument magnifique pour le prix ! Le cuir est doux, la superposition \u00e0 motif est bien ex\u00e9cut\u00e9e, la semelle chunky donne une pr\u00e9sence incroyable. Elles ont l'air 5x plus ch\u00e8res.", verified: true },
      { name: "Adaora Nwosu",     daysAgo: 20,  rating: 5, en: "Been eyeing designer sneakers but couldn't justify the cost. These Numeris give me the same luxury vibe without the crazy price. Boxed beautifully, quality is next level.", fr: "Je lorgnais sur les baskets designer mais ne pouvais justifier le co\u00fbt. Ces Numeris me donnent le m\u00eame vibe luxe sans le prix fou. Emballage magnifique, qualit\u00e9 de niveau sup\u00e9rieur.", verified: true },
      { name: "Steven Njoroge",   daysAgo: 42,  rating: 5, en: "These are HEAT. The pattern catches light in different ways and the chunky sole is chef's kiss. Comfortable enough for all-day wear. Best sneaker purchase this year.", fr: "Ces baskets sont FEU. Le motif capte la lumi\u00e8re de diff\u00e9rentes fa\u00e7ons et la semelle chunky est parfaite. Assez confortables pour un port toute la journ\u00e9e. Meilleur achat de basket de l'ann\u00e9e.", verified: true },
      { name: "Marie Lefebvre",   daysAgo: 75,  rating: 4, en: "Beautiful sneakers with real designer feel. Only note is they run slightly large - consider a half size down for a snug fit. Otherwise, phenomenal.", fr: "Belles baskets avec un vrai feeling designer. Seule remarque, elles taillent l\u00e9g\u00e8rement grand - envisagez une demi-taille en dessous pour un ajustement serr\u00e9. Sinon, ph\u00e9nom\u00e9nal.", verified: false },
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

    const totalRating = reviewData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Numeris Low-Top Sneaker seeded successfully",
      product: { id: product.id, slug: slugEn, slugFr: slugFr, imageUrl, blobUsed },
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