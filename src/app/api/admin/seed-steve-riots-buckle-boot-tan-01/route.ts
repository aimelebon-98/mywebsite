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

    const costNgn = 65000;
    const sellingNgn = 85000;
    const compareNgn = 95000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "steve-riots-buckle-brogue-ankle-boot-tan";
    const slugFr = "bottine-steve-riots-boucle-brogue-tan";
    const sourceUrl = "https://i.ibb.co/Xxf8VvCH/Whats-App-Image-2026-08-09-at-10-11-06-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/steve-riots-buckle-brogue-ankle-boot-tan-${Date.now()}.jpg`,
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

    const nameEn = "Steve Riots Buckle Brogue Ankle Boot - Tan Burnished Leather";
    const nameFr = "Bottine Steve Riots Boucle Brogue - Cuir Tan Patin\u00e9";

    const shortDescEn = "Steve Riots ankle boot in hand-burnished tan leather with side buckle, brogue perforations, and inner zip. Formal Chelsea silhouette. Ships from Abuja.";
    const shortDescFr = "Bottine Steve Riots en cuir tan patin\u00e9 \u00e0 la main avec boucle lat\u00e9rale, perforations brogue et zip int\u00e9rieur. Silhouette Chelsea formelle. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Command the boardroom in the <strong>Steve Riots Buckle Brogue Ankle Boot in Tan Burnished Leather</strong>. Featuring hand-burnished full-grain leather that shifts from deep amber to caramel highlights, this formal ankle boot combines equestrian buckle hardware with classic brogue perforations for a timeless statement. The functional inner zip and cushioned leather insole make it as practical as it is refined.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Hand-burnished tan full-grain leather</strong> with rich color variation</li>
<li><strong>Side buckle strap</strong> with antique metal hardware for equestrian elegance</li>
<li><strong>Traditional brogue perforations</strong> along seams and side panel</li>
<li><strong>Functional inner side zip</strong> for easy on-and-off</li>
<li><strong>Leather-lined interior</strong> with cushioned footbed for all-day comfort</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Steve Riots</td></tr>
<tr><td><strong>Model</strong></td><td>Buckle Brogue Ankle Boot</td></tr>
<tr><td><strong>Colour</strong></td><td>Tan Burnished</td></tr>
<tr><td><strong>Material</strong></td><td>Full-Grain Burnished Leather + Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Leather-Lined Insole + Studded Rubber Sole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Side Buckle + Brogue Perforations + Inner Zip</td></tr>
<tr><td><strong>Closure</strong></td><td>Buckle Strap + Inner Side Zip</td></tr>
<tr><td><strong>Style</strong></td><td>Formal Ankle Boot</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Steve Riots Box + Dust Bag</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with slim navy or charcoal wool trousers and a crisp shirt for elevated business dress. The tan burnished finish also works dressed down with dark denim and a wool overcoat for smart weekend energy. The side buckle adds character without breaking formal codes - perfect for weddings, board meetings, or events where you want to stand out with substance, not shout.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Statement formal footwear, built to last.</p>`;

    const longDescFr = `<p>Dominez la salle de r\u00e9union avec la <strong>Bottine Steve Riots Boucle Brogue en Cuir Tan Patin\u00e9</strong>. Pr\u00e9sentant un cuir pleine fleur patin\u00e9 \u00e0 la main qui passe de l'ambre profond \u00e0 des reflets caramel, cette bottine formelle combine la quincaillerie boucle \u00e9questre avec les perforations brogue classiques pour une d\u00e9claration intemporelle. Le zip int\u00e9rieur fonctionnel et la semelle int\u00e9rieure en cuir rembourr\u00e9e la rendent aussi pratique que raffin\u00e9e.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Cuir pleine fleur tan patin\u00e9 \u00e0 la main</strong> avec riche variation de couleur</li>
