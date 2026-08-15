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
    const sourceUrl = "https://i.ibb.co/B2y2gv0G/Whats-App-Image-2026-08-11-at-11-59-48-AM.jpg";
    const slug = "new-balance-530-white-silver-navy";
    const slugFr = "basket-new-balance-530-blanc-argent-marine";

    let ngnRate = 1364;
    let xofRate = 568;
    try {
      const rateRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        ngnRate = Number(rateData?.rates?.NGN) || 1364;
        xofRate = Number(rateData?.rates?.XOF) || 568;
      }
    } catch (e) { console.error("Rate fetch failed:", e); }

    const costNgn = 18000;
    const sellingNgn = 25000;
    const compareNgn = 30000;

    const costUsd = Math.round((costNgn / ngnRate) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / ngnRate) * 100) / 100;
    const compareUsd = Math.round((compareNgn / ngnRate) * 100) / 100;
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 100);

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/new-balance-530-white-silver-navy-${Date.now()}.jpg`,
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
      await db.delete(products).where(eq(products.id, p.id));
    }

    const colors = [
      { name: "White/Silver/Navy", image: imageUrl },
    ];

    const sizes = ["40", "41", "42", "43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["new-balance", "530", "sneakers", "y2k", "retro-running", "white", "silver", "navy", "abzorb", "abuja"];
    const tagsFr = ["new-balance", "530", "baskets", "y2k", "r\u00e9tro-running", "blanc", "argent", "marine", "abzorb", "abuja"];

    const longDescEn = `<p>Meet the viral New Balance 530 in White, Silver & Navy \u2013 a Y2K running classic that has taken over the streetwear world. Featuring the iconic silver mudguard, navy N branding, and ABZORB cushioning, this silhouette blends nostalgia with everyday comfort.</p>
<h3>Key Features</h3>
<ul>
  <li>Breathable mesh upper with synthetic leather overlays</li>
  <li>Silver metallic mudguard for premium Y2K aesthetic</li>
  <li>Navy N logo branding on lateral panels</li>
  <li>ABZORB midsole cushioning for shock absorption</li>
  <li>Rubber outsole with signature tread pattern</li>
  <li>Retro running silhouette with modern comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>New Balance</td></tr>
  <tr><th>Model</th><td>530</td></tr>
  <tr><th>Colour</th><td>White / Silver / Navy</td></tr>
  <tr><th>Material</th><td>Mesh + Synthetic Leather + Rubber</td></tr>
  <tr><th>Cushioning/Sole</th><td>ABZORB midsole</td></tr>
  <tr><th>Signature Detail</th><td>Silver mudguard + N logo</td></tr>
  <tr><th>Closure</th><td>Flat lace-up</td></tr>
  <tr><th>Style</th><td>Y2K retro running</td></tr>
  <tr><th>Sizes</th><td>40 to 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>New Balance box, laces</td></tr>
</table>
<h3>Styling</h3>
<p>The 530 is the ultimate go-with-everything sneaker. Pair with baggy jeans, cargo pants, athletic shorts, or dresses. The white base with silver and navy accents adds subtle retro flair to any fit \u2013 works equally well for gym days and street looks.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>D\u00e9couvrez la New Balance 530 virale en Blanc, Argent et Marine \u2013 un classique running Y2K qui a conquis le monde du streetwear. Avec sa garde-boue argent\u00e9e iconique, son logo N marine et son amorti ABZORB, cette silhouette allie nostalgie et confort quotidien.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en maille respirante avec superpositions en cuir synth\u00e9tique</li>
  <li>Garde-boue argent m\u00e9tallique pour une esth\u00e9tique Y2K premium</li>
  <li>Logo N marine sur les panneaux lat\u00e9raux</li>
  <li>Amorti ABZORB dans la semelle interm\u00e9diaire pour absorption des chocs</li>
  <li>Semelle ext\u00e9rieure en caoutchouc avec motif signature</li>
  <li>Silhouette running r\u00e9tro avec confort moderne</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>New Balance</td></tr>
  <tr><th>Mod\u00e8le</th><td>530</td></tr>
  <tr><th>Couleur</th><td>Blanc / Argent / Marine</td></tr>
  <tr><th>Mati\u00e8re</th><td>Maille + Cuir synth\u00e9tique + Caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Semelle interm\u00e9diaire ABZORB</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Garde-boue argent + logo N</td></tr>
  <tr><th>Fermeture</th><td>Lacets plats</td></tr>
  <tr><th>Style</th><td>Running r\u00e9tro Y2K</td></tr>
  <tr><th>Tailles</th><td>40 \u00e0 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete New Balance, lacets</td></tr>
