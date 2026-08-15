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
    const sourceUrl = "https://i.ibb.co/PGhbRf2T/Whats-App-Image-2026-08-11-at-8-26-33-AM.jpg";
    const slug = "croc-panel-chunky-platform-derby-black";
    const slugFr = "derby-croco-plateforme-noir";

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
    const compareNgn = 52000;

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
          `products/croc-panel-chunky-platform-derby-black-${Date.now()}.jpg`,
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
      { name: "Black Glossy", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["derby", "chunky", "platform", "croc-embossed", "patent-leather", "formal", "streetwear", "black", "abuja"];
    const tagsFr = ["derby", "\u00e9paisses", "plateforme", "croco", "cuir-verni", "formel", "streetwear", "noir", "abuja"];

    const longDescEn = `<p>Make a bold entrance with the Croc-Panel Chunky Platform Derby in Glossy Black \u2013 a modern dress shoe that fuses formal derby tailoring with commanding streetwear proportions. Featuring high-shine patent leather panels contrasted with croc-embossed side saddles, and a chunky rubber lug platform sole for standout height.</p>
<h3>Key Features</h3>
<ul>
  <li>Glossy black patent leather toe box and heel counter</li>
  <li>Contrasting croc-embossed leather side saddle panels</li>
  <li>Chunky rubber lug platform sole for height and grip</li>
  <li>Modern square-toe silhouette</li>
  <li>Traditional 4-eyelet derby lace-up with tonal laces</li>
  <li>Padded collar for all-day wear comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Prestige</td></tr>
  <tr><th>Model</th><td>Croc-Panel Chunky Platform Derby</td></tr>
  <tr><th>Colour</th><td>Black Glossy</td></tr>
  <tr><th>Material</th><td>Patent + Croc-Embossed Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>Patent + croc mixed panels</td></tr>
  <tr><th>Closure</th><td>4-eyelet derby lace-up</td></tr>
  <tr><th>Style</th><td>Chunky platform derby / streetwear formal</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Branded box, shoehorn</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with tapered dress trousers, cropped wool suits, or wide-leg denim to spotlight the chunky sole. The mix of glossy patent and matte croc textures adds visual depth, making these versatile for creative business meetings, weddings, evening events, or bold streetwear moments.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Faites une entr\u00e9e audacieuse avec le Derby Croco Plateforme en Noir Brillant \u2013 une chaussure habill\u00e9e moderne qui fusionne le tailoring derby formel avec des proportions streetwear imposantes. Avec ses panneaux en cuir verni haute brillance contrast\u00e9s de brides c\u00f4t\u00e9s en cuir croco estampill\u00e9, et sa semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour une hauteur qui se remarque.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Bout et talon en cuir verni noir brillant</li>
  <li>Brides c\u00f4t\u00e9 contrast\u00e9es en cuir croco estampill\u00e9</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour hauteur et adh\u00e9rence</li>
  <li>Silhouette moderne bout carr\u00e9</li>
  <li>Lacet derby traditionnel \u00e0 4 \u0153illets avec lacets ton sur ton</li>
  <li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Prestige</td></tr>
  <tr><th>Mod\u00e8le</th><td>Derby Croco Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir Brillant</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir verni + Croco estampill\u00e9 + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc crampons\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Panneaux verni + croco m\u00e9lang\u00e9s</td></tr>
  <tr><th>Fermeture</th><td>Derby \u00e0 4 \u0153illets</td></tr>
  <tr><th>Style</th><td>Derby plateforme / streetwear formel</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque, chausse-pied</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon habill\u00e9 fusel\u00e9, un costume en laine court ou un jean large pour mettre en valeur la semelle \u00e9paisse. Le m\u00e9lange de textures verni brillant et croco mat ajoute une profondeur visuelle, les rendant polyvalents pour les r\u00e9unions business cr\u00e9atives, mariages, \u00e9v\u00e9nements du soir ou moments streetwear audacieux.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Croc-Panel Chunky Platform Derby - Black Glossy",
      nameFr: "Derby Croco Plateforme - Noir Brillant",
      slug,
      slugFr,
      description: "Croc-Panel Chunky Platform Derby in Glossy Black. Patent + croc-embossed leather panels, chunky lug platform sole. Ships from Abuja.",
      descriptionFr: "Derby Croco Plateforme en Noir Brillant. Panneaux verni et croco estampill\u00e9, semelle plateforme \u00e9paisse. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Croc-panel chunky platform derby in glossy black. Patent + croc leather, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Derby croco plateforme noir brillant. Cuir verni et croco, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Prestige",
      category: "formal",
      sku: "NDZ-PRE-DBY-BK01",
      material: "Patent + Croc-Embossed Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 15,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Croc-Panel Chunky Platform Derby Black | New Deal Zone",
      seoTitleFr: "Derby Croco Plateforme Noir Brillant | New Deal Zone",
      metaDescription: "Croc-Panel Chunky Platform Derby in Glossy Black. Patent + croc leather mix, chunky lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Derby croco plateforme noir brillant. M\u00e9lange cuir verni et croco, semelle \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "chunky platform derby",
      focusKeyphraseFr: "derby croco plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Emeka Ogundipe", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These derbys are absolute heat! The mix of patent and croc leather is unique and the chunky sole gives serious presence. Fast Abuja delivery.",
        commentFr: "Ces derbys sont incroyables! Le m\u00e9lange verni et croco est unique et la semelle \u00e9paisse donne une vraie pr\u00e9sence. Livraison rapide Abuja." },
      { name: "Awa Kone", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought for my husband\u2019s birthday. Absolutely stunning shoes! Glossy patent shines beautifully and the croc panels add texture. Comfortable too.",
        commentFr: "Achet\u00e9s pour l\u2019anniversaire de mon mari. Chaussures absolument magnifiques! Le verni brille et les panneaux croco ajoutent de la texture. Confortables aussi." },
      { name: "Nnamdi Adeboye", rating: 5, daysAgo: 44, verified: true,
        commentEn: "Wore these to a wedding, got compliments all night. The square toe is modern, chunky sole gives commanding height. Worth every naira.",
        commentFr: "Port\u00e9es \u00e0 un mariage, compliments toute la soir\u00e9e. Le bout carr\u00e9 est moderne, la semelle \u00e9paisse donne une hauteur imposante. Vaut chaque naira." },
      { name: "Julie Girard", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Beautiful shoes, love the platform. Sizing was accurate but they need a couple days to break in. Once broken in, super comfortable to walk in.",
        commentFr: "Belles chaussures, j\u2019adore la plateforme. Taille exacte mais il faut quelques jours pour les casser. Une fois cass\u00e9es, super confortables \u00e0 porter." },
      { name: "Kunle Adebayo", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Best formal shoes I own now. The chunky sole makes them stand out from regular dress shoes and the mixed leather textures are premium. Recommend.",
        commentFr: "Meilleures chaussures habill\u00e9es que j\u2019ai. La semelle \u00e9paisse les distingue des chaussures habill\u00e9es normales et les textures cuir m\u00e9lang\u00e9es sont premium. Je recommande." },
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