<li><strong>Lani\u00e8re boucle lat\u00e9rale</strong> avec quincaillerie m\u00e9tal antique pour \u00e9l\u00e9gance \u00e9questre</li>
<li><strong>Perforations brogue traditionnelles</strong> le long des coutures et du panneau lat\u00e9ral</li>
<li><strong>Zip lat\u00e9ral int\u00e9rieur fonctionnel</strong> pour un enfilage facile</li>
<li><strong>Int\u00e9rieur doubl\u00e9 cuir</strong> avec semelle rembourr\u00e9e pour un confort toute la journ\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Steve Riots</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Bottine Boucle Brogue</td></tr>
<tr><td><strong>Couleur</strong></td><td>Tan Patin\u00e9</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Pleine Fleur Patin\u00e9 + Semelle Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Cuir + Semelle Caoutchouc Clout\u00e9e</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Boucle Lat\u00e9rale + Perforations Brogue + Zip Int\u00e9rieur</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Lani\u00e8re Boucle + Zip Lat\u00e9ral Int\u00e9rieur</td></tr>
<tr><td><strong>Style</strong></td><td>Bottine Formelle</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Steve Riots Originale + Housse</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Associez avec un pantalon slim en laine marine ou anthracite et une chemise nette pour une tenue business \u00e9lev\u00e9e. La finition tan patin\u00e9e fonctionne aussi d\u00e9contract\u00e9e avec un jean fonc\u00e9 et un manteau en laine pour une \u00e9nergie week-end smart. La boucle lat\u00e9rale ajoute du caract\u00e8re sans briser les codes formels - parfaite pour les mariages, les r\u00e9unions du conseil ou les \u00e9v\u00e9nements o\u00f9 vous voulez vous d\u00e9marquer avec de la substance, pas du bruit.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Chaussure formelle statement, construite pour durer.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Tan Burnished", image: imageUrl }];
    const tagsEn = ["steve riots", "ankle boot", "chelsea boot", "buckle boot", "brogue", "tan leather", "formal boots", "menswear", "abuja"];
    const tagsFr = ["steve riots", "bottine", "chelsea boot", "bottine boucle", "brogue", "cuir tan", "bottines formelles", "menswear", "abuja"];

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
      sku: "NDZ-STR-BKB-TN01",
      category: "boots",
      brand: "Steve Riots",
      stock: 15,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Burnished Leather + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Steve Riots Buckle Brogue Ankle Boot Tan Leather | New Deal Zone",
      seoTitleFr: "Bottine Steve Riots Boucle Brogue Cuir Tan | New Deal Zone",
      metaDescription: "Shop the Steve Riots ankle boot in hand-burnished tan leather with side buckle, brogue detail, and inner zip. Formal statement footwear. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la bottine Steve Riots en cuir tan patin\u00e9 \u00e0 la main avec boucle lat\u00e9rale, d\u00e9tail brogue et zip int\u00e9rieur. Chaussure formelle statement. Livraison rapide depuis Abuja.",
      focusKeyphrase: "steve riots ankle boot tan",
      focusKeyphraseFr: "bottine steve riots boucle tan",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Adaeze Chioma", rating: 5, comment: "The burnished tan finish is absolutely stunning in person - the color depth is real. Bought for my husband's promotion and he says the buckle detail gets compliments constantly. Abuja delivery was fast.", commentFr: "La finition tan patin\u00e9e est absolument magnifique en vrai - la profondeur de couleur est r\u00e9elle. Achet\u00e9es pour la promotion de mon mari et il dit que le d\u00e9tail boucle re\u00e7oit des compliments constamment. Livraison Abuja rapide.", verified: true, daysAgo: 7 },
      { customerName: "David Bernard", rating: 5, comment: "Serious boot for serious occasions. Leather is thick, brogue perforations are perfectly cut, and the inner zip means no fighting to get them on. Worth every naira spent.", commentFr: "Bottine s\u00e9rieuse pour occasions s\u00e9rieuses. Le cuir est \u00e9pais, les perforations brogue sont parfaitement d\u00e9coup\u00e9es, et le zip int\u00e9rieur signifie pas de bataille pour les enfiler. Chaque naira d\u00e9pens\u00e9 en vaut la peine.", verified: true, daysAgo: 21 },
      { customerName: "Kamau Njoroge", rating: 4, comment: "Beautiful workmanship and the tan color is exactly as pictured. Only reason for 4 stars is they run slightly true-to-large - consider a half size down if between sizes. Otherwise excellent.", commentFr: "Belle facture et la couleur tan est exactement comme sur la photo. La seule raison des 4 \u00e9toiles est qu'elles taillent l\u00e9g\u00e8rement grand - pensez \u00e0 prendre une demi-taille en dessous si vous \u00eates entre deux tailles. Sinon excellent.", verified: true, daysAgo: 41 },
      { customerName: "Sy Toure", rating: 5, comment: "Wore these to my brother's wedding in Dakar and got endless compliments. The Steve Riots box and dust bag came included - proper premium packaging. Comfortable straight out the box.", commentFr: "Je les ai port\u00e9es au mariage de mon fr\u00e8re \u00e0 Dakar et j'ai re\u00e7u des compliments sans fin. La bo\u00eete Steve Riots et la housse \u00e9taient incluses - vrai emballage premium. Confortable directement en sortant de la bo\u00eete.", verified: false, daysAgo: 64 },
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
      message: "Steve Riots Buckle Brogue Ankle Boot Tan seeded successfully",
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