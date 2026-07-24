import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, authors } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const AUTHOR_SLUG = "solevault-editorial";
const POST_SLUG = "how-premium-sneakers-are-made";

const CONTENT_EN = `
<p>Ever slipped on a pair of premium sneakers and wondered why they feel <em>so</em> different from the $30 pair you grabbed on sale? It is not marketing. It is craftsmanship. Behind every high-end sneaker is a 60+ step process, weeks of work, and a level of detail most people never see.</p>
<p>Let us pull back the curtain.</p>

<h2>1. It All Starts with a Sketch</h2>
<p>Long before a sneaker touches your feet, it lives on paper. Designers spend weeks, sometimes months, sketching silhouettes, studying trends, and refining proportions.</p>
<p>At the premium level, designers do not just chase what is hot. They think about:</p>
<ul>
  <li><strong>Anatomy</strong>: how the foot actually moves</li>
  <li><strong>Culture</strong>: what story the shoe tells</li>
  <li><strong>Longevity</strong>: will it still look good in 5 years?</li>
</ul>
<p>The best sketches then move into 3D modeling software, where every curve and panel is engineered digitally before a single stitch is made.</p>

<h2>2. Choosing the Materials</h2>
<p>This is the biggest difference between a $50 sneaker and a $250 one.</p>
<p>Premium sneakers use:</p>
<ul>
  <li><strong>Full-grain leather</strong> (not "genuine leather," which is actually the lowest quality)</li>
  <li><strong>Italian suede</strong> with tight grain and rich color depth</li>
  <li><strong>Primeknit or Flyknit</strong> engineered yarns for breathability</li>
  <li><strong>Recycled ocean plastics</strong> in modern eco-lines</li>
  <li><strong>Vegetable-tanned leather</strong> that ages beautifully over years</li>
</ul>
<p>Every material is tested for durability, flex, breathability, and how it holds dye. A single upper can use 8 to 15 different materials.</p>

<h2>3. The Last: The Secret Behind the Fit</h2>
<p>The "last" is a foot-shaped mold that the sneaker is built around. Premium brands develop custom lasts based on thousands of foot scans, accounting for arch height, toe splay, heel width, and instep volume.</p>
<p>Cheap sneakers reuse generic lasts. Premium ones are custom-molded for each silhouette. That is why they feel like they were made for your foot, because in a way, they were.</p>

<h2>4. Cutting and Stitching by Hand</h2>
<p>Once the pattern is finalized, skilled cutters use steel dies or laser cutters to slice out each panel. A single sneaker upper can have 20 to 40 individual pieces.</p>
<ul>
  <li><strong>Machine stitching</strong> for speed on structural seams</li>
  <li><strong>Hand stitching</strong> for detail work, especially on leather models</li>
  <li><strong>Ultrasonic welding</strong> on high-performance runners for a seamless look</li>
</ul>
<p>Master stitchers train for years. A skilled worker can complete an upper in about 45 minutes.</p>

<h2>5. Building the Sole</h2>
<p>The sole is a multi-layered engineering system:</p>
<ul>
  <li><strong>Insole</strong>: molded foam, often memory foam or cork</li>
  <li><strong>Midsole</strong>: the shock absorber (EVA, PU, Boost, ZoomX, React foam)</li>
  <li><strong>Outsole</strong>: the ground contact layer, engineered for grip and durability</li>
</ul>
<p>Premium brands invest millions in midsole R&amp;D, re-engineering foam at the molecular level.</p>

<h2>6. Lasting: Where Upper Meets Sole</h2>
<p>The stitched upper is pulled tightly over the last and glued or stitched to the sole:</p>
<ul>
  <li><strong>Strobel construction</strong> for flexibility</li>
  <li><strong>Cup sole construction</strong> for durability</li>
  <li><strong>Blake or Goodyear welt stitching</strong> on luxury leather sneakers</li>
</ul>

<h2>7. Quality Control: The 40-Point Inspection</h2>
<p>Every premium sneaker goes through multiple QC checks: stitch consistency, glue bleed, color uniformity, sole alignment measured in millimeters, insole placement, and lace hole clearance.</p>
<p>Reject rates at top factories can hit 15 to 20 percent. That is 1 in 5 pairs never making it to a store shelf.</p>

<h2>8. Packaging: The First Impression</h2>
<p>The unboxing experience is not an accident. Premium brands design their boxes, tissue paper, and inserts to feel like opening a gift, with magnetic closures, cotton dust bags, branded shoe trees, and care instruction cards.</p>

<h2>Why It Is Worth Paying More</h2>
<ol>
  <li><strong>Better materials</strong> that age instead of degrade</li>
  <li><strong>Custom lasts</strong> that actually fit your foot</li>
  <li><strong>Skilled labor</strong> refined over generations</li>
  <li><strong>Advanced sole tech</strong> that protects your joints</li>
  <li><strong>Durability</strong> that makes cost-per-wear laughably low</li>
</ol>
<p>A $200 sneaker you wear 200 times costs $1 per wear. A $50 sneaker you wear 20 times before it falls apart? $2.50 per wear. Premium is often the cheaper long-term choice.</p>

<h2>Ready to Feel the Difference?</h2>
<p>At <strong>SoleVault</strong>, we curate sneakers built with the craftsmanship you just read about. Every shoe we stock is chosen for materials, construction, and comfort that lasts.</p>
`.trim();

