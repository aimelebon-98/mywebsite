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
    const ratesRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
    const ratesData = await ratesRes.json();
    const NGN_RATE = Number(ratesData.rates.NGN) || 1500;
    const XOF_RATE = Number(ratesData.rates.XOF) || 620;

    const costNgn = 35000;
    const sellingNgn = 45000;
    const compareNgn = 55000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "tommy-hilfiger-retro-runner-leather-sneaker";
    const slugFr = "sneaker-tommy-hilfiger-retro-runner-cuir";
    const sourceUrl = "https://i.ibb.co/mCjWfKBg/Whats-App-Image-2026-08-09-at-10-10-54-AM-1.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/tommy-hilfiger-retro-runner-leather-sneaker-${Date.now()}.jpg`,
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
    }
    await db.delete(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));

    const nameEn = "Tommy Hilfiger Retro Runner Leather Sneaker - Tan & Black";
    const nameFr = "Sneaker Tommy Hilfiger Retro Runner Cuir - Tan et Noir";

    const shortDescEn = "Tommy Hilfiger retro runner sneaker in premium leather with signature red-white-blue flag branding, suede overlays, and white cushioned cupsole. Two colorways. Ships from Abuja.";
    const shortDescFr = "Sneaker Tommy Hilfiger retro runner en cuir premium avec branding drapeau rouge-blanc-bleu signature, overlays su\u00e9d\u00e9s et semelle cupsole blanche rembourr\u00e9e. Deux coloris. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Run into classic Americana with the <strong>Tommy Hilfiger Retro Runner Leather Sneaker</strong>. Channeling '80s athletic heritage with modern lifestyle refinement, this runner features premium smooth leather uppers with contrasting suede toe and heel overlays, the iconic Tommy Hilfiger red-white-blue flag on the side panel, and a cushioned white cupsole with red heel accent. Available in two colorways: Rich Tan Brown or classic Triple Black. Choose the vibe that fits your rotation.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Premium smooth leather upper</strong> with contrast suede overlays</li>
<li><strong>Iconic Tommy Hilfiger flag patch</strong> on the side panel</li>
<li><strong>Cushioned white cupsole</strong> with signature red heel accent stripe</li>
<li><strong>Retro runner silhouette</strong> - '80s Americana energy</li>
<li><strong>Padded collar and tongue</strong> with reinforced heel counter</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Tommy Hilfiger</td></tr>
<tr><td><strong>Model</strong></td><td>Retro Runner Leather Sneaker</td></tr>
<tr><td><strong>Colours</strong></td><td>Tan Brown / Triple Black</td></tr>
<tr><td><strong>Material</strong></td><td>Smooth Leather + Suede Overlays + Rubber</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Padded Insole + Cushioned Cupsole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Red-White-Blue Flag Patch + Red Heel Stripe</td></tr>
<tr><td><strong>Closure</strong></td><td>Lace-Up (Tonal Waxed Laces)</td></tr>
<tr><td><strong>Style</strong></td><td>Retro Lifestyle Runner</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Tommy Hilfiger Box + Tags + Care Card</td></tr>
</table>