</table>
<h3>Comment Porter</h3>
<p>La 530 est la basket ultime qui va avec tout. \u00c0 associer avec un jean baggy, un pantalon cargo, un short athl\u00e9tique ou une robe. La base blanche avec accents argent et marine ajoute une touche r\u00e9tro subtile \u00e0 toute tenue \u2013 fonctionne aussi bien pour les jours de gym que pour les looks urbains.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "New Balance 530 - White, Silver & Navy",
      nameFr: "Basket New Balance 530 - Blanc, Argent et Marine",
      slug,
      slugFr,
      description: "New Balance 530 in White, Silver & Navy. Mesh upper, silver mudguard, ABZORB cushioning, Y2K running classic. Ships from Abuja.",
      descriptionFr: "New Balance 530 en Blanc, Argent et Marine. Maille, garde-boue argent, amorti ABZORB, classique running Y2K. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "New Balance 530 White/Silver/Navy. Mesh upper, ABZORB sole, viral Y2K silhouette. Ships from Abuja.",
      shortDescriptionFr: "New Balance 530 blanc/argent/marine. Maille, semelle ABZORB, silhouette Y2K virale. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "New Balance",
      category: "sneakers",
      sku: "NDZ-NB-530-WN01",
      material: "Mesh + Synthetic Leather + Rubber",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 25,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "New Balance 530 White Silver Navy | New Deal Zone",
      seoTitleFr: "New Balance 530 Blanc Argent Marine | New Deal Zone",
      metaDescription: "New Balance 530 White, Silver & Navy. Mesh upper, silver mudguard, ABZORB cushioning. Viral Y2K classic. Fast delivery from Abuja.",
      metaDescriptionFr: "New Balance 530 blanc argent marine. Maille, garde-boue argent, amorti ABZORB. Classique Y2K viral. Livraison rapide depuis Abuja.",
      focusKeyphrase: "new balance 530 white",
      focusKeyphraseFr: "new balance 530 blanc",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Nnamdi Okonkwo", rating: 5, daysAgo: 4, verified: true,
        commentEn: "The 530s are everything! Silver mudguard looks so clean and the ABZORB cushioning is legit comfortable. Fast delivery to Abuja.",
        commentFr: "Les 530 c\u2019est tout! La garde-boue argent est super propre et l\u2019amorti ABZORB est vraiment confortable. Livraison rapide \u00e0 Abuja." },
      { name: "Aminata Toure", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Been wanting these forever! Quality is amazing, they look identical to retail pairs. Navy N logo really pops on the white base.",
        commentFr: "Je les voulais depuis toujours! La qualit\u00e9 est incroyable, elles ressemblent parfaitement aux paires retail. Le logo N marine ressort bien." },
      { name: "David Roberts", rating: 5, daysAgo: 44, verified: true,
        commentEn: "So versatile, wear them with everything. The Y2K vibe is on point and they're comfortable enough for all-day wear.",
        commentFr: "Tellement polyvalentes, je les porte avec tout. Le style Y2K est parfait et elles sont confortables toute la journ\u00e9e." },
      { name: "Mensah Adjei", rating: 4, daysAgo: 61, verified: false,
        commentEn: "Great sneakers, love the retro look. Sizing was true for me at 43. Would be perfect if they came with an extra set of laces.",
        commentFr: "Belles baskets, j\u2019adore le look r\u00e9tro. Taille exacte pour moi en 43. Ce serait parfait avec des lacets de rechange." },
      { name: "Marie Dubois", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Best sneaker purchase this year! Silver detailing catches the light beautifully and the cushioning is like walking on air.",
        commentFr: "Meilleur achat basket de l\u2019ann\u00e9e! Les d\u00e9tails argent\u00e9s captent la lumi\u00e8re et l\u2019amorti c\u2019est comme marcher sur l\u2019air." },
    ];

    let totalRating = 0;
    for (const r of reviewData) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.commentEn,
        commentFr: r.commentFr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt,
      });
      totalRating += r.rating;
    }

    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Product + reviews seeded",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: { costNgn, sellingNgn, compareNgn, costUsd, sellingUsd, compareUsd, profitNgn, marginPct, ngnRate, xofRate },
      reviews: { count: reviewData.length, avg: avgRating },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}