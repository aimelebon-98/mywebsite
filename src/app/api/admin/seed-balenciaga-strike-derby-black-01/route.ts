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

    const costNgn = 38000;
    const sellingNgn = 45000;
    const compareNgn = 52000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "balenciaga-strike-lace-up-derby-black";
    const slugFr = "derby-balenciaga-strike-lacets-noir";
    const sourceUrl = "https://i.ibb.co/60ddQxjX/Whats-App-Image-2026-08-09-at-10-10-59-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/balenciaga-strike-lace-up-derby-black-${Date.now()}.jpg`,
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

    const nameEn = "Balenciaga Strike Lace-Up Derby Shoe - Triple Black";
    const nameFr = "Derby Balenciaga Strike \u00c0 Lacets - Noir Total";

    const shortDescEn = "Balenciaga Strike Derby in triple black leather with aggressive lugged sole embossed BALENCIAGA branding. Chunky luxury silhouette. Ships from Abuja.";
    const shortDescFr = "Derby Balenciaga Strike en cuir noir total avec semelle crampons agressive et branding BALENCIAGA grav\u00e9. Silhouette luxe chunky. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Stalk the street in the <strong>Balenciaga Strike Lace-Up Derby in Triple Black</strong>. Demna's take on the classic Derby shoe amplifies traditional menswear with an exaggerated tank-tread sole, embossed BALENCIAGA branding across the midsole and outsole, and clean minimalist leather uppers. The result is a shoe that reads dress-code compliant from above and full luxury-punk from below.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Smooth black calfskin leather upper</strong> in traditional 3-eye Derby cut</li>
<li><strong>Aggressive tank-tread rubber outsole</strong> with deep chunky lugs</li>
<li><strong>Embossed BALENCIAGA branding</strong> on midsole strip and outsole</li>
<li><strong>Reinforced heel counter</strong> with metallic accent</li>
<li><strong>Leather-lined interior</strong> with padded footbed for comfort</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Balenciaga</td></tr>
<tr><td><strong>Model</strong></td><td>Strike Lace-Up Derby</td></tr>
<tr><td><strong>Colour</strong></td><td>Triple Black</td></tr>
<tr><td><strong>Material</strong></td><td>Calfskin Leather + Chunky Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Padded Insole + Tank-Tread Lugged Sole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Embossed BALENCIAGA Branding + Tank Tread</td></tr>
<tr><td><strong>Closure</strong></td><td>3-Eyelet Lace-Up</td></tr>
<tr><td><strong>Style</strong></td><td>Luxury Chunky Derby</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-45</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Balenciaga Box + Dust Bag + Care Card</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with a tailored black suit for stealth-luxe office energy that reveals the aggressive sole only when you cross your legs. Also works dressed down with baggy denim and an oversized graphic tee for full Balenciaga fashion-week attitude. The all-black construction keeps things versatile while the tread ensures nobody mistakes these for basic Derbies.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Demna-era luxury, delivered.</p>`;

    const longDescFr = `<p>Traquez la rue avec le <strong>Derby Balenciaga Strike \u00c0 Lacets en Noir Total</strong>. La version de Demna du Derby classique amplifie le menswear traditionnel avec une semelle tank-tread exag\u00e9r\u00e9e, un branding BALENCIAGA grav\u00e9 sur la semelle interm\u00e9diaire et ext\u00e9rieure, et des tiges en cuir minimalistes propres. Le r\u00e9sultat est une chaussure qui lit conforme au dress-code par le dessus et pleinement luxe-punk par le dessous.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir de veau noir lisse</strong> en coupe Derby traditionnelle 3 oeillets</li>