<h3>How to Style</h3>
<p>The <strong>Tan Brown</strong> pairs beautifully with olive chinos, dark denim, cream trousers, and casual button-downs for classic prep-Americana. The <strong>Triple Black</strong> variant works with everything from monochrome black fits to street-casual cargo pants. Both colorways carry the same nostalgic Tommy energy - '80s athletic without trying too hard. Perfect for daily wear, travel days, and weekend errands.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Classic Americana, delivered.</p>`;

    const longDescFr = `<p>Courez dans l'Americana classique avec la <strong>Sneaker Tommy Hilfiger Retro Runner en Cuir</strong>. Canalisant l'h\u00e9ritage athl\u00e9tique des ann\u00e9es 80 avec un raffinement lifestyle moderne, cette runner pr\u00e9sente des tiges en cuir lisse premium avec des overlays contrastants en su\u00e8de \u00e0 la pointe et au talon, le drapeau ic\u00f4nique Tommy Hilfiger rouge-blanc-bleu sur le panneau lat\u00e9ral, et une semelle cupsole blanche rembourr\u00e9e avec accent rouge au talon. Disponible en deux coloris: Tan Marron riche ou Noir Total classique. Choisissez l'ambiance qui correspond \u00e0 votre rotation.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir lisse premium</strong> avec overlays contrastants en su\u00e8de</li>
<li><strong>Patch drapeau Tommy Hilfiger ic\u00f4nique</strong> sur le panneau lat\u00e9ral</li>
<li><strong>Semelle cupsole blanche rembourr\u00e9e</strong> avec bande d'accent rouge au talon signature</li>
<li><strong>Silhouette retro runner</strong> - \u00e9nergie Americana ann\u00e9es 80</li>
<li><strong>Col et languette rembourr\u00e9s</strong> avec contrefort de talon renforc\u00e9</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Tommy Hilfiger</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Sneaker Retro Runner Cuir</td></tr>
<tr><td><strong>Couleurs</strong></td><td>Tan Marron / Noir Total</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Lisse + Overlays Su\u00e9d\u00e9s + Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Cupsole</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Patch Drapeau Rouge-Blanc-Bleu + Bande Rouge Talon</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage (Lacets Cir\u00e9s Ton sur Ton)</td></tr>
<tr><td><strong>Style</strong></td><td>Runner Lifestyle Retro</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Tommy Hilfiger Originale + \u00c9tiquettes + Carte d'Entretien</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Le <strong>Tan Marron</strong> s'associe magnifiquement avec un chino olive, un jean fonc\u00e9, un pantalon cr\u00e8me et des chemises boutonn\u00e9es casual pour un prep-Americana classique. La variante <strong>Noir Total</strong> fonctionne avec tout, des tenues noires monochromes aux pantalons cargo street-casual. Les deux coloris portent la m\u00eame \u00e9nergie nostalgique Tommy - athl\u00e9tique ann\u00e9es 80 sans en faire trop. Parfait pour le port quotidien, les jours de voyage et les commissions du week-end.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Americana classique, livr\u00e9.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [
      { name: "Tan Brown", image: imageUrl },
      { name: "Triple Black", image: imageUrl }
    ];
    const tagsEn = ["tommy hilfiger", "retro runner", "leather sneaker", "tan brown", "black", "americana", "flag logo", "sneakers", "abuja"];
    const tagsFr = ["tommy hilfiger", "retro runner", "sneaker cuir", "tan marron", "noir", "americana", "logo drapeau", "baskets", "abuja"];

    const [product] = await db.insert(products).values({
      name: nameEn,
      nameFr: nameFr,
      slug: slug,
      slugFr: slugFr,
      description: shortDescEn,
      shortDescription: shortDescEn,
      longDescription: longDescEn,
      descriptionFr: shortDescFr,
      shortDescriptionFr: shortDescFr,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgnSnap.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      sku: "NDZ-TH-RRN-TB01",
      category: "sneakers",
      brand: "Tommy Hilfiger",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Leather + Suede + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Tommy Hilfiger Retro Runner Leather Sneaker Tan Black | New Deal Zone",
      seoTitleFr: "Sneaker Tommy Hilfiger Retro Runner Cuir Tan Noir | New Deal Zone",
      metaDescription: "Shop the Tommy Hilfiger retro runner sneaker in premium leather with red-white-blue flag branding. Choose Tan Brown or Triple Black. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sneaker Tommy Hilfiger retro runner en cuir premium avec branding drapeau rouge-blanc-bleu. Choisissez Tan Marron ou Noir Total. Livraison rapide depuis Abuja.",
      focusKeyphrase: "tommy hilfiger retro runner",
      focusKeyphraseFr: "sneaker tommy hilfiger retro runner",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Yusuf Adaora", rating: 5, comment: "Bought the tan brown and it is stunning - the suede overlays and leather panels catch light differently. The Tommy flag patch is embroidered cleanly. Delivery to Abuja was quick.", commentFr: "J'ai achet\u00e9 le tan marron et il est magnifique - les overlays su\u00e9d\u00e9s et les panneaux en cuir attrapent la lumi\u00e8re diff\u00e9remment. Le patch drapeau Tommy est brod\u00e9 proprement. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 8 },
      { customerName: "Isabelle Chen", rating: 5, comment: "Got the black version for my brother and he loves them. Perfect retro runner silhouette, cushioned cupsole is comfortable for long walks, and the red heel accent is a great detail. Real Tommy quality.", commentFr: "J'ai pris la version noire pour mon fr\u00e8re et il les adore. Silhouette retro runner parfaite, la semelle cupsole rembourr\u00e9e est confortable pour de longues marches, et l'accent rouge au talon est un excellent d\u00e9tail. Vraie qualit\u00e9 Tommy.", verified: true, daysAgo: 22 },
      { customerName: "Osei Diallo", rating: 4, comment: "Really solid sneakers and both colorways look premium in person. Only reason for 4 stars is the waxed laces are a bit slippery at first - they hold once you get a proper knot going.", commentFr: "Sneakers vraiment solides et les deux coloris ont l'air premium en vrai. La seule raison des 4 \u00e9toiles est que les lacets cir\u00e9s sont un peu glissants au d\u00e9but - ils tiennent une fois qu'on fait un bon noeud.", verified: true, daysAgo: 40 },
      { customerName: "Camille Rousseau", rating: 5, comment: "The tan brown pairs so well with everything from chinos to jeans and the cushioned insole is genuinely comfortable. Original Tommy box with tags and care card came included. Full authentic experience.", commentFr: "Le tan marron s'accorde tellement bien avec tout du chino au jean et la semelle rembourr\u00e9e est vraiment confortable. La bo\u00eete Tommy originale avec \u00e9tiquettes et carte d'entretien est venue incluse. Exp\u00e9rience authentique compl\u00e8te.", verified: false, daysAgo: 63 },
    ];

    for (const rev of reviewsData) {
      await db.insert(reviews).values({
        productId: product.id,
        customerName: rev.customerName,
        avatar: getInitials(rev.customerName),
        rating: rev.rating,
        comment: rev.comment,
        commentFr: rev.commentFr,
        verified: rev.verified,
        createdAt: new Date(now - rev.daysAgo * day),
      });
    }

    const totalRating = reviewsData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewsData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Tommy Hilfiger Retro Runner (Tan + Black) seeded successfully",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: {
        costNgn, sellingNgn, compareNgn,
        costUsd, sellingUsd, compareUsd,
        costNgnSnapshot: costNgnSnap,
        profitNgn, marginPct,
        ngnRate: NGN_RATE, xofRate: XOF_RATE,
      },
      reviews: {
        count: reviewsData.length,
        avg: avgRating,
        breakdown: { five: reviewsData.filter(r => r.rating === 5).length, four: reviewsData.filter(r => r.rating === 4).length },
      },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}