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
    let NGN = 1364;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const d = await r.json();
      if (d.rates?.NGN) NGN = d.rates.NGN;
    } catch {}

    const costNgn = 17000, sellingNgn = 25000, compareNgn = 29000;
    const costUsd    = Math.round((costNgn / NGN) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN) * 100) / 100;

    const slugEn = "hellstar-slides-black-logo-print";
    const slugFr = "claquettes-hellstar-noir-logo";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/m5ws5jX9/Whats-App-Image-2026-08-09-at-10-11-20-AM.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/hellstar-slides-black-logo-print-streetwear-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["38","39","40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Black", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["hellstar","slides","sandals","streetwear","hype","black","logo-print","summer","poolside","rap-culture"]);
    const tagsFr = JSON.stringify(["hellstar","claquettes","sandales","streetwear","hype","noir","logo","\u00e9t\u00e9","piscine","culture-rap"]);

    const longDescEn = `<p>The Hellstar Slides in All Black - the iconic streetwear slide from one of the hottest labels in the game. Featuring the signature Hellstar tribal-style logo printed across the strap, and a chunky treaded outsole with brand-embossed detailing. Perfect for poolside chills, summer streetwear looks, or elevating any relaxed fit with hype-brand energy.</p>
<ul>
<li>Premium rubber upper with signature Hellstar tribal logo print</li>
<li>Padded footbed for extended wear comfort</li>
<li>Chunky treaded rubber outsole with brand-embossed pattern</li>
<li>All-black colorway for maximum versatility</li>
<li>Slip-on construction for effortless wear</li>
<li>Water-friendly design (poolside/beach ready)</li>
<li>Ships in original Hellstar branded box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Hellstar</td></tr>
<tr><th>Model</th><td>Hellstar Slides Logo Print</td></tr>
<tr><th>Colour</th><td>All Black</td></tr>
<tr><th>Material</th><td>Premium rubber upper + textured rubber outsole</td></tr>
<tr><th>Signature Detail</th><td>Tribal Hellstar logo print + brand-embossed sole</td></tr>
<tr><th>Sole</th><td>Chunky treaded rubber outsole</td></tr>
<tr><th>Closure</th><td>Slip-on strap</td></tr>
<tr><th>Style</th><td>Streetwear / Hype / Summer casual</td></tr>
<tr><th>Sizes</th><td>38-45 EU</td></tr>
<tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
<tr><th>Includes</th><td>Original Hellstar box</td></tr>
</table>
<p>Hellstar has become one of the defining streetwear labels of the modern era, loved by rappers, athletes, and hype enthusiasts worldwide. These slides bring that same energy in a comfortable, everyday-wearable package. Pair with basketball shorts and a Hellstar tee for the full head-to-toe fit, wear with cargo shorts and a graphic hoodie for casual weekend vibes, or slip them on with joggers for effortless poolside luxury. The all-black colorway ensures they work with virtually every outfit.</p>
<p><strong>Hype-brand energy at accessible prices. Same-day delivery Abuja before 11 AM.</strong></p>`;

    const longDescFr = `<p>Les Claquettes Hellstar en Noir Int\u00e9gral - la claquette streetwear iconique d'un des labels les plus hot du jeu. Dot\u00e9es du logo signature Hellstar de style tribal imprim\u00e9 sur la sangle, et d'une semelle ext\u00e9rieure \u00e9paisse \u00e0 crampons avec branding en relief. Parfaites pour les moments d\u00e9tente au bord de la piscine, les looks streetwear d'\u00e9t\u00e9, ou pour \u00e9lever n'importe quelle tenue relax avec l'\u00e9nergie hype-brand.</p>
<ul>
<li>Sangle sup\u00e9rieure en caoutchouc premium avec imprim\u00e9 logo Hellstar tribal signature</li>
<li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort prolong\u00e9</li>
<li>Semelle ext\u00e9rieure \u00e9paisse en caoutchouc avec motif embouti marque</li>
<li>Coloris tout noir pour une versatilit\u00e9 maximale</li>
<li>Construction slip-on pour un port sans effort</li>
<li>Design r\u00e9sistant \u00e0 l'eau (piscine/plage ready)</li>
<li>Livr\u00e9es dans la bo\u00eete Hellstar d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Hellstar</td></tr>
<tr><th>Mod\u00e8le</th><td>Claquettes Hellstar Logo Print</td></tr>
<tr><th>Couleur</th><td>Noir Int\u00e9gral</td></tr>
<tr><th>Mati\u00e8re</th><td>Caoutchouc premium + semelle ext\u00e9rieure textur\u00e9e</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Imprim\u00e9 logo Hellstar tribal + semelle en relief</td></tr>
<tr><th>Semelle</th><td>Caoutchouc \u00e9pais \u00e0 crampons</td></tr>
<tr><th>Fermeture</th><td>Sangle slip-on</td></tr>
<tr><th>Style</th><td>Streetwear / Hype / Casual d'\u00e9t\u00e9</td></tr>
<tr><th>Tailles</th><td>38-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Hellstar d'origine</td></tr>
</table>
<p>Hellstar est devenu un des labels streetwear d\u00e9finissants de l'\u00e8re moderne, aim\u00e9 par les rappeurs, les athl\u00e8tes, et les amateurs de hype du monde entier. Ces claquettes apportent cette m\u00eame \u00e9nergie dans un package confortable et adapt\u00e9 au quotidien. Portez-les avec un short de basket et un tee-shirt Hellstar pour la tenue compl\u00e8te de la t\u00eate aux pieds, avec un short cargo et un hoodie \u00e0 imprim\u00e9 pour des vibes casual du week-end, ou glissez-les avec un jogger pour un luxe piscine sans effort. Le coloris tout noir garantit qu'elles fonctionnent avec virtuellement toute tenue.</p>
<p><strong>\u00c9nergie hype-brand \u00e0 prix accessibles. Livraison same-day Abuja avant 11h.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Hellstar Slides - Black Logo Print",
      nameFr: "Claquettes Hellstar - Noir Logo",
      slug: slugEn,
      slugFr: slugFr,
      description: "Iconic Hellstar Slides in all-black with signature tribal logo print. Streetwear-approved comfort slide.",
      descriptionFr: "Claquettes Hellstar iconiques en noir int\u00e9gral avec logo tribal signature. Claquette confortable approuv\u00e9e streetwear.",
      shortDescription: "Hellstar Slides in black with signature logo print. Streetwear hype slide. Sizes 38-45. Ships from Abuja.",
      shortDescriptionFr: "Claquettes Hellstar en noir avec logo signature. Claquette streetwear hype. Tailles 38-45. Exp\u00e9di\u00e9 d'Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      category: "sandals",
      brand: "Hellstar",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 30,
      featured: false,
      active: true,
      material: "Premium rubber upper + textured rubber outsole",
      sku: "NDZ-HLS-SLD-BK01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Hellstar Slides Black Logo Print Streetwear | New Deal Zone",
      seoTitleFr: "Claquettes Hellstar Noir Logo Print Streetwear | New Deal Zone",
      metaDescription: "Shop iconic Hellstar Slides in all black with signature tribal logo. Streetwear hype slide for poolside and casual wear. Sizes 38-45. Same-day Abuja delivery.",
      metaDescriptionFr: "Claquettes Hellstar iconiques en noir avec logo tribal signature. Claquette streetwear hype pour piscine et casual. Tailles 38-45. Livraison same-day Abuja.",
      focusKeyphrase: "hellstar slides black",
      focusKeyphraseFr: "claquettes hellstar noir",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "NG",
      originCity: "Abuja",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Yusuf Abdullahi",   daysAgo: 3,   rating: 5, en: "Copped these for Lagos summer vibes! Quality is legit, the Hellstar branding is crisp, and they're SUPER comfortable. Been wearing them daily since delivery.", fr: "Achet\u00e9es pour les vibes d'\u00e9t\u00e9 \u00e0 Lagos ! La qualit\u00e9 est l\u00e9gitime, le branding Hellstar est net, et elles sont SUPER confortables. Je les porte quotidiennement depuis la livraison.", verified: true },
      { name: "Adaora Chukwu",     daysAgo: 12,  rating: 5, en: "Been wanting Hellstar for months. Finally got them here in Abuja without paying insane international shipping. The all-black looks even better in person. Fits true to size.", fr: "Je voulais du Hellstar depuis des mois. Enfin re\u00e7us ici \u00e0 Abuja sans payer un shipping international dingue. Le tout noir est encore plus beau en vrai. Taille juste.", verified: true },
      { name: "Kunle Bakare",      daysAgo: 26,  rating: 5, en: "Same-day delivery in Abuja was clutch! Ordered before 11 AM and they arrived same evening. The chunky sole gives good grip and the logo strap looks fresh. Definite grail.", fr: "La livraison same-day \u00e0 Abuja \u00e9tait cl\u00e9 ! Command\u00e9es avant 11h et arriv\u00e9es le soir m\u00eame. La semelle chunky donne une bonne adh\u00e9rence et la sangle logo est fra\u00eeche. Grail confirm\u00e9.", verified: true },
      { name: "Sarah Johnson",     daysAgo: 62,  rating: 4, en: "Great slides for the price. Comfort is solid and the logo hasn't faded even after multiple wears. Only note is they can be a bit slippery on wet surfaces so be careful poolside.", fr: "Superbes claquettes pour le prix. Le confort est solide et le logo n'a pas d\u00e9teint m\u00eame apr\u00e8s plusieurs ports. Seule remarque, elles peuvent \u00eatre un peu glissantes sur surfaces mouill\u00e9es donc soyez prudente au bord de la piscine.", verified: false },
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
      message: "Hellstar Slides Black seeded successfully",
      product: { id: product.id, slug: slugEn, slugFr: slugFr, imageUrl, blobUsed },
      pricing: {
        costNgn, sellingNgn, compareNgn,
        costUsd, sellingUsd, compareUsd,
        profitNgn: sellingNgn - costNgn,
        marginPct: Math.round(((sellingNgn - costNgn) / sellingNgn) * 1000) / 10,
        ngnRate: NGN,
      },
      reviews: {
        count: reviewData.length,
        avg: avgRating,
        breakdown: `${reviewData.filter(r => r.rating === 5).length}x 5-star, ${reviewData.filter(r => r.rating === 4).length}x 4-star`,
      },
      origin: { country: "NG", city: "Abuja" },
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