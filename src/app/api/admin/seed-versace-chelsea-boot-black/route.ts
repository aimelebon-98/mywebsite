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
    const sourceUrl = "https://i.ibb.co/jvP33myj/Whats-App-Image-2026-08-11-at-8-26-21-AM.jpg";
    const slug = "versace-medusa-chelsea-ankle-boot-black";
    const slugFr = "bottine-versace-medusa-chelsea-noir";

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
          `products/versace-medusa-chelsea-ankle-boot-black-${Date.now()}.jpg`,
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

    const sizes = ["42"];
    const images = [imageUrl];

    const tagsEn = ["versace", "medusa", "chelsea-boot", "boots", "formal", "leather", "designer", "luxury", "black", "italian", "abuja"];
    const tagsFr = ["versace", "medusa", "chelsea", "bottines", "formel", "cuir", "designer", "luxe", "noir", "italien", "abuja"];

    const longDescEn = `<p>Elevate every step with the Versace Medusa Chelsea Ankle Boot in Black \u2013 pure Italian minimalist luxury. Handcrafted from premium leather with the iconic silver Versace Medusa medallion, sleek square toe, and refined slim silhouette, this Chelsea boot is the epitome of understated designer power.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium smooth black genuine leather upper</li>
  <li>Signature silver-tone Versace Medusa hardware on lateral side</li>
  <li>Elastic side gussets for effortless slip-on wear</li>
  <li>Sharp modern square-toe silhouette</li>
  <li>Slim block heel for polished profile</li>
  <li>Rear pull tab for easy entry</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Versace</td></tr>
  <tr><th>Model</th><td>Medusa Chelsea Ankle Boot</td></tr>
  <tr><th>Colour</th><td>Black</td></tr>
  <tr><th>Material</th><td>Premium Leather + Leather Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Slim stacked block heel</td></tr>
  <tr><th>Signature Detail</th><td>Silver Medusa medallion + elastic gussets</td></tr>
  <tr><th>Closure</th><td>Slip-on elastic Chelsea</td></tr>
  <tr><th>Style</th><td>Luxury designer formal Chelsea boot</td></tr>
  <tr><th>Sizes</th><td>42 EU (single pair)</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Versace branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with slim-fit dress trousers, dark denim, or tailored suits for a razor-sharp business or evening look. The clean black leather and slim silhouette make these versatile enough for weddings, business meetings, or high-end nights out. The subtle Medusa hardware signals designer status without shouting.</p>
<p><strong>Only 1 pair available in size 42. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>\u00c9levez chaque pas avec la Bottine Versace Medusa Chelsea en Noir \u2013 pur luxe minimaliste italien. Fabriqu\u00e9e artisanalement en cuir premium avec le m\u00e9daillon Versace Medusa argent\u00e9 iconique, le bout carr\u00e9 \u00e9pur\u00e9 et la silhouette raffin\u00e9e mince, cette bottine Chelsea est l\u2019incarnation du pouvoir designer discret.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir v\u00e9ritable premium noir lisse</li>
  <li>M\u00e9daillon Versace Medusa argent\u00e9 signature sur le c\u00f4t\u00e9</li>
  <li>Soufflets \u00e9lastiques pour enfilage sans effort</li>
  <li>Silhouette moderne bout carr\u00e9 \u00e9pur\u00e9</li>
  <li>Talon bas mince pour un profil raffin\u00e9</li>
  <li>Languette arri\u00e8re pour un enfilage facile</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Versace</td></tr>
  <tr><th>Mod\u00e8le</th><td>Bottine Chelsea Medusa</td></tr>
  <tr><th>Couleur</th><td>Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir premium + Semelle cuir</td></tr>
  <tr><th>Amorti</th><td>Talon bas mince empil\u00e9</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>M\u00e9daillon Medusa argent + soufflets \u00e9lastiques</td></tr>
  <tr><th>Fermeture</th><td>Chelsea \u00e0 enfiler \u00e9lastique</td></tr>
  <tr><th>Style</th><td>Bottine Chelsea formelle designer de luxe</td></tr>
  <tr><th>Tailles</th><td>42 EU (paire unique)</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Versace, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon de ville ajust\u00e9, un jean fonc\u00e9 ou un costume sur mesure pour un look business ou soir\u00e9e tranchant. Le cuir noir \u00e9pur\u00e9 et la silhouette mince les rendent polyvalentes pour mariages, r\u00e9unions d\u2019affaires ou soir\u00e9es haut de gamme. Le m\u00e9daillon Medusa subtil signale un statut designer sans en faire trop.</p>
<p><strong>Une seule paire disponible en taille 42. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Versace Medusa Chelsea Ankle Boot - Black",
      nameFr: "Bottine Versace Medusa Chelsea - Noir",
      slug,
      slugFr,
      description: "Versace Medusa Chelsea Ankle Boot in Black. Premium leather, silver Medusa medallion, slim silhouette, square toe. Ships from Abuja.",
      descriptionFr: "Bottine Versace Medusa Chelsea en Noir. Cuir premium, m\u00e9daillon Medusa argent\u00e9, silhouette mince, bout carr\u00e9. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Versace Medusa Chelsea boot in black. Premium leather, silver medallion, sleek Italian design. Ships from Abuja.",
      shortDescriptionFr: "Bottine Versace Medusa Chelsea noire. Cuir premium, m\u00e9daillon argent, design italien \u00e9pur\u00e9. Exp\u00e9di\u00e9 de Abuja.",
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
      category: "boots",
      sku: "NDZ-VRS-CHB-BK01",
      material: "Premium Leather + Leather Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 1,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Versace Medusa Chelsea Ankle Boot Black | New Deal Zone",
      seoTitleFr: "Bottine Versace Medusa Chelsea Noir | New Deal Zone",
      metaDescription: "Versace Medusa Chelsea Ankle Boot in Black. Premium leather, silver Medusa medallion, sleek silhouette. Fast delivery from Abuja.",
      metaDescriptionFr: "Bottine Versace Medusa Chelsea noire. Cuir premium, m\u00e9daillon Medusa argent, silhouette \u00e9pur\u00e9e. Livraison rapide depuis Abuja.",
      focusKeyphrase: "versace chelsea boot",
      focusKeyphraseFr: "bottine versace chelsea",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Adeboye Ogunlesi", rating: 5, daysAgo: 6, verified: true,
        commentEn: "Versace Chelsea boots in black are timeless! The Medusa medallion is subtle but tells everyone this is designer. Perfect for business wear.",
        commentFr: "Les bottines Versace Chelsea noires sont intemporelles! Le m\u00e9daillon Medusa est subtil mais tout le monde reconna\u00eet le designer. Parfait pour le business." },
      { name: "Sarah Elizabeth", rating: 5, daysAgo: 23, verified: true,
        commentEn: "Bought for my husband\u2019s work wardrobe. He wears them 3 times a week and gets compliments every time. Quality is exceptional.",
        commentFr: "Achet\u00e9es pour la garde-robe de mon mari. Il les porte 3 fois par semaine et re\u00e7oit des compliments \u00e0 chaque fois. Qualit\u00e9 exceptionnelle." },
      { name: "Kunle Adebayo", rating: 5, daysAgo: 46, verified: true,
        commentEn: "Sleek and refined Chelsea. The leather is smooth premium quality and the silver Medusa is elegant. Perfect with a suit for weddings.",
        commentFr: "Chelsea \u00e9pur\u00e9es et raffin\u00e9es. Le cuir est lisse premium et la Medusa argent\u00e9e est \u00e9l\u00e9gante. Parfait avec un costume pour les mariages." },
      { name: "Awa Diallo", rating: 4, daysAgo: 68, verified: false,
        commentEn: "Beautiful Versace boots, love the classic look. Sizing was accurate for me. Would give 5 stars but the boot needed some breaking in initially.",
        commentFr: "Belles bottines Versace, j\u2019adore le look classique. Taille exacte pour moi. J\u2019aurais mis 5 \u00e9toiles mais il fallait un peu les casser au d\u00e9but." },
      { name: "Michael Chen", rating: 5, daysAgo: 91, verified: true,
        commentEn: "Best formal Chelsea boot I own. Slim silhouette works with everything from suits to smart casual jeans. Medusa detail is chef\u2019s kiss.",
        commentFr: "Meilleure Chelsea formelle que j\u2019ai. La silhouette mince va avec tout, du costume au jean smart casual. Le d\u00e9tail Medusa est parfait." },
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