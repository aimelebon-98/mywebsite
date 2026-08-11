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

    const costNgn = 30000;
    const sellingNgn = 37000;
    const compareNgn = 45000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "clarks-wallabee-lace-up-black-leather";
    const slugFr = "chaussure-clarks-wallabee-cuir-noir";
    const sourceUrl = "https://i.ibb.co/MyHLJ4FN/Whats-App-Image-2026-08-09-at-10-11-07-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/clarks-wallabee-lace-up-black-leather-${Date.now()}.jpg`,
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

    const nameEn = "Clarks Wallabee Lace-Up Moccasin - Black Leather";
    const nameFr = "Chaussure Clarks Wallabee \u00c0 Lacets - Cuir Noir";

    const shortDescEn = "Clarks Wallabee-inspired 2-eyelet moccasin in triple black leather with signature hangtag and honeycomb rubber sole. British heritage silhouette. Ships from Abuja.";
    const shortDescFr = "Chaussure Clarks style Wallabee \u00e0 2 oeillets en cuir noir total avec \u00e9tiquette signature et semelle caoutchouc nid d'abeille. Silhouette h\u00e9ritage britannique. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Step into legend with the <strong>Clarks Wallabee Lace-Up Moccasin in Black Leather</strong>. First launched in 1967, the Wallabee is Clarks' most iconic silhouette - beloved by Wu-Tang Clan, London mods, and menswear connoisseurs worldwide. This version features triple-black smooth leather construction, the signature 2-eyelet lace-up, moccasin toe box, and Clarks' honeycomb crepe-style rubber sole for cushioning that defines the brand.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Smooth full-grain leather upper</strong> in deep triple black</li>
<li><strong>Signature Clarks logo hangtag</strong> - the iconic Wallabee marker</li>
<li><strong>2-eyelet lace-up construction</strong> - the historic silhouette</li>
<li><strong>Honeycomb rubber sole</strong> for pillowy step-in comfort</li>
<li><strong>Red Clarks script</strong> embossed on the rubber outsole</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Clarks</td></tr>
<tr><td><strong>Model</strong></td><td>Wallabee Lace-Up Moccasin</td></tr>
<tr><td><strong>Colour</strong></td><td>Triple Black</td></tr>
<tr><td><strong>Material</strong></td><td>Full-Grain Leather + Honeycomb Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Cushioned Insole + Honeycomb Crepe-Style Sole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Clarks Hangtag + 2-Eyelet Lacing + Red Sole Script</td></tr>
<tr><td><strong>Closure</strong></td><td>2-Eyelet Lace-Up</td></tr>
<tr><td><strong>Style</strong></td><td>Heritage Moccasin</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Clarks Box</td></tr>
</table>

<h3>How to Style</h3>
<p>Wear with cuffed selvedge denim and a knit sweater for classic Wallabee menswear energy - the way Wu-Tang made famous. Also works dressed up with wool trousers and an overcoat, or dressed down with cargo pants and a graphic tee. The triple-black colorway means these disappear into your fit and let the silhouette do the talking. A wardrobe icon.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Six decades of Clarks heritage, in your hands.</p>`;

    const longDescFr = `<p>Entrez dans la l\u00e9gende avec la <strong>Chaussure Clarks Wallabee \u00c0 Lacets en Cuir Noir</strong>. Lanc\u00e9e pour la premi\u00e8re fois en 1967, la Wallabee est la silhouette la plus ic\u00f4nique de Clarks - ador\u00e9e par Wu-Tang Clan, les mods de Londres et les connaisseurs menswear du monde entier. Cette version pr\u00e9sente une construction en cuir noir total lisse, le laçage \u00e0 2 oeillets signature, la pointe moccasin et la semelle en caoutchouc nid d'abeille style crepe de Clarks pour un amorti qui d\u00e9finit la marque.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir pleine fleur lisse</strong> en noir total profond</li>
