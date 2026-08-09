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

    const slugEn = "roberto-cavalli-slides-black-rc-monogram";
    const slugFr = "claquettes-roberto-cavalli-noir-monogramme-rc";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/vxPk16kk/Whats-App-Image-2026-08-09-at-10-11-20-AM-1.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/roberto-cavalli-slides-black-rc-monogram-luxury-${Date.now()}.jpg`,
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
    const tagsEn = JSON.stringify(["roberto-cavalli","slides","luxury","italian","designer","black","monogram","summer","poolside","tone-on-tone"]);
    const tagsFr = JSON.stringify(["roberto-cavalli","claquettes","luxe","italien","designer","noir","monogramme","\u00e9t\u00e9","piscine","tone-on-tone"]);

    const longDescEn = `<p>The Roberto Cavalli RC Monogram Slides in All Black - Italian designer luxury in its most understated, sophisticated form. Featuring the iconic intertwined RC monogram embossed in tone-on-tone black relief, chunky treaded outsole, and signature Roberto Cavalli branded packaging. Pure Milanese elegance for poolside and elevated casual moments.</p>
<ul>
<li>Premium rubber upper with tone-on-tone RC monogram in relief</li>
<li>Padded footbed for extended luxury comfort</li>
<li>Chunky treaded rubber outsole for stability</li>
<li>All-black colorway with subtle luxury detailing (embossed monogram)</li>
<li>Slip-on construction with perfectly weighted strap</li>
<li>Water-resistant for poolside, beach, and spa use</li>
<li>Ships in original Roberto Cavalli branded box with authenticity documentation</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Roberto Cavalli</td></tr>
<tr><th>Model</th><td>RC Monogram Slides</td></tr>
<tr><th>Colour</th><td>All Black (Tonal)</td></tr>
<tr><th>Material</th><td>Premium rubber + embossed monogram detailing</td></tr>
<tr><th>Signature Detail</th><td>Intertwined RC monogram in tone-on-tone relief</td></tr>
<tr><th>Sole</th><td>Chunky treaded rubber outsole</td></tr>
<tr><th>Closure</th><td>Slip-on strap</td></tr>
<tr><th>Style</th><td>Italian luxury / Understated designer / Resort wear</td></tr>
<tr><th>Sizes</th><td>38-45 EU</td></tr>
<tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
<tr><th>Includes</th><td>Original Roberto Cavalli box + documentation</td></tr>
</table>
<p>Roberto Cavalli represents the pinnacle of Italian luxury fashion, and these slides embody the brand's signature blend of bold heritage and refined subtlety. The tone-on-tone black monogram whispers rather than shouts - a detail that discerning fashion enthusiasts recognize instantly. Pair with linen shorts and an open-collar shirt for Mediterranean resort vibes, wear with tailored joggers and a fitted knit for elevated athleisure, or slip them on with premium denim for effortless designer casual. The all-black palette ensures they work with virtually every summer wardrobe piece.</p>
<p><strong>Italian designer luxury at accessible prices. Same-day delivery Abuja before 11 AM. Fast nationwide shipping.</strong></p>`;

    const longDescFr = `<p>Les Claquettes Roberto Cavalli RC Monogramme en Noir Int\u00e9gral - le luxe designer italien dans sa forme la plus sobre et sophistiqu\u00e9e. Dot\u00e9es du monogramme iconique RC entrelac\u00e9 emboss\u00e9 en relief tone-on-tone noir, semelle ext\u00e9rieure \u00e9paisse \u00e0 crampons, et emballage Roberto Cavalli signature. \u00c9l\u00e9gance milanaise pure pour les moments piscine et casual \u00e9lev\u00e9.</p>
