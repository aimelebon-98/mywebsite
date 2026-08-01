import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

const POST_SLUG = "computer-accessories-business-nigeria";

// Decoder: converts \u escape sequences to real characters at runtime
// This way the SOURCE file only contains ASCII, but DB gets proper UTF-8
function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

const TITLE_FR = d("Comment D\\u00e9marrer une Entreprise Rentable d'Accessoires Informatiques");
const EXCERPT_FR = d("Guide complet \\u00e9tape par \\u00e9tape pour d\\u00e9marrer et faire cro\\u00eetre une entreprise rentable d'accessoires informatiques. Apprenez sur le capital, l'emplacement, les comp\\u00e9tences essentielles, les strat\\u00e9gies marketing et les marges b\\u00e9n\\u00e9ficiaires.");
const COVER_IMAGE_ALT_FR = d("Divers accessoires informatiques dont clavier, souris, casque et c\\u00e2bles sur un bureau");
const SEO_TITLE_FR = d("Comment D\\u00e9marrer une Entreprise d'Accessoires Informatiques");
const META_DESC_FR = d("Guide complet pour d\\u00e9marrer une entreprise rentable d'accessoires informatiques. Capital, comp\\u00e9tences, marketing et conseils.");
const FOCUS_KP_FR = d("entreprise d'accessoires informatiques");