const CONTENT_FR = `
<p>Vous avez deja enfile une paire de sneakers premium et vous vous etes demande pourquoi elles se sentent <em>si</em> differentes de la paire a 30$ trouvee en promo? Ce n est pas du marketing. C est de l artisanat. Derriere chaque sneaker haut de gamme se cache un processus de plus de 60 etapes.</p>

<h2>1. Tout Commence par un Croquis</h2>
<p>Bien avant qu une sneaker ne touche vos pieds, elle vit sur papier. Les designers passent des semaines a esquisser des silhouettes, etudier les tendances et affiner les proportions.</p>
<ul>
  <li><strong>L anatomie</strong>: comment le pied bouge reellement</li>
  <li><strong>La culture</strong>: quelle histoire la chaussure raconte</li>
  <li><strong>La longevite</strong>: sera-t-elle encore belle dans 5 ans?</li>
</ul>

<h2>2. Le Choix des Materiaux</h2>
<p>C est la plus grande difference entre une sneaker a 50$ et une a 250$.</p>
<ul>
  <li><strong>Cuir pleine fleur</strong> (pas du "cuir veritable", qui est la plus basse qualite)</li>
  <li><strong>Daim italien</strong> a grain serre et couleurs profondes</li>
  <li><strong>Primeknit ou Flyknit</strong> pour la respirabilite</li>
  <li><strong>Plastiques oceaniques recycles</strong> dans les gammes eco-responsables</li>
  <li><strong>Cuir a tannage vegetal</strong> qui vieillit magnifiquement</li>
</ul>

<h2>3. La Forme: Le Secret de l Ajustement</h2>
<p>La "forme" est un moule autour duquel la sneaker est construite. Les marques premium developpent des formes personnalisees basees sur des milliers de scans de pieds.</p>

<h2>4. Decoupe et Couture a la Main</h2>
<p>Une seule tige peut avoir de 20 a 40 pieces individuelles.</p>
<ul>
  <li><strong>Couture machine</strong> pour la rapidite sur les coutures structurelles</li>
  <li><strong>Couture main</strong> pour les details</li>
  <li><strong>Soudure ultrasonique</strong> sur les modeles haute performance</li>
</ul>

<h2>5. Construction de la Semelle</h2>
<ul>
  <li><strong>Semelle interieure</strong>: mousse moulee, memoire de forme ou liege</li>
  <li><strong>Semelle intermediaire</strong>: l amortisseur (EVA, PU, Boost, ZoomX, React)</li>
  <li><strong>Semelle exterieure</strong>: la couche de contact au sol</li>
</ul>
<p>Les marques premium investissent des millions dans la R&amp;D des semelles intermediaires.</p>

<h2>6. Le Montage: Ou la Tige Rencontre la Semelle</h2>
<ul>
  <li><strong>Construction Strobel</strong> pour la flexibilite</li>
  <li><strong>Construction cup sole</strong> pour la durabilite</li>
  <li><strong>Couture Blake ou Goodyear</strong> sur les sneakers en cuir de luxe</li>
</ul>

<h2>7. Controle Qualite: L Inspection en 40 Points</h2>
<p>Chaque sneaker premium passe par plusieurs controles: coutures, colle, couleurs, alignement de la semelle mesure au millimetre. Les taux de rejet atteignent 15 a 20 pour cent.</p>

<h2>8. Emballage: La Premiere Impression</h2>
<p>L experience unboxing n est pas un hasard. Boites a fermeture magnetique, sacs en coton, embauchoirs de marque et cartes d entretien renforcent le message: cette chaussure vaut la peine d etre entretenue.</p>

<h2>Pourquoi Ca Vaut Le Coup</h2>
<ol>
  <li><strong>De meilleurs materiaux</strong> qui vieillissent au lieu de se degrader</li>
  <li><strong>Des formes sur mesure</strong> qui vont vraiment a votre pied</li>
  <li><strong>Une main d oeuvre qualifiee</strong></li>
  <li><strong>Des technologies de semelles avancees</strong></li>
  <li><strong>Une durabilite</strong> qui rend le cout par port ridiculement bas</li>
</ol>
<p>Une sneaker a 200$ portee 200 fois coute 1$ par port. Une sneaker a 50$ portee 20 fois? 2,50$ par port. Le premium est souvent le choix le moins cher a long terme.</p>

<h2>Pret a Sentir la Difference?</h2>
<p>Chez <strong>SoleVault</strong>, nous selectionnons des sneakers construites avec l artisanat que vous venez de decouvrir.</p>
`.trim();

