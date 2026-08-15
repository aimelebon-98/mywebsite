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
    const sourceUrl = "https://i.ibb.co/G485SwJ8/Whats-App-Image-2026-08-13-at-12-36-14-PM.jpg";
    const slug = "adidas-handball-spezial-sage-pink";
    const slugFr = "basket-adidas-handball-spezial-sauge-rose";

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

    const costNgn = 22000;
    const sellingNgn = 28000;
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
          `products/adidas-handball-spezial-sage-pink-${Date.now()}.jpg`,
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
      { name: "Sage Green/Pink", image: imageUrl },
    ];

    const sizes = ["38", "39", "40", "41", "42", "43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["adidas", "handball-spezial", "spezial", "sneakers", "retro", "terrace", "sage-green", "pink", "abuja"];
    const tagsFr = ["adidas", "handball-spezial", "spezial", "baskets", "r\u00e9tro", "terrace", "vert-sauge", "rose", "abuja"];

    const longDescEn = `<p>Step into retro terrace heritage with the Adidas Handball Spezial in Sage Green and Pink. A cult-favorite silhouette born from indoor handball courts, now reimagined for the modern streetwear scene with this soft, sophisticated pastel palette.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium sage green suede upper with contrasting pink leather stripes</li>
  <li>Signature three-stripe branding in dusty pink</li>
  <li>Gold-embossed Adidas heel tab and "SPEZIAL" script</li>
  <li>Classic gum rubber outsole for grip and vintage vibes</li>
  <li>Low-profile terrace silhouette with cushioned collar</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Adidas Originals</td></tr>
  <tr><th>Model</th><td>Handball Spezial</td></tr>
  <tr><th>Colour</th><td>Sage Green / Pink / White</td></tr>
  <tr><th>Material</th><td>Suede + Leather Stripes + Gum Rubber</td></tr>
  <tr><th>Cushioning/Sole</th><td>Gum rubber outsole</td></tr>
  <tr><th>Signature Detail</th><td>Pink stripes + gold heel tab</td></tr>
  <tr><th>Closure</th><td>Flat lace-up</td></tr>
  <tr><th>Style</th><td>Retro terrace lifestyle</td></tr>
  <tr><th>Sizes</th><td>38 to 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Adidas Originals box, spare laces</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with straight-leg denim, wide-leg trousers, or a summer dress. The soft sage and pink palette makes these versatile for both casual daytime looks and elevated streetwear fits. A wardrobe staple with vintage soul.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Adoptez l\u2019h\u00e9ritage terrace r\u00e9tro avec la Adidas Handball Spezial en Vert Sauge et Rose. Une silhouette culte n\u00e9e des terrains de handball indoor, revisit\u00e9e pour la sc\u00e8ne streetwear moderne avec cette palette pastel douce et raffin\u00e9e.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en daim vert sauge premium avec bandes en cuir rose contrast\u00e9es</li>
  <li>Trois bandes signature en rose poudr\u00e9</li>
  <li>Tab talon Adidas dor\u00e9 estampill\u00e9 et inscription "SPEZIAL"</li>
  <li>Semelle ext\u00e9rieure en caoutchouc gomme classique pour adh\u00e9rence et style vintage</li>
  <li>Silhouette terrace basse avec col rembourr\u00e9</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Adidas Originals</td></tr>
  <tr><th>Mod\u00e8le</th><td>Handball Spezial</td></tr>
  <tr><th>Couleur</th><td>Vert Sauge / Rose / Blanc</td></tr>
  <tr><th>Mati\u00e8re</th><td>Daim + Bandes cuir + Caoutchouc gomme</td></tr>
  <tr><th>Amorti</th><td>Semelle caoutchouc gomme</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Bandes roses + tab talon dor\u00e9</td></tr>
  <tr><th>Fermeture</th><td>Lacets plats</td></tr>
  <tr><th>Style</th><td>Lifestyle terrace r\u00e9tro</td></tr>
  <tr><th>Tailles</th><td>38 \u00e0 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Adidas Originals, lacets de rechange</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un jean droit, un pantalon large ou une robe d\u2019\u00e9t\u00e9. La palette douce sauge et rose les rend polyvalentes pour les looks casual de jour comme pour les tenues streetwear \u00e9lev\u00e9es. Un incontournable avec une \u00e2me vintage.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Adidas Handball Spezial - Sage Green & Pink",
      nameFr: "Basket Adidas Handball Spezial - Vert Sauge et Rose",
      slug,
      slugFr,
      description: "Adidas Handball Spezial in Sage Green & Pink. Premium suede, pink three-stripes, gum sole. Retro terrace icon. Ships from Abuja.",
      descriptionFr: "Basket Adidas Handball Spezial en Vert Sauge et Rose. Daim premium, trois bandes roses, semelle gomme. Ic\u00f4ne terrace r\u00e9tro. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Adidas Handball Spezial in sage & pink. Suede upper, gum sole, retro terrace icon. Ships from Abuja.",
      shortDescriptionFr: "Adidas Handball Spezial sauge et rose. Daim, semelle gomme, ic\u00f4ne terrace r\u00e9tro. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Adidas",
      category: "sneakers",
      sku: "NDZ-ADS-SPZ-SP01",
      material: "Suede + Leather Stripes + Gum Rubber",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 20,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Adidas Handball Spezial Sage & Pink | New Deal Zone",
      seoTitleFr: "Basket Adidas Handball Spezial Sauge Rose | New Deal Zone",
      metaDescription: "Adidas Handball Spezial Sage Green & Pink. Premium suede, pink three-stripes, gum sole. Retro terrace icon. Fast delivery from Abuja.",
      metaDescriptionFr: "Basket Adidas Handball Spezial vert sauge et rose. Daim, bandes roses, semelle gomme. Livraison rapide depuis Abuja.",
      focusKeyphrase: "adidas handball spezial sage pink",
      focusKeyphraseFr: "adidas handball spezial sauge rose",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Adaeze Okafor", rating: 5, daysAgo: 7, verified: true,
        commentEn: "The sage and pink combo is stunning in person! Suede feels premium and gold heel tab is a beautiful detail. Delivered fast to Abuja.",
        commentFr: "La combinaison sauge et rose est magnifique en vrai! Le daim est premium et le tab talon dor\u00e9 est un beau d\u00e9tail. Livr\u00e9 rapidement \u00e0 Abuja." },
      { name: "Priscilla Boateng", rating: 5, daysAgo: 21, verified: true,
        commentEn: "So many compliments wearing these Spezials! The pastel colors are unique and everyone asks where I got them. True to size.",
        commentFr: "Tant de compliments quand je porte ces Spezial! Les couleurs pastel sont uniques et tout le monde demande o\u00f9 je les ai achet\u00e9es. Taille exacte." },
      { name: "Julie Lefebvre", rating: 5, daysAgo: 42, verified: true,
        commentEn: "Perfect retro sneaker for spring outfits. The gum sole gives amazing vintage vibes and they're comfy right out of the box.",
        commentFr: "Basket r\u00e9tro parfaite pour les tenues de printemps. La semelle gomme donne un super style vintage et elles sont confortables tout de suite." },
      { name: "Ngozi Adaora", rating: 4, daysAgo: 60, verified: false,
        commentEn: "Really beautiful shoes, love the color palette. Sizing is a bit snug at first but they break in nicely after a few wears.",
        commentFr: "Tr\u00e8s belles chaussures, j\u2019adore la palette. La taille est un peu serr\u00e9e au d\u00e9but mais elles se font apr\u00e8s quelques ports." },
      { name: "Awa Camara", rating: 5, daysAgo: 88, verified: true,
        commentEn: "Adidas Spezial in these colors is a dream. Quality suede, clean stitching, and they go with everything in my closet.",
        commentFr: "Les Adidas Spezial dans ces couleurs c\u2019est un r\u00eave. Daim de qualit\u00e9, coutures propres, et elles vont avec tout dans mon dressing." },
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