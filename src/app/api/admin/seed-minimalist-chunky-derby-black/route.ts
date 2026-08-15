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
    const sourceUrl = "https://i.ibb.co/rhB8CcS/Whats-App-Image-2026-08-11-at-8-26-31-AM-1.jpg";
    const slug = "minimalist-chunky-platform-derby-black-glossy";
    const slugFr = "derby-plateforme-minimaliste-noir-brillant";

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
          `products/minimalist-chunky-platform-derby-black-${Date.now()}.jpg`,
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
      { name: "Glossy Black", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["derby", "chunky", "platform", "minimalist", "formal", "streetwear", "black", "glossy", "leather", "abuja"];
    const tagsFr = ["derby", "\u00e9paisses", "plateforme", "minimaliste", "formel", "streetwear", "noir", "brillant", "cuir", "abuja"];

    const longDescEn = `<p>Elevate your everyday with the Minimalist Chunky Platform Derby in Glossy Black \u2013 a clean, no-nonsense design that lets bold proportions do all the talking. High-shine polished leather meets a commanding chunky lug platform sole for the ultimate blend of formal polish and streetwear attitude.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium glazed high-shine black leather upper</li>
  <li>Clean minimalist design with no visible hardware or branding</li>
  <li>Chunky rubber lug platform sole for height and grip</li>
  <li>Modern rounded silhouette</li>
  <li>Traditional 3-eyelet derby lace-up with tonal black laces</li>
  <li>Padded collar for all-day wear comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Prestige</td></tr>
  <tr><th>Model</th><td>Minimalist Chunky Platform Derby</td></tr>
  <tr><th>Colour</th><td>Glossy Black</td></tr>
  <tr><th>Material</th><td>Glazed Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>Clean minimalist high-shine finish</td></tr>
  <tr><th>Closure</th><td>3-eyelet derby lace-up</td></tr>
  <tr><th>Style</th><td>Chunky platform derby / streetwear formal</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Branded box, shoehorn</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with grey denim, cropped chinos, wool trousers, or tapered suits for effortless smart-casual style. The minimalist high-shine black works with every color palette in your wardrobe. The chunky sole adds street cred to formal fits and instant polish to casual looks.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Rehaussez votre quotidien avec le Derby Plateforme Minimaliste en Noir Brillant \u2013 un design \u00e9pur\u00e9 et sans fioritures qui laisse les proportions audacieuses parler d\u2019elles-m\u00eames. Le cuir poli haute brillance rencontre une semelle plateforme \u00e9paisse imposante en caoutchouc crampons\u00e9 pour le m\u00e9lange ultime d\u2019\u00e9l\u00e9gance formelle et d\u2019attitude streetwear.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir gla\u00e7\u00e9 haute brillance noir premium</li>
  <li>Design minimaliste \u00e9pur\u00e9 sans ferrure ni branding visible</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour hauteur et adh\u00e9rence</li>
  <li>Silhouette moderne arrondie</li>
  <li>Lacet derby traditionnel \u00e0 3 \u0153illets avec lacets noirs ton sur ton</li>
  <li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Prestige</td></tr>
  <tr><th>Mod\u00e8le</th><td>Derby Plateforme Minimaliste</td></tr>
  <tr><th>Couleur</th><td>Noir Brillant</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir gla\u00e7\u00e9 + Semelle caoutchouc crampons\u00e9e</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc crampons\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Finition minimaliste haute brillance \u00e9pur\u00e9e</td></tr>
  <tr><th>Fermeture</th><td>Derby \u00e0 3 \u0153illets</td></tr>
  <tr><th>Style</th><td>Derby plateforme / streetwear formel</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque, chausse-pied</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un jean gris, un chino court, un pantalon en laine ou un costume fusel\u00e9 pour un style smart-casual sans effort. Le noir minimaliste haute brillance fonctionne avec chaque palette de couleurs de votre garde-robe. La semelle \u00e9paisse ajoute une touche street aux tenues formelles et une \u00e9l\u00e9gance instantan\u00e9e aux looks casual.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Minimalist Chunky Platform Derby - Glossy Black",
      nameFr: "Derby Plateforme Minimaliste - Noir Brillant",
      slug,
      slugFr,
      description: "Minimalist Chunky Platform Derby in Glossy Black. Clean glazed leather upper, chunky rubber lug platform sole. Ships from Abuja.",
      descriptionFr: "Derby Plateforme Minimaliste en Noir Brillant. Cuir gla\u00e7\u00e9 \u00e9pur\u00e9, semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Minimalist chunky platform derby in glossy black. Clean glazed leather, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Derby plateforme minimaliste noir brillant. Cuir gla\u00e7\u00e9 \u00e9pur\u00e9, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
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
      sku: "NDZ-PRE-MPD-BK01",
      material: "Glazed Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 15,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: false,
      seoTitle: "Minimalist Chunky Platform Derby Black | New Deal Zone",
      seoTitleFr: "Derby Plateforme Minimaliste Noir | New Deal Zone",
      metaDescription: "Minimalist Chunky Platform Derby in Glossy Black. Glazed leather upper, chunky rubber lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Derby plateforme minimaliste noir brillant. Cuir gla\u00e7\u00e9, semelle \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "minimalist platform derby",
      focusKeyphraseFr: "derby plateforme minimaliste",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Emeka Adeboye", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These minimalist derbys are exactly what I needed! Clean glossy finish, chunky sole gives modern edge without being too much. Perfect for daily wear.",
        commentFr: "Ces derbys minimalistes sont exactement ce qu\u2019il me fallait! Finition brillante \u00e9pur\u00e9e, semelle \u00e9paisse qui donne un c\u00f4t\u00e9 moderne sans en faire trop. Parfait pour tous les jours." },
      { name: "Grace Owusu", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought for my husband. He loves how versatile they are - can wear them with jeans or suits. Glossy leather looks premium, chunky sole is very comfortable.",
        commentFr: "Achet\u00e9s pour mon mari. Il adore leur polyvalence - peut les porter avec jean ou costume. Le cuir brillant est premium, la semelle \u00e9paisse est tr\u00e8s confortable." },
      { name: "Adeboye Ogundipe", rating: 5, daysAgo: 45, verified: true,
        commentEn: "Perfect no-nonsense derby. Clean design lets the chunky sole do the talking. High-shine finish stays clean easily. Great for both office and evenings.",
        commentFr: "Derby \u00e9pur\u00e9 parfait. Le design \u00e9pur\u00e9 laisse la semelle \u00e9paisse parler. La finition brillante reste propre facilement. Super pour le bureau et le soir." },
      { name: "Amadou Diallo", rating: 4, daysAgo: 65, verified: false,
        commentEn: "Really nice glossy derbys, sizing was accurate. Only issue is they need a few days to break in but once broken in they\u2019re super comfortable to walk in.",
        commentFr: "Vraiment beaux derbys brillants, taille exacte. Le seul souci c\u2019est qu\u2019il faut quelques jours pour les casser mais une fois cass\u00e9s ils sont super confortables." },
      { name: "Kofi Boateng", rating: 5, daysAgo: 88, verified: true,
        commentEn: "Best minimalist chunky derby I own. The high-shine catches light beautifully and the sole is heavy premium quality. Highly recommend for any wardrobe.",
        commentFr: "Meilleur derby chunky minimaliste que j\u2019ai. La haute brillance capte la lumi\u00e8re et la semelle est premium. Je recommande pour toute garde-robe." },
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