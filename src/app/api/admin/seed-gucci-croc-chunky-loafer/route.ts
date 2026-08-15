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
    const sourceUrl = "https://i.ibb.co/DHKTM6Xt/Whats-App-Image-2026-08-11-at-8-26-39-AM.jpg";
    const slug = "gucci-croc-chunky-penny-loafer-black";
    const slugFr = "mocassin-gucci-croco-plateforme-noir";

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

    const costNgn = 35000;
    const sellingNgn = 42000;
    const compareNgn = 48000;

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
          `products/gucci-croc-chunky-penny-loafer-black-${Date.now()}.jpg`,
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
      { name: "Black", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["gucci", "loafer", "penny-loafer", "croc-embossed", "chunky", "platform", "formal", "leather", "designer", "luxury", "black", "abuja"];
    const tagsFr = ["gucci", "mocassin", "penny", "croco", "\u00e9paisses", "plateforme", "formel", "cuir", "designer", "luxe", "noir", "abuja"];

    const longDescEn = `<p>Command every step with the Gucci Chunky Croc-Embossed Penny Loafer in Black \u2013 Italian craftsmanship elevated with bold streetwear proportions. Featuring a smooth leather vamp, croc-embossed penny saddle, and a commanding chunky lug sole bearing the iconic GUCCI-embossed tread, this loafer transforms every outfit into a designer statement.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium smooth black leather upper</li>
  <li>Signature croc-embossed leather penny keeper saddle</li>
  <li>Chunky rubber lug outsole with GUCCI-embossed tread pattern</li>
  <li>Classic penny loafer slip-on construction</li>
  <li>Gold-tone GUCCI branding on padded leather insole</li>
  <li>Reinforced heel counter for lasting shape</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Gucci</td></tr>
  <tr><th>Model</th><td>Chunky Croc-Embossed Penny Loafer</td></tr>
  <tr><th>Colour</th><td>Black</td></tr>
  <tr><th>Material</th><td>Smooth + Croc-Embossed Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug with GUCCI tread</td></tr>
  <tr><th>Signature Detail</th><td>Croc-embossed saddle + GUCCI sole</td></tr>
  <tr><th>Closure</th><td>Slip-on penny loafer</td></tr>
  <tr><th>Style</th><td>Luxury designer chunky loafer</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Gucci branded box, dust bag, authenticity card</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with tailored suits, cropped chinos, or wide-leg denim to spotlight the chunky sole. The croc-embossed saddle adds unmistakable texture and designer recognition, while the GUCCI-embossed tread turns every step into a statement. Perfect for business meetings, weddings, and elevated everyday wear.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Imposez chaque pas avec le Mocassin Gucci Penny Croco Plateforme en Noir \u2013 le savoir-faire italien \u00e9lev\u00e9 par des proportions streetwear audacieuses. Avec son empeigne en cuir lisse, sa bride penny croco et sa semelle crampons\u00e9e imposante portant l\u2019iconique motif GUCCI estampill\u00e9, ce mocassin transforme chaque tenue en d\u00e9claration designer.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir lisse noir premium</li>
  <li>Bride penny en cuir croco estampill\u00e9 signature</li>
  <li>Semelle ext\u00e9rieure caoutchouc crampons\u00e9e avec motif GUCCI estampill\u00e9</li>
  <li>Construction mocassin penny \u00e0 enfiler classique</li>
  <li>Branding GUCCI dor\u00e9 sur semelle int\u00e9rieure cuir rembourr\u00e9e</li>
  <li>Contrefort renforc\u00e9 pour une tenue durable</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Gucci</td></tr>
  <tr><th>Mod\u00e8le</th><td>Mocassin Penny Croco Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir lisse + Croco estampill\u00e9 + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Semelle \u00e9paisse crampons\u00e9e avec motif GUCCI</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Bride croco + semelle GUCCI</td></tr>
  <tr><th>Fermeture</th><td>Mocassin penny \u00e0 enfiler</td></tr>
  <tr><th>Style</th><td>Mocassin designer de luxe \u00e9pais</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Gucci, sac \u00e0 poussi\u00e8re, carte d\u2019authenticit\u00e9</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un costume sur mesure, un chino court ou un jean large pour mettre en valeur la semelle \u00e9paisse. La bride croco ajoute une texture ind\u00e9niable et une reconnaissance designer, tandis que la semelle estampill\u00e9e GUCCI fait de chaque pas une d\u00e9claration. Parfait pour les r\u00e9unions d\u2019affaires, mariages et port quotidien \u00e9lev\u00e9.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Gucci Chunky Croc-Embossed Penny Loafer - Black",
      nameFr: "Mocassin Gucci Penny Croco Plateforme - Noir",
      slug,
      slugFr,
      description: "Gucci Chunky Penny Loafer in Black. Smooth leather with croc-embossed saddle, GUCCI-embossed chunky lug sole. Ships from Abuja.",
      descriptionFr: "Mocassin Gucci Penny en Noir. Cuir lisse avec bride croco estampill\u00e9e, semelle \u00e9paisse GUCCI. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Gucci chunky penny loafer in black. Smooth + croc-embossed leather, GUCCI lug sole. Ships from Abuja.",
      shortDescriptionFr: "Mocassin Gucci penny \u00e9pais noir. Cuir lisse et croco, semelle GUCCI. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Gucci",
      category: "formal",
      sku: "NDZ-GUC-LFR-BK01",
      material: "Smooth + Croc-Embossed Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 12,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Gucci Chunky Croc Penny Loafer Black | New Deal Zone",
      seoTitleFr: "Mocassin Gucci Penny Croco Plateforme Noir | New Deal Zone",
      metaDescription: "Gucci Chunky Croc-Embossed Penny Loafer in Black. Smooth leather vamp, croc saddle, GUCCI lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Mocassin Gucci Penny croco plateforme noir. Cuir lisse et croco, semelle GUCCI. Livraison rapide depuis Abuja.",
      focusKeyphrase: "gucci chunky penny loafer",
      focusKeyphraseFr: "mocassin gucci penny plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Nnamdi Adeboye", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These Gucci loafers are absolute fire! The GUCCI-embossed sole is a genius detail and the croc saddle adds so much texture. Fast Abuja delivery.",
        commentFr: "Ces mocassins Gucci sont incroyables! La semelle estampill\u00e9e GUCCI est un d\u00e9tail g\u00e9nial et la bride croco ajoute tellement de texture. Livraison rapide Abuja." },
      { name: "Grace Ansah", rating: 5, daysAgo: 21, verified: true,
        commentEn: "Bought for my husband\u2019s promotion celebration. He loves them! Quality leather, chunky sole is comfortable, gold Gucci branding inside is beautiful.",
        commentFr: "Achet\u00e9s pour la promotion de mon mari. Il les adore! Cuir de qualit\u00e9, semelle \u00e9paisse confortable, le branding Gucci dor\u00e9 \u00e0 l\u2019int\u00e9rieur est magnifique." },
      { name: "David Chen", rating: 5, daysAgo: 44, verified: true,
        commentEn: "Wore these to a business gala and got endless compliments. The croc penny detail is unique and the chunky sole gives commanding presence. Legit.",
        commentFr: "Port\u00e9s pour un gala d\u2019affaires et compliments sans fin. Le d\u00e9tail penny croco est unique et la semelle \u00e9paisse donne une pr\u00e9sence imposante. Authentique." },
      { name: "Awa Toure", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Really quality Gucci loafers, love the design. Sizing was accurate but takes about a week to break in the leather. Once broken in, super comfy.",
        commentFr: "Mocassins Gucci de vraie qualit\u00e9, j\u2019adore le design. Taille exacte mais il faut environ une semaine pour casser le cuir. Une fois cass\u00e9s, super confortables." },
      { name: "Ibrahim Diallo", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Best luxury loafer purchase this year. GUCCI sole imprint is chef\u2019s kiss and the mix of smooth + croc leather is elegant. Worth every naira.",
        commentFr: "Meilleur achat mocassin de luxe cette ann\u00e9e. La semelle GUCCI estampill\u00e9e est parfaite et le m\u00e9lange cuir lisse + croco est \u00e9l\u00e9gant. Vaut chaque naira." },
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