export async function GET() {
  try {
    let authorId: string;
    const existingAuthor = await db.select().from(authors).where(eq(authors.slug, AUTHOR_SLUG));
    if (existingAuthor.length > 0) {
      authorId = existingAuthor[0].id;
    } else {
      const newAuthor = await db.insert(authors).values({
        name: "SoleVault Editorial",
        slug: AUTHOR_SLUG,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
        email: "editorial@solevault.com",
        bio: "The SoleVault editorial team writes about sneaker culture, craftsmanship, and everything that makes footwear worth talking about.",
        bioFr: "L equipe editoriale de SoleVault ecrit sur la culture sneaker, l artisanat et tout ce qui rend les chaussures dignes d attention.",
        role: "Editorial Team",
        roleFr: "Equipe editoriale",
        active: true,
        sortOrder: 1,
      }).returning({ id: authors.id });
      authorId = newAuthor[0].id;
    }

    const existingPost = await db.select().from(blogPosts).where(eq(blogPosts.slug, POST_SLUG));

    const postData = {
      slug: POST_SLUG,
      title: "Behind the Scenes: How Premium Sneakers Are Made",
      excerpt: "From the first sketch to the final QC check, discover the 60+ step process behind every pair of premium sneakers.",
      content: CONTENT_EN,
      coverImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&q=80",
      titleFr: "Dans les Coulisses: Comment Sont Fabriquees les Sneakers Premium",
      excerptFr: "Du premier croquis au controle qualite final, decouvrez le processus de plus de 60 etapes derriere chaque paire de sneakers premium.",
      contentFr: CONTENT_FR,
      category: "craftsmanship",
      tags: JSON.stringify(["premium", "craftsmanship", "manufacturing", "sneakers", "behind-the-scenes"]),
      tagsFr: JSON.stringify(["premium", "artisanat", "fabrication", "sneakers", "coulisses"]),
      authorId,
      readTime: 8,
      published: true,
      featured: true,
      publishedAt: new Date(),
      seoTitle: "How Premium Sneakers Are Made: A Behind-the-Scenes Guide | SoleVault",
      metaDescription: "Discover the 60+ step process behind premium sneaker manufacturing: from design and materials to hand-stitching, sole engineering, and quality control.",
      focusKeyphrase: "how premium sneakers are made",
      ogImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=630",
      seoTitleFr: "Comment Sont Fabriquees les Sneakers Premium: Guide des Coulisses | SoleVault",
      metaDescriptionFr: "Decouvrez le processus de plus de 60 etapes derriere la fabrication des sneakers premium.",
      focusKeyphraseFr: "comment sont fabriquees les sneakers premium",
      updatedAt: new Date(),
    };

    let action: string;
    if (existingPost.length > 0) {
      await db.update(blogPosts).set(postData).where(eq(blogPosts.slug, POST_SLUG));
      action = "updated";
    } else {
      await db.insert(blogPosts).values(postData);
      action = "created";
    }

    return NextResponse.json({
      success: true,
      action,
      slug: POST_SLUG,
      authorId,
      urls: {
        en: `/en/blog/${POST_SLUG}`,
        fr: `/fr/blog/${POST_SLUG}`,
      },
      note: "IMPORTANT: Delete src/app/api/seed-blog-premium/ after running this once.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
