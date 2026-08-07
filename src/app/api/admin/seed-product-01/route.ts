import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slug = "nike-chunky-trail-sneaker-black-grey";
    const slugFr = "basket-nike-chunky-trail-noir-gris";

    // Idempotent: remove existing rows matching either slug
    await db.delete(products).where(
      or(eq(products.slug, slug), eq(products.slugFr, slugFr))
    );

    const imageUrl = "https://i.ibb.co/8L9m4dp2/nike-chunky-trail-sneaker-black-grey.jpg";

    const shortDescription = "Bold Nike chunky trail sneaker in black and grey with silver Swoosh, aggressive lug outsole and futuristic layered design for standout street style.";

    const longDescription = `<p>Step into the future of street style with the <strong>Nike Chunky Trail Sneaker in Black/Grey</strong>. Built for the modern sneakerhead who refuses to blend in, this bold silhouette merges rugged trail DNA with high-fashion attitude. The layered mesh and TPU upper delivers structure, breathability and that unmistakable Nike engineering, while the metallic silver Swoosh cuts through the dark palette for maximum impact.</p>
<p>The aggressive <strong>chunky lug outsole</strong> is the real headline. Deep multi-directional treads grip pavement, gravel and everything in between, giving you the confidence to move from city blocks to weekend adventures without missing a beat. Underneath, the cushioned platform absorbs impact and adds height, keeping you comfortable through long days on your feet.</p>
<p><strong>Key highlights:</strong></p>
<ul>
<li>Layered mesh and synthetic upper for a technical, sculpted look</li>
<li>Reflective silver Swoosh branding on both sides</li>
<li>Chunky rubber lug outsole for grip and dramatic platform height</li>
<li>Padded collar and tongue for lock-in comfort</li>
<li>Reinforced heel cage for stability and durability</li>
<li>Rope-style laces with metallic hardware</li>
</ul>
<p>Style it with cargo pants, oversized hoodies or slim denim for that effortlessly cool techwear-meets-streetwear look that dominates 2025 sneaker culture. Whether you are chasing sunsets, hitting the club, or making a statement on the daily commute, these sneakers deliver on every front.</p>
<p>Available in <strong>EU sizes 38 to 45</strong> and shipped fresh in the original Nike box. Order today from <strong>New Deal Zone</strong> and elevate your rotation with a pair built to turn heads.</p>`;

    const shortDescriptionFr = "Basket Nike chunky trail audacieuse en noir et gris avec Swoosh argent\u00e9, semelle crampons agressive et design futuriste superpos\u00e9 pour un style street qui se d\u00e9marque.";

    const longDescriptionFr = `<p>Entrez dans le futur du style street avec la <strong>Basket Nike Chunky Trail Noir/Gris</strong>. Con\u00e7ue pour le sneakerhead moderne qui refuse de passer inaper\u00e7u, cette silhouette audacieuse marie l\u2019ADN trail robuste \u00e0 une attitude haute couture. La tige superpos\u00e9e en mesh et TPU offre structure, respirabilit\u00e9 et cette ing\u00e9nierie Nike incomparable, tandis que le Swoosh argent m\u00e9tallis\u00e9 tranche dans la palette sombre pour un impact maximal.</p>
<p>La <strong>semelle ext\u00e9rieure \u00e0 crampons chunky</strong> est la v\u00e9ritable vedette. Des sculptures multidirectionnelles profondes accrochent le b\u00e9ton, le gravier et tout ce qui se trouve entre les deux, vous donnant la confiance n\u00e9cessaire pour passer des rues de la ville aux aventures du week-end sans jamais faiblir. En dessous, la plateforme amortie absorbe les chocs et ajoute de la hauteur, pour un confort durable m\u00eame lors des longues journ\u00e9es debout.</p>
<p><strong>Points forts :</strong></p>
<ul>
<li>Tige superpos\u00e9e en mesh et synth\u00e9tique pour un look technique et sculpt\u00e9</li>
<li>Marquage Swoosh argent r\u00e9fl\u00e9chissant sur les deux c\u00f4t\u00e9s</li>
<li>Semelle ext\u00e9rieure en caoutchouc \u00e0 crampons chunky pour l\u2019adh\u00e9rence et la hauteur plateforme spectaculaire</li>
<li>Col et languette rembourr\u00e9s pour un maintien confortable</li>
<li>Renfort talonnier pour la stabilit\u00e9 et la durabilit\u00e9</li>
<li>Lacets style corde avec ferrures m\u00e9talliques</li>
</ul>
<p>Associez-les \u00e0 des pantalons cargo, des sweats oversize ou du denim slim pour ce look techwear-meets-streetwear effortlessly cool qui domine la culture sneaker 2025. Que vous chassiez les couchers de soleil, sortiez en club ou marquiez les esprits lors du trajet quotidien, ces baskets livrent sur tous les fronts.</p>
<p>Disponibles en <strong>pointures EU 38 \u00e0 45</strong> et exp\u00e9di\u00e9es fra\u00eeches dans la bo\u00eete Nike d\u2019origine. Commandez aujourd\u2019hui sur <strong>New Deal Zone</strong> et enrichissez votre collection avec une paire con\u00e7ue pour faire tourner les t\u00eates.</p>`;

    await db.insert(products).values({
      name: "Nike Chunky Trail Sneaker - Black/Grey",
      nameFr: "Basket Nike Chunky Trail - Noir/Gris",
      slug,
      slugFr,
      description: shortDescription,
      shortDescription,
      longDescription,
      descriptionFr: shortDescriptionFr,
      shortDescriptionFr,
      longDescriptionFr,
      price: "25000",
      comparePrice: null,
      category: "sneakers",
      brand: "Nike",
      sizes: JSON.stringify(["38", "39", "40", "41", "42", "43", "44", "45"]),
      colors: JSON.stringify(["Black", "Grey", "Silver"]),
      imageUrl,
      images: JSON.stringify([imageUrl]),
      stock: 25,
      featured: false,
      active: true,
      material: "Mesh & Synthetic with Rubber Lug Outsole",
      sku: "NDZ-NKE-CTR-BG01",
      tags: JSON.stringify(["nike", "chunky sneakers", "trail sneakers", "black sneakers", "streetwear", "platform sneakers"]),
      tagsFr: JSON.stringify(["nike", "baskets chunky", "baskets trail", "baskets noires", "streetwear", "baskets plateforme"]),
      seoTitle: "Nike Chunky Trail Sneaker Black/Grey | New Deal Zone",
      metaDescription: "Shop the Nike Chunky Trail Sneaker in Black/Grey. Bold platform design, silver Swoosh, aggressive lug outsole. Sizes 38-45. Order now on New Deal Zone.",
      focusKeyphrase: "nike chunky trail sneaker",
      ogImage: imageUrl,
      canonicalUrl: "https://www.newdealzone.com/en/product/" + slug,
      noIndex: false,
      seoTitleFr: "Basket Nike Chunky Trail Noir/Gris | New Deal Zone",
      metaDescriptionFr: "D\u00e9couvrez la Basket Nike Chunky Trail Noir/Gris. Design plateforme audacieux, Swoosh argent\u00e9, semelle crampons agressive. Pointures 38-45. Commandez sur New Deal Zone.",
      focusKeyphraseFr: "basket nike chunky trail",
    });

    return NextResponse.json({
      success: true,
      message: "Product seeded successfully",
      slug,
      slugFr,
      urls: {
        en: "https://www.newdealzone.com/en/product/" + slug,
        fr: "https://www.newdealzone.com/fr/product/" + slugFr,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}