<li><strong>Semelle en caoutchouc tank-tread agressive</strong> avec crampons chunky profonds</li>
<li><strong>Branding BALENCIAGA grav\u00e9</strong> sur bande de semelle interm\u00e9diaire et semelle ext\u00e9rieure</li>
<li><strong>Contrefort de talon renforc\u00e9</strong> avec accent m\u00e9tallique</li>
<li><strong>Int\u00e9rieur doubl\u00e9 cuir</strong> avec semelle rembourr\u00e9e pour le confort</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Balenciaga</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Strike Derby \u00c0 Lacets</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Total</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir de Veau + Semelle Chunky Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Tank-Tread</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Branding BALENCIAGA Grav\u00e9 + Tank Tread</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage 3 Oeillets</td></tr>
<tr><td><strong>Style</strong></td><td>Derby Chunky Luxe</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-45</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Balenciaga Originale + Housse + Carte d'Entretien</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un costume noir taill\u00e9 pour une \u00e9nergie office stealth-luxe qui r\u00e9v\u00e8le la semelle agressive uniquement quand vous croisez les jambes. Fonctionne aussi d\u00e9contract\u00e9 avec un jean baggy et un t-shirt graphique oversized pour une attitude Balenciaga fashion-week compl\u00e8te. La construction tout noire garde les choses polyvalentes tandis que le tread s'assure que personne ne prend ces derbies pour des basiques.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Luxe \u00e8re Demna, livr\u00e9.</p>`;

    const sizes = ["41","42","43","44","45"];
    const colors = [{ name: "Triple Black", image: imageUrl }];
    const tagsEn = ["balenciaga", "strike derby", "lace-up derby", "chunky derby", "triple black", "luxury shoes", "designer", "menswear", "abuja"];
    const tagsFr = ["balenciaga", "strike derby", "derby lacets", "derby chunky", "noir total", "chaussures luxe", "designer", "menswear", "abuja"];

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
      sku: "NDZ-BAL-STK-BK01",
      category: "formal",
      brand: "Balenciaga",
      stock: 15,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Calfskin Leather + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Balenciaga Strike Lace-Up Derby Triple Black | New Deal Zone",
      seoTitleFr: "Derby Balenciaga Strike Lacets Noir Total | New Deal Zone",
      metaDescription: "Shop the Balenciaga Strike lace-up Derby in triple black calfskin with aggressive tank-tread sole and embossed branding. Demna luxury. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le Derby Balenciaga Strike \u00e0 lacets en cuir noir total avec semelle tank-tread agressive et branding grav\u00e9. Luxe Demna. Livraison rapide depuis Abuja.",
      focusKeyphrase: "balenciaga strike derby black",
      focusKeyphraseFr: "derby balenciaga strike noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Adaora Chioma", rating: 5, comment: "The BALENCIAGA branding on the sole is so satisfying and the tank tread is aggressive without being clownish. Wears from formal to casual seamlessly. Delivery to Abuja was fast.", commentFr: "Le branding BALENCIAGA sur la semelle est tellement satisfaisant et le tank tread est agressif sans \u00eatre clownesque. Se porte du formel au casual sans probl\u00e8me. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 9 },
      { customerName: "Sophie Girard", rating: 5, comment: "Bought these to elevate my husband's formal wardrobe and they deliver. The leather is thick and premium, the box came with the dust bag and care card. Full luxury experience.", commentFr: "Je les ai achet\u00e9es pour \u00e9lever la garde-robe formelle de mon mari et elles livrent. Le cuir est \u00e9pais et premium, la bo\u00eete est venue avec la housse et la carte d'entretien. Exp\u00e9rience luxe compl\u00e8te.", verified: true, daysAgo: 24 },
      { customerName: "Kone Ba", rating: 4, comment: "Beautiful derby and the branded sole is a proper flex. Only reason for 4 stars is they are heavy - takes a couple weeks to get used to the weight, but you feel it is quality.", commentFr: "Beau derby et la semelle brand\u00e9e est un vrai flex. La seule raison des 4 \u00e9toiles est qu'ils sont lourds - il faut quelques semaines pour s'habituer au poids, mais on sent que c'est de la qualit\u00e9.", verified: true, daysAgo: 42 },
      { customerName: "Njeri Halima", rating: 5, comment: "These are my go-to for meetings where I want to signal quiet luxury. Nobody notices the tread until they see the sole - then everyone comments. Perfect Demna-era piece.", commentFr: "Celles-ci sont mon choix pour les r\u00e9unions o\u00f9 je veux signaler un luxe discret. Personne ne remarque la semelle jusqu'\u00e0 ce qu'ils la voient - puis tout le monde commente. Pi\u00e8ce Demna parfaite.", verified: false, daysAgo: 65 },
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
      message: "Balenciaga Strike Lace-Up Derby Black seeded successfully",
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