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

    const slugEn = "dolce-gabbana-dg-slides-black-silver-logo";
    const slugFr = "claquettes-dolce-gabbana-dg-noir-logo-argent";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/YFGPfRfd/Whats-App-Image-2026-08-09-at-10-11-20-AM-2.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/dolce-gabbana-dg-slides-black-silver-logo-luxury-${Date.now()}.jpg`,
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
    const tagsEn = JSON.stringify(["dolce-gabbana","d-and-g","slides","luxury","italian","designer","black","silver-logo","summer","poolside"]);
    const tagsFr = JSON.stringify(["dolce-gabbana","d-and-g","claquettes","luxe","italien","designer","noir","logo-argent","\u00e9t\u00e9","piscine"]);

    const longDescEn = `<p>The Dolce & Gabbana DG Slides in Black with Silver Logo Hardware - Italian designer luxury with statement branding. Featuring the iconic interlocking DG metal logo prominently displayed on the strap, premium rubber construction, and chunky treaded outsole. Milanese sophistication meets summer comfort in one unmistakable slide.</p>
<ul>
<li>Premium rubber upper in signature D&G black</li>
<li>Iconic interlocking DG silver metal logo hardware (statement centerpiece)</li>
<li>Padded footbed for extended luxury comfort</li>
<li>Chunky treaded rubber outsole for stability</li>
<li>Slip-on construction with perfectly positioned strap</li>
<li>Water-resistant for poolside, beach, and spa use</li>
<li>Ships in original Dolce & Gabbana branded box with authenticity card</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Dolce & Gabbana</td></tr>
<tr><th>Model</th><td>DG Logo Slides</td></tr>
<tr><th>Colour</th><td>Black with Silver Hardware</td></tr>
<tr><th>Material</th><td>Premium rubber + silver metal logo hardware</td></tr>
<tr><th>Signature Detail</th><td>Interlocking DG metal logo prominently placed</td></tr>
<tr><th>Sole</th><td>Chunky treaded rubber outsole</td></tr>
<tr><th>Closure</th><td>Slip-on strap</td></tr>
<tr><th>Style</th><td>Italian luxury / Statement designer / Resort wear</td></tr>
<tr><th>Sizes</th><td>38-45 EU</td></tr>
<tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
<tr><th>Includes</th><td>Original D&G box + authenticity card</td></tr>
</table>
<p>Dolce & Gabbana is synonymous with Italian glamour, and these slides bring that unmistakable D&G energy to your summer wardrobe. Unlike subtle luxury pieces, these are meant to be seen - the polished silver interlocking DG logo commands attention and instantly signals designer status. Pair with linen trousers and a printed silk shirt for authentic Mediterranean resort vibes, wear with tailored shorts and a white tee for effortless summer luxury, or style with cropped denim and a polo for elevated poolside energy. The chrome hardware pops against the matte black rubber.</p>
<p><strong>Italian designer statement piece at accessible prices. Same-day delivery Abuja before 11 AM. Fast nationwide shipping.</strong></p>`;

    const longDescFr = `<p>Les Claquettes Dolce & Gabbana DG en Noir avec Logo Argent - luxe designer italien avec branding d\u00e9claration. Dot\u00e9es du logo iconique DG entrelac\u00e9 en m\u00e9tal argent affich\u00e9 en \u00e9vidence sur la sangle, construction en caoutchouc premium, et semelle ext\u00e9rieure \u00e9paisse \u00e0 crampons. La sophistication milanaise rencontre le confort estival dans une claquette incomparable.</p>
