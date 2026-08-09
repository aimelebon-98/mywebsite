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
    let XOF = 568, NGN = 1364;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const d = await r.json();
      if (d.rates) { XOF = d.rates.XOF || XOF; NGN = d.rates.NGN || NGN; }
    } catch {}

    const costFcfa = 15000, sellingFcfa = 25000, compareFcfa = 28000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "numeris-platform-beige-suede-chunky-laces";
    const slugFr = "basket-numeris-plateforme-beige-daim-lacets-chunky";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/prKGm3Df/Whats-App-Image-2026-08-08-at-7-06-25-PM-2.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/numeris-platform-beige-suede-chunky-laces-luxury-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Beige/Tan Suede", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["numeris","beige-suede","platform","chunky-laces","boutique","luxury","tan","minimalist","designer-inspired"]);
    const tagsFr = JSON.stringify(["numeris","daim-beige","plateforme","lacets-chunky","boutique","luxe","tan","minimaliste","inspiration-designer"]);

    const longDescEn = `<p>The Numeris Platform Suede in warm Beige/Tan - a bold luxury statement sneaker featuring premium suede upper, dramatic oversized chunky flat laces, and a chunky serrated white cupsole for maximum platform presence. Minimalist elegance meets streetwear boldness.</p>
<ul>
<li>Premium beige/tan suede upper with buttery hand feel</li>
<li>Contrasting white leather toe cap for classic contrast</li>
<li>Dramatic oversized chunky flat cotton laces (signature feature)</li>
<li>Chunky serrated white platform cupsole for added height</li>
<li>Padded collar for all-day comfort</li>
<li>Clean minimalist silhouette without loud branding</li>
<li>Ships with Numeris branded packaging</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Numeris</td></tr>
<tr><th>Model</th><td>Platform Suede Chunky Lace</td></tr>
<tr><th>Colour</th><td>Beige / Tan Suede</td></tr>
<tr><th>Material</th><td>Premium suede + white leather toe cap</td></tr>
<tr><th>Signature Detail</th><td>Oversized chunky flat white laces</td></tr>
<tr><th>Sole</th><td>Chunky serrated white platform cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up with dramatic oversized laces</td></tr>
<tr><th>Style</th><td>Boutique luxury / Minimalist statement</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Numeris box</td></tr>
</table>
<p>These are for the minimalist who still wants to make a statement. The warm beige suede reads sophisticated and expensive, while the oversized chunky laces bring that current-moment fashion energy. Pair with white or cream tailored trousers and a fitted cashmere knit for elevated smart-casual, or with straight-leg denim and a plain oversized tee for effortless streetwear luxury. Perfect for spring, summer, and early fall styling.</p>
<p><strong>Trending look - limited stock. Fast delivery from Lom\u00e9, Togo.</strong></p>`;

    const longDescFr = `<p>La Basket Numeris Plateforme Daim en Beige/Tan chaleureux - une basket d\u00e9claration audacieuse de luxe avec empeigne en daim premium, lacets plats surdimensionn\u00e9s spectaculaires, et une cupsole blanche chunky dentel\u00e9e pour une pr\u00e9sence plateforme maximale. L'\u00e9l\u00e9gance minimaliste rencontre l'audace streetwear.</p>
<ul>
<li>Empeigne en daim beige/tan premium avec un toucher doux</li>
<li>Bout en cuir blanc contrastant pour un contraste classique</li>
<li>Lacets plats surdimensionn\u00e9s chunky en coton (d\u00e9tail signature)</li>
<li>Cupsole plateforme blanche chunky dentel\u00e9e pour de la hauteur</li>
<li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
<li>Silhouette minimaliste \u00e9pur\u00e9e sans branding tapageur</li>
<li>Livr\u00e9e avec l'emballage Numeris</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Numeris</td></tr>
<tr><th>Mod\u00e8le</th><td>Plateforme Daim Lacets Chunky</td></tr>
<tr><th>Couleur</th><td>Beige / Daim Tan</td></tr>
<tr><th>Mati\u00e8re</th><td>Daim premium + bout cuir blanc</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Lacets plats blancs surdimensionn\u00e9s</td></tr>
<tr><th>Semelle</th><td>Cupsole plateforme blanche chunky dentel\u00e9e</td></tr>
<tr><th>Fermeture</th><td>Lacets avec lacets surdimensionn\u00e9s spectaculaires</td></tr>
<tr><th>Style</th><td>Luxe boutique / D\u00e9claration minimaliste</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Numeris d'origine</td></tr>
</table>
<p>Ces baskets sont pour le minimaliste qui veut quand m\u00eame faire une d\u00e9claration. Le daim beige chaleureux para\u00eet sophistiqu\u00e9 et co\u00fbteux, tandis que les lacets chunky surdimensionn\u00e9s apportent cette \u00e9nergie mode du moment. Portez-les avec un pantalon ajust\u00e9 blanc ou cr\u00e8me et un pull en cachemire ajust\u00e9 pour un smart-casual \u00e9lev\u00e9, ou avec un jean droit et un tee-shirt oversize uni pour un luxe streetwear sans effort. Parfait pour le printemps, l'\u00e9t\u00e9 et le d\u00e9but de l'automne.</p>
<p><strong>Look tendance - stock limit\u00e9. Livraison rapide depuis Lom\u00e9, Togo.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Numeris Platform Suede - Beige with Chunky Laces",
      nameFr: "Basket Numeris Plateforme Daim - Beige Lacets Chunky",
      slug: slugEn,
      slugFr: slugFr,
      description: "Numeris Platform Suede in beige/tan with dramatic oversized chunky white laces. Minimalist luxury statement piece.",
      descriptionFr: "Basket Numeris Plateforme Daim en beige/tan avec lacets plats spectaculaires surdimensionn\u00e9s. Pi\u00e8ce luxe minimaliste.",
      shortDescription: "Numeris Platform Suede in beige with chunky white laces. Premium suede, white cupsole. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Basket Numeris Plateforme Daim en beige avec lacets chunky blancs. Daim premium, cupsole blanche. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "sneakers",
      brand: "Numeris",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 15,
      featured: true,
      active: true,
      material: "Premium suede + white leather toe cap",
      sku: "NDZ-NUM-PLS-BC04",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Numeris Platform Beige Suede Chunky Laces Luxury | New Deal Zone",
      seoTitleFr: "Basket Numeris Plateforme Beige Daim Lacets Chunky | New Deal Zone",
      metaDescription: "Shop Numeris Platform Suede in beige with dramatic chunky white laces. Trending boutique luxury sneaker. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Basket Numeris Plateforme Daim en beige avec lacets chunky blancs spectaculaires. Basket luxe boutique tendance. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "numeris beige suede chunky laces",
      focusKeyphraseFr: "basket numeris beige daim lacets",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Sarah Johnson",     daysAgo: 3,   rating: 5, en: "THESE ARE STUNNING. The suede is buttery and the beige tone is exactly what I wanted - sophisticated but casual. Chunky laces are the perfect statement.", fr: "MAGNIFIQUES. Le daim est doux et le ton beige est exactement ce que je voulais - sophistiqu\u00e9 mais casual. Les lacets chunky sont la d\u00e9claration parfaite.", verified: true },
      { name: "Yusuf Ibrahim",     daysAgo: 19,  rating: 5, en: "Been obsessed with the oversized lace trend and these deliver in a big way. Suede quality is premium boutique level. Recommend true to size.", fr: "Obs\u00e9d\u00e9 par la tendance des lacets surdimensionn\u00e9s et celles-ci livrent en grand. Qualit\u00e9 du daim niveau boutique premium. Je recommande la taille habituelle.", verified: true },
      { name: "Adaeze Nnamdi",     daysAgo: 41,  rating: 5, en: "The color is even more beautiful in person. The suede has such depth and the white sole makes it pop. Received compliments from strangers within an hour of wearing them out!", fr: "La couleur est encore plus belle en vrai. Le daim a tellement de profondeur et la semelle blanche la fait ressortir. J'ai re\u00e7u des compliments d'inconnus dans l'heure suivant leur port !", verified: true },
      { name: "Michael Roberts",   daysAgo: 74,  rating: 4, en: "Great sneakers, very stylish. Just note that suede requires proper care - I got a small mark on mine but was able to clean it with a suede brush. Would still buy again.", fr: "Belles baskets, tr\u00e8s stylish. Notez juste que le daim n\u00e9cessite un entretien soign\u00e9 - j'ai eu une petite marque mais j'ai pu la nettoyer avec une brosse \u00e0 daim. J'ach\u00e8terais quand m\u00eame \u00e0 nouveau.", verified: false },
    ];

    for (const r of reviewData) {
      const date = new Date();
      date.setDate(date.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.en,
        commentFr: r.fr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt: date,
      });
    }

    const totalRating = reviewData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Numeris Beige Suede Chunky Laces seeded successfully",
      product: { id: product.id, slug: slugEn, slugFr: slugFr, imageUrl, blobUsed },
      pricing: {
        costFcfa, sellingFcfa, compareFcfa,
        costUsd, sellingUsd, compareUsd, costNgn,
        profitNgn: Math.round((sellingUsd - costUsd) * NGN),
        marginPct: Math.round(((sellingUsd - costUsd) / sellingUsd) * 1000) / 10,
        xofRate: XOF, ngnRate: NGN,
      },
      reviews: {
        count: reviewData.length,
        avg: avgRating,
        breakdown: `${reviewData.filter(r => r.rating === 5).length}x 5-star, ${reviewData.filter(r => r.rating === 4).length}x 4-star`,
      },
      origin: { country: "TG", city: "Lom\u00e9" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slugEn}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}