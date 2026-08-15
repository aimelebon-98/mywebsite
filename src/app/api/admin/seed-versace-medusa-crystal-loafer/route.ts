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
    const sourceUrl = "https://i.ibb.co/wNfFwvMQ/Whats-App-Image-2026-08-11-at-8-26-24-AM.jpg";
    const slug = "versace-medusa-crystal-platform-loafer-black";
    const slugFr = "mocassin-versace-medusa-cristal-plateforme-noir";

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

    const costNgn = 38000;
    const sellingNgn = 45000;
    const compareNgn = 50000;

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
          `products/versace-medusa-crystal-platform-loafer-black-${Date.now()}.jpg`,
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
      { name: "Black Crystal / Gold Medusa", image: imageUrl },
    ];

    const sizes = ["43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["versace", "medusa", "loafer", "crystal", "platform", "formal", "luxury", "designer", "black", "abuja"];
    const tagsFr = ["versace", "medusa", "mocassin", "cristal", "plateforme", "formel", "luxe", "designer", "noir", "abuja"];

    const longDescEn = `<p>Command the room with the Versace Medusa Crystal Platform Loafer in Black \u2013 pure Italian luxury designed to shine. Featuring an all-over hand-applied crystal upper, iconic gold Medusa hardware, and a bold chunky platform sole, this loafer transforms any outfit into a red-carpet moment.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium black suede upper covered in shimmering crystal studs</li>
  <li>Signature gold-tone Versace Medusa head medallion on vamp strap</li>
  <li>Glossy patent leather piping and trim for refined contrast</li>
  <li>Chunky rubber platform sole with sculpted architectural lines</li>
  <li>Slip-on loafer construction for effortless elegance</li>
  <li>Padded leather insole for luxurious comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Versace</td></tr>
  <tr><th>Model</th><td>Medusa Crystal Platform Loafer</td></tr>
  <tr><th>Colour</th><td>Black Crystal / Gold Medusa</td></tr>
  <tr><th>Material</th><td>Suede + Crystals + Patent Leather + Rubber</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber platform</td></tr>
  <tr><th>Signature Detail</th><td>Gold Medusa medallion + crystal studs</td></tr>
  <tr><th>Closure</th><td>Slip-on loafer</td></tr>
  <tr><th>Style</th><td>Luxury evening designer loafer</td></tr>
  <tr><th>Sizes</th><td>43, 44, 45, 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Versace branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with tailored black tuxedo trousers, slim-fit suits, or bold monochrome ensembles. The crystal shine and gold Medusa hardware make these the ultimate evening statement \u2013 perfect for galas, weddings, high-end dinners, and unforgettable nights out.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Imposez-vous dans toute pi\u00e8ce avec le Mocassin Versace Medusa Cristal Plateforme en Noir \u2013 pur luxe italien con\u00e7u pour briller. Avec sa tige enti\u00e8rement recouverte de cristaux appliqu\u00e9s \u00e0 la main, son m\u00e9daillon Medusa dor\u00e9 iconique et sa semelle plateforme \u00e9paisse audacieuse, ce mocassin transforme toute tenue en moment red carpet.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en daim noir premium recouverte de clous cristal scintillants</li>
  <li>M\u00e9daillon Medusa Versace dor\u00e9 signature sur la bride</li>
  <li>Passepoil et bordures en cuir verni brillant pour un contraste raffin\u00e9</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc aux lignes architecturales sculpt\u00e9es</li>
  <li>Construction mocassin \u00e0 enfiler pour une \u00e9l\u00e9gance sans effort</li>
  <li>Semelle int\u00e9rieure en cuir rembourr\u00e9e pour un confort luxueux</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Versace</td></tr>
  <tr><th>Mod\u00e8le</th><td>Mocassin Medusa Cristal Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir Cristal / Medusa Dor\u00e9</td></tr>
  <tr><th>Mati\u00e8re</th><td>Daim + Cristaux + Cuir verni + Caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc \u00e9paisse</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>M\u00e9daillon Medusa + clous cristal</td></tr>
  <tr><th>Fermeture</th><td>Mocassin \u00e0 enfiler</td></tr>
  <tr><th>Style</th><td>Mocassin designer soir\u00e9e de luxe</td></tr>
  <tr><th>Tailles</th><td>43, 44, 45, 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Versace, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon de smoking noir, des costumes ajust\u00e9s ou des ensembles monochromes audacieux. L\u2019\u00e9clat des cristaux et le m\u00e9daillon Medusa dor\u00e9 en font la d\u00e9claration ultime du soir \u2013 parfait pour les galas, mariages, d\u00eeners haut de gamme et soir\u00e9es inoubliables.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Versace Medusa Crystal Platform Loafer - Black",
      nameFr: "Mocassin Versace Medusa Cristal Plateforme - Noir",
      slug,
      slugFr,
      description: "Versace Medusa Crystal Platform Loafer in Black. All-over crystal suede upper, gold Medusa hardware, chunky platform sole. Ships from Abuja.",
      descriptionFr: "Mocassin Versace Medusa Cristal Plateforme en Noir. Tige daim recouverte de cristaux, m\u00e9daillon Medusa dor\u00e9, semelle plateforme \u00e9paisse. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Versace Medusa crystal loafer in black. Suede + crystals, gold Medusa medallion, chunky platform. Ships from Abuja.",
      shortDescriptionFr: "Mocassin Versace Medusa cristal noir. Daim et cristaux, m\u00e9daillon dor\u00e9, plateforme \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Versace",
      category: "formal",
      sku: "NDZ-VRS-MED-BK01",
      material: "Suede + Crystals + Patent Leather + Rubber",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 10,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Versace Medusa Crystal Platform Loafer Black | New Deal Zone",
      seoTitleFr: "Mocassin Versace Medusa Cristal Plateforme | New Deal Zone",
      metaDescription: "Versace Medusa Crystal Platform Loafer in Black. Crystal-studded suede, gold Medusa medallion, chunky platform. Fast delivery from Abuja.",
      metaDescriptionFr: "Mocassin Versace Medusa Cristal Plateforme noir. Daim et cristaux, m\u00e9daillon dor\u00e9, plateforme \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "versace medusa crystal loafer",
      focusKeyphraseFr: "mocassin versace medusa cristal",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Jordan Roberts", rating: 5, daysAgo: 4, verified: true,
        commentEn: "These Versace loafers are BREATHTAKING! The crystals catch every light and the gold Medusa is stunning. Wore them to a gala and got stopped constantly.",
        commentFr: "Ces mocassins Versace sont \u00c9POUSTOUFLANTS! Les cristaux captent chaque lumi\u00e8re et la Medusa dor\u00e9e est magnifique. Port\u00e9s pour un gala, arr\u00eat\u00e9 constamment." },
      { name: "Adaora Okafor", rating: 5, daysAgo: 21, verified: true,
        commentEn: "Bought these for my husband\u2019s 40th birthday celebration. He was speechless. Quality is exceptional, crystals are firmly attached, gold hardware is beautiful.",
        commentFr: "Achet\u00e9s pour les 40 ans de mon mari. Il \u00e9tait sans voix. Qualit\u00e9 exceptionnelle, cristaux bien fix\u00e9s, dorure superbe." },
      { name: "Kwame Asante", rating: 5, daysAgo: 43, verified: true,
        commentEn: "Serious luxury look for the price. The platform sole gives commanding presence and the crystal work is intricate. Perfect for weddings and events.",
        commentFr: "V\u00e9ritable look de luxe pour le prix. La semelle plateforme donne une pr\u00e9sence imposante et les cristaux sont d\u00e9taill\u00e9s. Parfait pour mariages et \u00e9v\u00e9nements." },
      { name: "Sophie Lefebvre", rating: 4, daysAgo: 65, verified: false,
        commentEn: "Really beautiful loafers. The Medusa detail is exactly like the runway pair. Only issue is they need breaking in, first day was tight. Now perfect.",
        commentFr: "Vraiment beaux mocassins. Le d\u00e9tail Medusa est identique \u00e0 la paire d\u00e9fil\u00e9. Le seul souci c\u2019est qu\u2019il faut les casser, premier jour serr\u00e9. Maintenant parfait." },
      { name: "Bola Ogunbanjo", rating: 5, daysAgo: 88, verified: true,
        commentEn: "Head-turners guaranteed. The crystal shine is next level and the chunky platform makes such a statement. Worth every naira for special occasions.",
        commentFr: "Regards garantis. L\u2019\u00e9clat des cristaux est incroyable et la plateforme \u00e9paisse est un vrai statement. Vaut chaque naira pour les occasions sp\u00e9ciales." },
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