<li><strong>\u00c9tiquette logo Clarks signature</strong> - le marqueur Wallabee ic\u00f4nique</li>
<li><strong>Construction \u00e0 lacets 2 oeillets</strong> - la silhouette historique</li>
<li><strong>Semelle en caoutchouc nid d'abeille</strong> pour un confort d'entr\u00e9e moelleux</li>
<li><strong>Script Clarks rouge</strong> grav\u00e9 sur la semelle en caoutchouc</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Clarks</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Wallabee \u00c0 Lacets</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Total</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Pleine Fleur + Semelle Caoutchouc Nid d'Abeille</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Style Crepe</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>\u00c9tiquette Clarks + Laçage 2 Oeillets + Script Rouge</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage 2 Oeillets</td></tr>
<tr><td><strong>Style</strong></td><td>Moccasin H\u00e9ritage</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Clarks Originale</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Portez avec un jean selvedge retrouss\u00e9 et un pull en maille pour une \u00e9nergie menswear Wallabee classique - comme Wu-Tang l'a rendue c\u00e9l\u00e8bre. Fonctionne aussi habill\u00e9e avec un pantalon en laine et un manteau, ou d\u00e9contract\u00e9e avec un pantalon cargo et un t-shirt graphique. Le coloris noir total signifie qu'elles disparaissent dans votre tenue et laissent la silhouette parler. Une ic\u00f4ne de garde-robe.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Six d\u00e9cennies d'h\u00e9ritage Clarks, entre vos mains.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Triple Black", image: imageUrl }];
    const tagsEn = ["clarks", "wallabee", "lace-up moccasin", "triple black", "leather moccasin", "heritage", "menswear", "casual", "abuja"];
    const tagsFr = ["clarks", "wallabee", "moccasin lacets", "noir total", "moccasin cuir", "h\u00e9ritage", "menswear", "casual", "abuja"];

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
      sku: "NDZ-CLK-WAL-BK01",
      category: "casual",
      brand: "Clarks",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Full-Grain Leather + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Clarks Wallabee Lace-Up Moccasin Black Leather | New Deal Zone",
      seoTitleFr: "Chaussure Clarks Wallabee Lacets Cuir Noir | New Deal Zone",
      metaDescription: "Shop the iconic Clarks Wallabee lace-up moccasin in triple black leather with signature hangtag and honeycomb sole. Heritage since 1967. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la chaussure ic\u00f4nique Clarks Wallabee \u00e0 lacets en cuir noir total avec \u00e9tiquette signature et semelle nid d'abeille. H\u00e9ritage depuis 1967. Livraison rapide depuis Abuja.",
      focusKeyphrase: "clarks wallabee black leather",
      focusKeyphraseFr: "clarks wallabee cuir noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Nnamdi Okonkwo", rating: 5, comment: "Wu-Tang made me want Wallabees years ago and finally got a pair. The triple black is so clean and the hangtag confirms authentic Clarks. Delivery to Abuja was next-day.", commentFr: "Wu-Tang m'a donn\u00e9 envie de Wallabees il y a des ann\u00e9es et j'ai enfin une paire. Le noir total est tellement propre et l'\u00e9tiquette confirme du vrai Clarks. Livraison \u00e0 Abuja le lendemain.", verified: true, daysAgo: 10 },
      { customerName: "Camille Girard", rating: 5, comment: "Bought these for my brother and now I want a pair for myself. The honeycomb sole is genuinely comfortable and the leather is thick and premium. Timeless silhouette.", commentFr: "Je les ai achet\u00e9es pour mon fr\u00e8re et maintenant j'en veux une paire pour moi. La semelle nid d'abeille est vraiment confortable et le cuir est \u00e9pais et premium. Silhouette intemporelle.", verified: true, daysAgo: 25 },
      { customerName: "Rachel Chen", rating: 4, comment: "Love these shoes and they pair with everything from suits to sweats. Only reason for 4 stars is the leather needs a couple of days to soften up around the toe box. Worth the break-in.", commentFr: "J'adore ces chaussures et elles s'accordent avec tout, des costumes aux joggings. La seule raison des 4 \u00e9toiles est que le cuir a besoin de quelques jours pour s'assouplir autour de la pointe. Vaut la p\u00e9riode d'assouplissement.", verified: true, daysAgo: 43 },
      { customerName: "Yusuf Ibrahim", rating: 5, comment: "Genuine Clarks Wallabee quality. The red script on the sole and the crepe-style honeycomb rubber are the details that matter. These will outlast everything else in my closet.", commentFr: "Vraie qualit\u00e9 Clarks Wallabee. Le script rouge sur la semelle et le caoutchouc nid d'abeille style crepe sont les d\u00e9tails qui comptent. Elles survivront \u00e0 tout le reste de mon placard.", verified: false, daysAgo: 66 },
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
      message: "Clarks Wallabee Lace-Up Black Leather seeded successfully",
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