<ul>
<li>Sangle sup\u00e9rieure en caoutchouc premium en noir D&G signature</li>
<li>Logo iconique DG entrelac\u00e9 en m\u00e9tal argent (pi\u00e8ce centrale d\u00e9claration)</li>
<li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort luxueux prolong\u00e9</li>
<li>Semelle ext\u00e9rieure \u00e9paisse en caoutchouc pour la stabilit\u00e9</li>
<li>Construction slip-on avec sangle parfaitement positionn\u00e9e</li>
<li>R\u00e9sistantes \u00e0 l'eau pour piscine, plage, et spa</li>
<li>Livr\u00e9es dans la bo\u00eete Dolce & Gabbana d'origine avec carte d'authenticit\u00e9</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Dolce & Gabbana</td></tr>
<tr><th>Mod\u00e8le</th><td>Claquettes Logo DG</td></tr>
<tr><th>Couleur</th><td>Noir avec Ferrure Argent</td></tr>
<tr><th>Mati\u00e8re</th><td>Caoutchouc premium + logo m\u00e9tal argent</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Logo DG entrelac\u00e9 en m\u00e9tal en \u00e9vidence</td></tr>
<tr><th>Semelle</th><td>Caoutchouc \u00e9pais \u00e0 crampons</td></tr>
<tr><th>Fermeture</th><td>Sangle slip-on</td></tr>
<tr><th>Style</th><td>Luxe italien / Designer d\u00e9claration / Resort wear</td></tr>
<tr><th>Tailles</th><td>38-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete D&G d'origine + carte d'authenticit\u00e9</td></tr>
</table>
<p>Dolce & Gabbana est synonyme de glamour italien, et ces claquettes apportent cette \u00e9nergie D&G incomparable \u00e0 votre garde-robe estivale. Contrairement aux pi\u00e8ces de luxe subtiles, celles-ci sont faites pour \u00eatre vues - le logo argent poli DG entrelac\u00e9 attire l'attention et signale instantan\u00e9ment le statut designer. Portez-les avec un pantalon en lin et une chemise en soie \u00e0 imprim\u00e9 pour des vibes resort m\u00e9diterran\u00e9en authentiques, avec un short ajust\u00e9 et un tee-shirt blanc pour un luxe estival sans effort, ou stylez-les avec un jean court et un polo pour une \u00e9nergie piscine \u00e9lev\u00e9e. La ferrure chrome ressort contre le caoutchouc noir mat.</p>
<p><strong>Pi\u00e8ce designer italienne d\u00e9claration \u00e0 prix accessibles. Livraison same-day Abuja avant 11h. Livraison rapide dans tout le Nigeria.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Dolce & Gabbana DG Slides - Black Silver Logo",
      nameFr: "Claquettes Dolce & Gabbana DG - Noir Logo Argent",
      slug: slugEn,
      slugFr: slugFr,
      description: "Iconic Dolce & Gabbana DG Slides in black with statement silver interlocking DG metal logo. Italian designer luxury.",
      descriptionFr: "Claquettes iconiques Dolce & Gabbana DG en noir avec logo argent DG entrelac\u00e9 d\u00e9claration. Luxe designer italien.",
      shortDescription: "D&G Slides in black with iconic silver DG logo hardware. Italian designer statement piece. Sizes 38-45. Ships from Abuja.",
      shortDescriptionFr: "Claquettes D&G en noir avec logo argent DG iconique. Pi\u00e8ce d\u00e9claration designer italien. Tailles 38-45. Exp\u00e9di\u00e9 d'Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      category: "sandals",
      brand: "Dolce & Gabbana",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 25,
      featured: true,
      active: true,
      material: "Premium rubber + silver metal logo hardware",
      sku: "NDZ-DGB-SLD-BK01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Dolce Gabbana DG Slides Black Silver Logo Luxury | New Deal Zone",
      seoTitleFr: "Claquettes Dolce Gabbana DG Noir Logo Argent | New Deal Zone",
      metaDescription: "Shop Dolce & Gabbana DG Slides in black with iconic silver interlocking DG logo. Italian designer statement piece. Sizes 38-45. Same-day Abuja delivery.",
      metaDescriptionFr: "Claquettes Dolce & Gabbana DG en noir avec logo argent DG iconique. Pi\u00e8ce d\u00e9claration designer italien. Tailles 38-45. Livraison same-day Abuja.",
      focusKeyphrase: "dolce gabbana slides black",
      focusKeyphraseFr: "claquettes dolce gabbana noir",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "NG",
      originCity: "Abuja",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Adeboye Ogunlesi",  daysAgo: 2,   rating: 5, en: "The DG silver logo is EVERYTHING! Polished metal quality is legit, catches light beautifully. Fit is perfect, comfortable enough to wear all day. Best luxury slide purchase.", fr: "Le logo DG argent est TOUT ! La qualit\u00e9 du m\u00e9tal poli est l\u00e9gitime, capte la lumi\u00e8re magnifiquement. Ajustement parfait, assez confortable pour porter toute la journ\u00e9e. Meilleur achat de claquette luxe.", verified: true },
      { name: "Fatoumata Diarra",  daysAgo: 11,  rating: 5, en: "Been wanting D&G slides but the international prices were insane. This is authentic quality at a fair price. Same-day delivery in Abuja was seamless. Highly recommend.", fr: "Je voulais des claquettes D&G mais les prix internationaux \u00e9taient dingues. C'est une qualit\u00e9 authentique \u00e0 un prix juste. Livraison same-day \u00e0 Abuja tr\u00e8s fluide. Vivement recommand\u00e9.", verified: true },
      { name: "Chidi Nwosu",       daysAgo: 28,  rating: 5, en: "Perfect for pool days and summer looks. The metal logo really elevates them from regular slides to statement designer piece. Padded footbed is comfy, chunky sole gives good grip. Solid buy.", fr: "Parfaites pour les journ\u00e9es piscine et les looks d'\u00e9t\u00e9. Le logo m\u00e9tallique les \u00e9l\u00e8ve vraiment des claquettes ordinaires \u00e0 une pi\u00e8ce d\u00e9claration designer. Semelle rembourr\u00e9e confortable, semelle chunky donne une bonne adh\u00e9rence. Solide achat.", verified: true },
      { name: "Isabelle Rousseau", daysAgo: 54,  rating: 4, en: "Beautiful slides with statement DG hardware. Only note - the metal logo can catch on soft fabrics like beach towels so be mindful. Otherwise stunning and true to size.", fr: "Belles claquettes avec ferrure DG d\u00e9claration. Seule remarque - le logo m\u00e9tallique peut accrocher les tissus doux comme les serviettes de plage donc soyez prudente. Sinon magnifiques et taille juste.", verified: false },
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
      message: "Dolce Gabbana DG Slides Black seeded successfully",
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