<ul>
<li>Sangle sup\u00e9rieure en caoutchouc premium avec monogramme RC en relief tone-on-tone</li>
<li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort luxueux prolong\u00e9</li>
<li>Semelle ext\u00e9rieure \u00e9paisse en caoutchouc pour la stabilit\u00e9</li>
<li>Coloris tout noir avec d\u00e9tail luxe subtil (monogramme emboss\u00e9)</li>
<li>Construction slip-on avec sangle parfaitement pond\u00e9r\u00e9e</li>
<li>R\u00e9sistantes \u00e0 l'eau pour piscine, plage, et spa</li>
<li>Livr\u00e9es dans la bo\u00eete Roberto Cavalli d'origine avec documentation d'authenticit\u00e9</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Roberto Cavalli</td></tr>
<tr><th>Mod\u00e8le</th><td>Claquettes Monogramme RC</td></tr>
<tr><th>Couleur</th><td>Noir Int\u00e9gral (Tonal)</td></tr>
<tr><th>Mati\u00e8re</th><td>Caoutchouc premium + monogramme emboss\u00e9</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Monogramme RC entrelac\u00e9 en relief tone-on-tone</td></tr>
<tr><th>Semelle</th><td>Caoutchouc \u00e9pais \u00e0 crampons</td></tr>
<tr><th>Fermeture</th><td>Sangle slip-on</td></tr>
<tr><th>Style</th><td>Luxe italien / Designer sobre / Resort wear</td></tr>
<tr><th>Tailles</th><td>38-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Roberto Cavalli d'origine + documentation</td></tr>
</table>
<p>Roberto Cavalli repr\u00e9sente le sommet de la mode luxe italienne, et ces claquettes incarnent le m\u00e9lange signature de la marque entre h\u00e9ritage audacieux et subtilit\u00e9 raffin\u00e9e. Le monogramme noir tone-on-tone chuchote plut\u00f4t que crie - un d\u00e9tail que les amateurs de mode avertis reconnaissent instantan\u00e9ment. Portez-les avec un short en lin et une chemise ouverte pour des vibes resort m\u00e9diterran\u00e9en, avec un jogger ajust\u00e9 et un pull ajust\u00e9 pour un athleisure \u00e9lev\u00e9, ou glissez-les avec un jean premium pour un casual designer sans effort. La palette tout noir garantit qu'elles fonctionnent avec virtuellement chaque pi\u00e8ce de garde-robe d'\u00e9t\u00e9.</p>
<p><strong>Luxe designer italien \u00e0 prix accessibles. Livraison same-day Abuja avant 11h. Livraison rapide dans tout le Nigeria.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Roberto Cavalli Slides - Black RC Monogram",
      nameFr: "Claquettes Roberto Cavalli - Noir Monogramme RC",
      slug: slugEn,
      slugFr: slugFr,
      description: "Italian luxury Roberto Cavalli slides in all-black with tone-on-tone embossed RC monogram. Understated designer elegance.",
      descriptionFr: "Claquettes de luxe italien Roberto Cavalli en noir int\u00e9gral avec monogramme RC emboss\u00e9 tone-on-tone. \u00c9l\u00e9gance designer sobre.",
      shortDescription: "Roberto Cavalli Slides in black with tonal RC monogram embossing. Italian designer luxury. Sizes 38-45. Ships from Abuja.",
      shortDescriptionFr: "Claquettes Roberto Cavalli en noir avec monogramme RC tone-on-tone. Luxe designer italien. Tailles 38-45. Exp\u00e9di\u00e9 d'Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      category: "sandals",
      brand: "Roberto Cavalli",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 25,
      featured: true,
      active: true,
      material: "Premium rubber + embossed monogram detailing",
      sku: "NDZ-RCV-SLD-BK01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Roberto Cavalli Slides Black RC Monogram Luxury | New Deal Zone",
      seoTitleFr: "Claquettes Roberto Cavalli Noir Monogramme RC | New Deal Zone",
      metaDescription: "Shop Roberto Cavalli Slides in all black with tone-on-tone RC monogram. Italian designer luxury sandal. Sizes 38-45. Same-day Abuja delivery.",
      metaDescriptionFr: "Claquettes Roberto Cavalli en noir int\u00e9gral avec monogramme RC tone-on-tone. Sandale designer luxe italien. Tailles 38-45. Livraison same-day Abuja.",
      focusKeyphrase: "roberto cavalli slides black",
      focusKeyphraseFr: "claquettes roberto cavalli noir",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "NG",
      originCity: "Abuja",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Ibrahim Yakubu",   daysAgo: 2,   rating: 5, en: "Roberto Cavalli quality is undeniable. The tone-on-tone monogram is so subtle and classy - true luxury doesn't need to shout. Fits perfectly, comfortable, and came with proper documentation. Trust worthy seller.", fr: "La qualit\u00e9 Roberto Cavalli est ind\u00e9niable. Le monogramme tone-on-tone est si subtil et classe - le vrai luxe n'a pas besoin de crier. Ajustement parfait, confortable, et arriv\u00e9 avec documentation appropri\u00e9e. Vendeur de confiance.", verified: true },
      { name: "Grace Owusu",      daysAgo: 14,  rating: 5, en: "Been looking for authentic Cavalli slides at reasonable prices and this delivered! The all-black with subtle monogram is exactly the vibe. Same-day delivery in Abuja was smooth. Highly recommend.", fr: "Je cherchais des claquettes Cavalli authentiques \u00e0 prix raisonnable et celles-ci ont livr\u00e9 ! Le tout noir avec monogramme subtil est exactement le vibe. Livraison same-day \u00e0 Abuja tr\u00e8s fluide. Vivement recommand\u00e9.", verified: true },
      { name: "Emmanuel Adeyemi", daysAgo: 31,  rating: 5, en: "Perfect resort/poolside slides. The chunky sole feels premium underfoot, monogram detail is beautifully executed. Padded footbed makes them comfortable for walking around. Solid designer piece.", fr: "Claquettes resort/piscine parfaites. La semelle chunky se sent premium sous le pied, le d\u00e9tail monogramme est magnifiquement ex\u00e9cut\u00e9. La semelle rembourr\u00e9e les rend confortables pour marcher. Solide pi\u00e8ce designer.", verified: true },
      { name: "Camille Bernard",  daysAgo: 58,  rating: 4, en: "Beautiful slides with real designer feel. The subtle monogram is my favorite thing about them - not too flashy. Sizing runs true. Small note - keep them out of direct sun for extended periods to maintain the black color.", fr: "Belles claquettes avec un vrai feeling designer. Le monogramme subtil est ce que je pr\u00e9f\u00e8re - pas trop tape-\u00e0-l'\u0153il. La taille est juste. Petite note - gardez-les hors du soleil direct pendant de longues p\u00e9riodes pour maintenir la couleur noire.", verified: false },
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
      message: "Roberto Cavalli Slides Black seeded successfully",
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