const CONTENT_FR = d(`<p>L'entreprise d'accessoires informatiques est une activit\\u00e9 que n'importe qui peut lancer facilement, tout comme les boutiques de quartier qu'on voit \\u00e0 chaque coin de rue.</p>
<p>Elle ne n\\u00e9cessite pas de comp\\u00e9tences particuli\\u00e8res. Dans cet article, nous vous donnons un guide complet pour d\\u00e9marrer l'entreprise et la faire \\u00e9voluer avec le temps.</p>

<h2>1. Qu'est-ce que les Accessoires Informatiques ?</h2>
<p>Avant de vous lancer, vous devez comprendre en quoi consiste ce business et quelles sont les attentes r\\u00e9alistes.</p>
<p>Quand on parle d'accessoires informatiques, on pense \\u00e0 des articles comme :</p>
<ul>
  <li>Claviers</li>
  <li>Souris</li>
  <li>Imprimantes</li>
  <li>Vid\\u00e9oprojecteurs</li>
  <li>Haut-parleurs</li>
  <li>\\u00c9crans</li>
  <li>Microphones</li>
  <li>Disques durs externes</li>
  <li>Imprimantes multifonctions</li>
  <li>Webcams</li>
  <li>Casques et \\u00e9couteurs</li>
  <li>C\\u00e2bles USB et adaptateurs</li>
  <li>Supports d'ordinateur et refroidisseurs</li>
</ul>
<p>Vous comprenez l'id\\u00e9e - tout ce qui am\\u00e9liore ou compl\\u00e8te un ordinateur.</p>

<h2>2. Pourquoi Se Lancer dans une Entreprise d'Accessoires Informatiques ?</h2>
<p>Prenez juste un moment pour penser au nombre de personnes qui poss\\u00e8dent un ordinateur ou un ordinateur portable.</p>
<p>Selon des estimations r\\u00e9centes, il y a environ <strong>1,2 milliard de PC Windows dans le monde</strong>, plus des millions de MacBooks et autres appareils. Chacun de ces utilisateurs a besoin d'accessoires \\u00e0 un moment donn\\u00e9, du remplacement d'un clavier us\\u00e9 \\u00e0 la mise \\u00e0 niveau du son avec de meilleurs haut-parleurs.</p>
<p>La deuxi\\u00e8me raison de se lancer dans cette activit\\u00e9 est qu'elle est <strong>v\\u00e9ritablement lucrative</strong>. Elle explose comme le march\\u00e9 des accessoires de t\\u00e9l\\u00e9phone. Vous pouvez obtenir jusqu'\\u00e0 <strong>50 % de marge b\\u00e9n\\u00e9ficiaire</strong> sur chaque produit vendu.</p>

<h2>3. Guide \\u00c9tape par \\u00c9tape pour D\\u00e9marrer Votre Entreprise d'Accessoires Informatiques</h2>
<p>Pour commencer, suivez ces \\u00e9tapes cl\\u00e9s :</p>

<h3>A. Familiarisez-vous avec le Secteur</h3>
<p>Si vous \\u00eates nouveau dans une ville, vous demandez votre chemin aux locaux. C'est pareil pour ce type d'activit\\u00e9, vous devez d'abord vous familiariser avec le secteur.</p>
<p>Trouvez quelqu'un qui travaille dans ce domaine depuis un certain temps et recueillez des informations pr\\u00e9cieuses. Cela inclut savoir o\\u00f9 vous approvisionner, quels produits se vendent le plus vite, les risques du m\\u00e9tier, et les marges b\\u00e9n\\u00e9ficiaires \\u00e0 attendre.</p>

<h3>B. Trouvez un Emplacement Adapt\\u00e9</h3>
<p>L'entreprise d'accessoires informatiques n\\u00e9cessite un emplacement bien positionn\\u00e9 pour vendre rapidement. Vous ne voulez pas d'une boutique isol\\u00e9e, choisissez un endroit avec beaucoup de passage. M\\u00eame si le loyer est plus \\u00e9lev\\u00e9 (mais pas excessivement), cela en vaut la peine car vous r\\u00e9cup\\u00e9rez votre investissement plus rapidement.</p>

<h3>C. Enregistrez Votre Entreprise</h3>
<p>L'enregistrement de votre entreprise est essentiel car il vous donne de la cr\\u00e9dibilit\\u00e9. Imaginez un client hors de votre ville qui veut acheter chez vous, il se sentira beaucoup plus \\u00e0 l'aise en payant sur un compte d'entreprise enregistr\\u00e9 plut\\u00f4t qu'un compte personnel.</p>
<p>Ne passez pas \\u00e0 c\\u00f4t\\u00e9 des clients hors de votre zone imm\\u00e9diate.</p>

<h3>D. Approvisionnez Votre Boutique en Accessoires Informatiques</h3>
<p>Une fois les informations recueillies sur o\\u00f9 vous approvisionner, prenez votre premier lot de marchandises. Commencez avec une vari\\u00e9t\\u00e9 d'articles pour voir ce qui se vend le mieux dans votre zone, puis concentrez-vous sur ces produits.</p>

<h2>4. Capital N\\u00e9cessaire pour D\\u00e9marrer une Entreprise d'Accessoires Informatiques</h2>
<p>Pour un bon d\\u00e9part, vous pouvez commencer avec l'\\u00e9quivalent de <strong>500 \\u00e0 1 500 dollars</strong>. Si vous avez plus, c'est encore mieux.</p>
<p>Voici \\u00e0 peu pr\\u00e8s comment r\\u00e9partir ce montant :</p>
<ul>
  <li>Location de boutique (petite) : environ 100 $</li>
  <li>Am\\u00e9nagement (\\u00e9tag\\u00e8res, \\u00e9clairage, enseigne) : environ 150 $</li>
  <li>Stock initial : environ 500 \\u00e0 1 000 $</li>
  <li>Enregistrement et licences : environ 50 $</li>
</ul>
<p>Gardez en t\\u00eate que votre emplacement influence fortement le capital requis. Les zones urbaines co\\u00fbtent plus cher, mais g\\u00e9n\\u00e8rent aussi plus de ventes.</p>

<h2>5. Comp\\u00e9tences Essentielles pour R\\u00e9ussir dans les Accessoires Informatiques</h2>
<p>De quelles comp\\u00e9tences avez-vous besoin ? \\u00c9videmment, il faut savoir utiliser un ordinateur, pas juste au niveau d\\u00e9butant.</p>
<p>Pourquoi c'est important ? Imaginez qu'un client ach\\u00e8te un logiciel chez vous et veut de l'aide pour l'installer sur son ordinateur. Si vous ne savez pas le faire, il ira probablement chez vos concurrents.</p>
<p>L'alternative est d'embaucher quelqu'un qui g\\u00e8re ces questions techniques.</p>
<p>La deuxi\\u00e8me comp\\u00e9tence essentielle est d'\\u00eatre un <strong>bon vendeur</strong>. Comprendre les besoins des clients, proposer des produits compl\\u00e9mentaires (ex : un tapis de souris avec chaque souris), et donner des conseils honn\\u00eates fera grandir votre client\\u00e8le rapidement.</p>

<h2>6. Comment Obtenir Votre Premi\\u00e8re Vente</h2>
<p>Commencez avec votre r\\u00e9seau existant, amis, famille, coll\\u00e8gues. Ne sous-estimez pas le bouche-\\u00e0-oreille, il vous apportera vos premi\\u00e8res ventes.</p>
<p>Publiez vos produits sur <strong>WhatsApp Status</strong> et les r\\u00e9seaux sociaux. Beaucoup d'entrepreneurs gagnent des sommes importantes avec ces canaux gratuits.</p>

<h2>7. Comment Faire Cro\\u00eetre Votre Entreprise d'Accessoires Informatiques</h2>
<p>Pour faire \\u00e9voluer votre entreprise, vous devez atteindre des clients en ligne. Le monde devient num\\u00e9rique, et vous devez suivre la tendance avant que vos concurrents ne vous d\\u00e9passent.</p>
<p>Consid\\u00e9rez :</p>
<ul>
  <li>Cr\\u00e9er un site web simple ou une boutique en ligne</li>
  <li>Ouvrir une page Instagram/Facebook avec de belles photos produits</li>
  <li>Lancer des publicit\\u00e9s cibl\\u00e9es (Facebook, Instagram, TikTok)</li>
  <li>Vous inscrire sur des marketplaces (Jumia, Amazon selon votre pays)</li>
  <li>Proposer un service de livraison</li>
</ul>
<p>Aussi, rappelez-vous que les gens qui ach\\u00e8tent chez vous ont des amis et proches qu'ils vous r\\u00e9f\\u00e9reront avec le temps. Un excellent service \\u00e9gale du marketing gratuit.</p>

<h2>8. Combien de Profit Pouvez-Vous Faire ?</h2>
<p>L'entreprise d'accessoires informatiques est vraiment rentable. Disons que vous r\\u00e9alisez <strong>30 $ de ventes quotidiennes</strong>, au moins <strong>5 $</strong> (voire plus) peuvent \\u00eatre votre profit.</p>
<p>En un mois, vous gagnez environ <strong>5 $ x 30 = 150 $ de b\\u00e9n\\u00e9fice mensuel</strong>. Pas mal pour un d\\u00e9but, et cela \\u00e9volue rapidement avec la croissance de votre inventaire, emplacement, et marketing.</p>
<p>Les vendeurs exp\\u00e9riment\\u00e9s gagnent r\\u00e9guli\\u00e8rement <strong>500 \\u00e0 2 000 $ ou plus par mois</strong>, avec les vendeurs en ligne encore plus.</p>

<h2>Conclusion</h2>
<p>La vie, c'est faire des choix et prendre des d\\u00e9cisions importantes. Commencer quelque chose est toujours mieux que d'esp\\u00e9rer.</p>
<p>L'entreprise d'accessoires informatiques est une activit\\u00e9 lucrative quasiment partout dans le monde. Les gens ach\\u00e8tent des ordinateurs tous les jours, ils auront besoin de quelqu'un pour leur fournir les accessoires dont ils ne peuvent se passer.</p>
<p><strong>Serez-vous celui qui r\\u00e9pond \\u00e0 ce besoin sur le march\\u00e9 ?</strong></p>`);

export async function GET() {
  try {
    const [updated] = await db.update(blogPosts).set({
      titleFr: TITLE_FR,
      excerptFr: EXCERPT_FR,
      contentFr: CONTENT_FR,
      coverImageAltFr: COVER_IMAGE_ALT_FR,
      seoTitleFr: SEO_TITLE_FR,
      metaDescriptionFr: META_DESC_FR,
      focusKeyphraseFr: FOCUS_KP_FR,
    }).where(eq(blogPosts.slug, POST_SLUG)).returning();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "French version updated with proper accents",
      titleFrPreview: TITLE_FR,
      excerptFrPreview: EXCERPT_FR.substring(0, 100),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}