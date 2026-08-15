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
    const sourceUrl = "https://i.ibb.co/MDwqbX8c/Whats-App-Image-2026-08-11-at-3-34-02-PM-2.jpg";
    const slug = "skechers-slip-ins-hands-free-grey";
    const slugFr = "basket-skechers-slip-ins-mains-libres-gris";

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

    const costNgn = 25000;
    const sellingNgn = 30000;
    const compareNgn = 35000;

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
          `products/skechers-slip-ins-grey-${Date.now()}.jpg`,
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
      { name: "Charcoal Grey/White", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["skechers", "slip-ins", "hands-free", "walking", "comfort", "arch-fit", "ultra-light", "grey", "abuja"];
    const tagsFr = ["skechers", "slip-ins", "mains-libres", "marche", "confort", "arch-fit", "ultra-l\u00e9ger", "gris", "abuja"];

    const longDescEn = `<p>Say goodbye to bending down \u2013 the Skechers Slip-Ins in Charcoal Grey deliver revolutionary hands-free convenience with pillow-soft comfort. Featuring patented Heel Pillow technology, these slip on effortlessly and lock your foot in place for all-day support.</p>
<h3>Key Features</h3>
<ul>
  <li>Patented Hands-Free Slip-Ins technology \u2013 no bending required</li>
  <li>Heel Pillow keeps foot secure and prevents slipping</li>
  <li>Breathable engineered mesh upper</li>
  <li>Ultra Light EVA midsole for cloud-like comfort</li>
  <li>Arch Fit insole for orthopedic support</li>
  <li>Grippy rubber pods on outsole for stability</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Skechers</td></tr>
  <tr><th>Model</th><td>GO Walk Arch Fit Slip-Ins</td></tr>
  <tr><th>Colour</th><td>Charcoal Grey / White</td></tr>
  <tr><th>Material</th><td>Engineered Mesh + Ultra Light EVA</td></tr>
  <tr><th>Cushioning/Sole</th><td>Ultra Light EVA + Arch Fit insole</td></tr>
  <tr><th>Signature Detail</th><td>Slip-Ins Heel Pillow tech</td></tr>
  <tr><th>Closure</th><td>Hands-free slip-on</td></tr>
  <tr><th>Style</th><td>Athletic walking comfort</td></tr>
  <tr><th>Sizes</th><td>41 to 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Skechers box, arch fit insole</td></tr>
</table>
<h3>Styling</h3>
<p>Perfect for busy mornings, long shifts, travel days, or anyone who values comfort above all. Pair with joggers, chinos, or athleisure fits. The clean charcoal and white palette works with any casual wardrobe.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Dites adieu \u00e0 vous baisser \u2013 les Skechers Slip-Ins en Gris Charbon offrent une commodit\u00e9 mains libres r\u00e9volutionnaire avec un confort moelleux. Dot\u00e9es de la technologie brevet\u00e9e Heel Pillow, elles s\u2019enfilent sans effort et maintiennent votre pied en place pour un soutien toute la journ\u00e9e.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Technologie brevet\u00e9e Hands-Free Slip-Ins \u2013 pas besoin de se baisser</li>
  <li>Heel Pillow maintient le pied en place et \u00e9vite le glissement</li>
  <li>Tige en maille technique respirante</li>
  <li>Semelle interm\u00e9diaire Ultra Light EVA pour un confort a\u00e9rien</li>
  <li>Semelle int\u00e9rieure Arch Fit pour un soutien orthop\u00e9dique</li>
  <li>Plots caoutchouc antid\u00e9rapants pour la stabilit\u00e9</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Skechers</td></tr>
  <tr><th>Mod\u00e8le</th><td>GO Walk Arch Fit Slip-Ins</td></tr>
  <tr><th>Couleur</th><td>Gris Charbon / Blanc</td></tr>
  <tr><th>Mati\u00e8re</th><td>Maille technique + Ultra Light EVA</td></tr>
  <tr><th>Amorti</th><td>EVA Ultra Light + semelle Arch Fit</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Technologie Slip-Ins Heel Pillow</td></tr>
  <tr><th>Fermeture</th><td>Enfilage mains libres</td></tr>
  <tr><th>Style</th><td>Marche athl\u00e9tique confort</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Skechers, semelle arch fit</td></tr>
</table>
<h3>Comment Porter</h3>
<p>Parfait pour les matins press\u00e9s, les longues journ\u00e9es, les voyages ou pour toute personne qui privil\u00e9gie le confort. \u00c0 associer avec un jogging, un chino ou un ensemble athleisure. La palette propre gris charbon et blanc s\u2019accorde avec toute garde-robe casual.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Skechers Slip-Ins Hands-Free - Charcoal Grey",
      nameFr: "Basket Skechers Slip-Ins Mains Libres - Gris Charbon",
      slug,
      slugFr,
      description: "Skechers Slip-Ins in Charcoal Grey. Hands-free Heel Pillow tech, engineered mesh, Ultra Light EVA sole, Arch Fit insole. Ships from Abuja.",
      descriptionFr: "Skechers Slip-Ins en Gris Charbon. Technologie mains libres Heel Pillow, maille technique, semelle Ultra Light EVA, Arch Fit. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Skechers Slip-Ins hands-free walking shoe. Mesh upper, Ultra Light sole, no bending needed. Ships from Abuja.",
      shortDescriptionFr: "Basket Skechers Slip-Ins mains libres. Maille, semelle Ultra Light, sans se baisser. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Skechers",
      category: "running",
      sku: "NDZ-SKX-SLI-GR01",
      material: "Engineered Mesh + Ultra Light EVA",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 25,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: false,
      seoTitle: "Skechers Slip-Ins Hands-Free Grey | New Deal Zone",
      seoTitleFr: "Skechers Slip-Ins Mains Libres Gris | New Deal Zone",
      metaDescription: "Skechers Slip-Ins hands-free walking shoe in Charcoal Grey. Heel Pillow tech, Ultra Light EVA, Arch Fit. Fast delivery from Abuja.",
      metaDescriptionFr: "Skechers Slip-Ins mains libres gris charbon. Heel Pillow, Ultra Light EVA, Arch Fit. Livraison rapide depuis Abuja.",
      focusKeyphrase: "skechers slip ins hands free",
      focusKeyphraseFr: "skechers slip ins mains libres",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Kunle Adebayo", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These slip-ins are a game changer! No more bending down to tie laces, just step in and go. Super comfortable for long work days.",
        commentFr: "Ces slip-ins changent la vie! Plus besoin de se baisser pour lacer, il suffit d\u2019enfiler et partir. Super confortable pour les longues journ\u00e9es de travail." },
      { name: "Sarah Chen", rating: 5, daysAgo: 20, verified: true,
        commentEn: "Bought these for my dad who has back issues. He loves them! Slips on effortlessly and the arch support is excellent.",
        commentFr: "Achet\u00e9es pour mon p\u00e8re qui a des probl\u00e8mes de dos. Il les adore! S\u2019enfilent sans effort et le soutien de la vo\u00fbte est excellent." },
      { name: "Wanjiru Mwangi", rating: 5, daysAgo: 40, verified: true,
        commentEn: "So light and comfy! Perfect for my hospital shifts on my feet all day. The Heel Pillow really works, no slipping at all.",
        commentFr: "Tellement l\u00e9g\u00e8res et confortables! Parfait pour mes gardes \u00e0 l\u2019h\u00f4pital debout toute la journ\u00e9e. Le Heel Pillow fonctionne vraiment, aucun glissement." },
      { name: "Osei Boateng", rating: 4, daysAgo: 65, verified: false,
        commentEn: "Comfortable and easy to slip on. Took me a day to adjust to the tight heel but now they feel perfect. Great for casual wear.",
        commentFr: "Confortable et facile \u00e0 enfiler. Il m\u2019a fallu un jour pour m\u2019habituer au talon serr\u00e9 mais maintenant elles sont parfaites. Super pour le casual." },
      { name: "Steven Njoroge", rating: 5, daysAgo: 90, verified: true,
        commentEn: "Best walking shoes I own now. So much cushioning under my feet, feels like walking on clouds. Highly recommend for anyone on their feet all day.",
        commentFr: "Les meilleures chaussures de marche que j\u2019ai maintenant. Tellement de rembourrage sous les pieds, on dirait qu\u2019on marche sur des nuages. Recommande \u00e0 fond." },
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