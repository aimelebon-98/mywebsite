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

    const costFcfa = 15000, sellingFcfa = 23000, compareFcfa = 28000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "numeris-low-top-olive-paint-splatter";
    const slugFr = "basket-numeris-low-top-olive-eclaboussures-peinture";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/rRq3WnqQ/Whats-App-Image-2026-08-08-at-7-06-25-PM-1.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/numeris-low-top-olive-green-paint-splatter-streetwear-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Olive Green/White Splatter", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["numeris","olive-green","paint-splatter","low-top","streetwear","boutique","urban","artistic","military"]);
    const tagsFr = JSON.stringify(["numeris","vert-olive","eclaboussures-peinture","low-top","streetwear","boutique","urbain","artistique","militaire"]);

    const longDescEn = `<p>The Numeris Low-Top Sneaker in bold Olive Green with striking white paint splatter effect - a statement piece that blends military-inspired earth tones with contemporary artistic detailing. Perfect for those who want their footwear to speak louder than words.</p>
<ul>
<li>Olive green canvas upper with authentic paint splatter print</li>
<li>Contrasting white leather toe cap and heel counter</li>
<li>Numeris signature branding details</li>
<li>Oversized flat white cotton laces</li>
<li>Chunky serrated white cupsole for maximum street presence</li>
<li>Padded collar and tongue for daily comfort</li>
<li>Ships with Numeris branded packaging</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Numeris</td></tr>
<tr><th>Model</th><td>Low-Top Paint Splatter Edition</td></tr>
<tr><th>Colour</th><td>Olive Green / White Splatter</td></tr>
<tr><th>Material</th><td>Printed canvas + premium white leather</td></tr>
<tr><th>Design</th><td>Hand-inspired paint splatter effect</td></tr>
<tr><th>Sole</th><td>Chunky serrated white cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up with oversized flat laces</td></tr>
<tr><th>Style</th><td>Artistic streetwear / Urban military</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Numeris box</td></tr>
</table>
<p>The paint splatter effect gives each pair a slightly unique look - no two are exactly identical. Pair with cargo pants and an oversized graphic tee for authentic streetwear vibes, or with distressed denim and a bomber jacket for an urban military-inspired fit. The olive green tone pairs beautifully with earth tones, whites, blacks, and even bold pops of orange or yellow.</p>
<p><strong>Statement piece - limited stock. Fast delivery from Lom\u00e9, Togo.</strong></p>`;

    const longDescFr = `<p>La Basket Numeris Low-Top en Vert Olive audacieux avec un effet frappant d'\u00e9claboussures de peinture blanche - une pi\u00e8ce d\u00e9claration qui m\u00e9lange les tons terreux inspir\u00e9s du militaire avec des d\u00e9tails artistiques contemporains. Parfaite pour ceux qui veulent que leurs chaussures parlent plus fort que les mots.</p>
<ul>
<li>Empeigne en toile vert olive avec imprim\u00e9 authentique d'\u00e9claboussures</li>
<li>Bout et talon en cuir blanc contrastant</li>
<li>D\u00e9tails de marque Numeris signature</li>
<li>Lacets plats surdimensionn\u00e9s en coton blanc</li>
<li>Cupsole blanche chunky dentel\u00e9e pour une pr\u00e9sence street maximale</li>
<li>Col et langue rembourr\u00e9s pour un confort quotidien</li>
<li>Livr\u00e9e avec l'emballage Numeris</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Numeris</td></tr>
<tr><th>Mod\u00e8le</th><td>Low-Top \u00c9dition \u00c9claboussures de Peinture</td></tr>
<tr><th>Couleur</th><td>Vert Olive / \u00c9claboussures Blanches</td></tr>
<tr><th>Mati\u00e8re</th><td>Toile imprim\u00e9e + cuir blanc premium</td></tr>
<tr><th>Design</th><td>Effet d'\u00e9claboussures inspir\u00e9 du travail manuel</td></tr>
<tr><th>Semelle</th><td>Cupsole blanche chunky dentel\u00e9e</td></tr>
<tr><th>Fermeture</th><td>Lacets plats surdimensionn\u00e9s</td></tr>
<tr><th>Style</th><td>Streetwear artistique / Militaire urbain</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Numeris d'origine</td></tr>
</table>
<p>L'effet d'\u00e9claboussures donne \u00e0 chaque paire un look l\u00e9g\u00e8rement unique - aucune n'est exactement identique. Portez-la avec un cargo et un tee-shirt oversize \u00e0 imprim\u00e9 pour des vibes streetwear authentiques, ou avec un jean d\u00e9chir\u00e9 et un blouson bomber pour un look urbain inspir\u00e9 du militaire. Le ton vert olive se marie parfaitement avec les tons terreux, les blancs, les noirs, et m\u00eame des touches audacieuses d'orange ou de jaune.</p>
<p><strong>Pi\u00e8ce d\u00e9claration - stock limit\u00e9. Livraison rapide depuis Lom\u00e9, Togo.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Numeris Low-Top - Olive Green Paint Splatter",
      nameFr: "Basket Numeris Low-Top - Vert Olive \u00c9claboussures Peinture",
      slug: slugEn,
      slugFr: slugFr,
      description: "Bold Numeris Low-Top in olive green with white paint splatter effect. Artistic streetwear statement piece.",
      descriptionFr: "Audacieuse basket Numeris Low-Top en vert olive avec effet d'\u00e9claboussures de peinture blanche. Pi\u00e8ce streetwear artistique.",
      shortDescription: "Numeris Low-Top in olive green with white paint splatter print. Chunky sole, white leather details. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Basket Numeris Low-Top en vert olive avec imprim\u00e9 \u00e9claboussures blanches. Semelle chunky, d\u00e9tails cuir blanc. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
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
      featured: false,
      active: true,
      material: "Printed canvas + premium white leather",
      sku: "NDZ-NUM-LTS-OS03",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Numeris Low-Top Olive Green Paint Splatter Streetwear | New Deal Zone",
      seoTitleFr: "Basket Numeris Low-Top Vert Olive \u00c9claboussures | New Deal Zone",
      metaDescription: "Shop Numeris Low-Top in olive green with white paint splatter effect. Bold artistic streetwear from our boutique collection. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Basket Numeris Low-Top en vert olive avec effet \u00e9claboussures blanches. Streetwear artistique audacieux de notre collection boutique. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "numeris olive paint splatter sneaker",
      focusKeyphraseFr: "basket numeris olive \u00e9claboussures",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Ama Boateng",       daysAgo: 6,   rating: 5, en: "So different from anything else in my collection! The paint splatter looks so authentic and the olive green is a perfect earth tone. Compliments non-stop.", fr: "Tellement diff\u00e9rentes de tout le reste de ma collection ! Les \u00e9claboussures sont si authentiques et le vert olive est un ton terreux parfait. Compliments non-stop.", verified: true },
      { name: "Kwabena Osei",      daysAgo: 24,  rating: 5, en: "Every pair looks slightly different because of the splatter pattern - mine is really unique. Chunky sole is comfortable and adds height. Perfect for weekend fits.", fr: "Chaque paire est l\u00e9g\u00e8rement diff\u00e9rente \u00e0 cause du motif d'\u00e9claboussures - la mienne est vraiment unique. Semelle chunky confortable qui ajoute de la hauteur. Parfait pour les tenues week-end.", verified: true },
      { name: "David Thompson",    daysAgo: 45,  rating: 5, en: "Been searching for artsy sneakers that aren't overhyped and these NAILED it. Quality is boutique-level premium. Packaging came sealed. Highly recommend.", fr: "Je cherchais des baskets artistiques pas trop hyp\u00e9es et celles-ci ont FAIT MOUCHE. Qualit\u00e9 premium niveau boutique. Emballage scell\u00e9. Vivement recommand\u00e9.", verified: true },
      { name: "Antoine Girard",    daysAgo: 77,  rating: 4, en: "Really cool design and comfortable to wear. The paint splatter gets minor scuff marks over time which some may not like, but I think it adds character. Overall great buy.", fr: "Design vraiment cool et confortable \u00e0 porter. Les \u00e9claboussures peuvent avoir de petites marques au fil du temps ce qui pourrait d\u00e9plaire \u00e0 certains, mais je pense que \u00e7a ajoute du caract\u00e8re. Excellent achat.", verified: false },
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
      message: "Numeris Olive Paint Splatter seeded successfully",
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