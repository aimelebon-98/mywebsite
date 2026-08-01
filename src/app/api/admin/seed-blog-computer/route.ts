import { NextResponse } from "next/server";
import { db } from "@/db";
import { authors, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

const AUTHOR_SLUG = "newdealzone-team";
const POST_SLUG_EN = "computer-accessories-business-nigeria";
const POST_SLUG_FR = "entreprise-accessoires-informatiques";
const COVER_IMAGE = "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?q=80&w=1200&auto=format&fit=crop";

const CONTENT_EN = `<p>The computer accessories business is one anyone can start easily — much like the provision shops we see on every street corner.</p>
<p>It does not require any special skills. In this post, we're going to give you a complete guide on how to start the business and scale it over time.</p>

<h2>1. What Are Computer Accessories?</h2>
<p>Before diving in, you need to understand what the business is all about and what your expectations should be.</p>
<p>When we talk about computer accessories, your mind should go to items like:</p>
<ul>
  <li>Keyboards</li>
  <li>Mice</li>
  <li>Printers</li>
  <li>Projectors</li>
  <li>Speakers</li>
  <li>Monitors</li>
  <li>Microphones</li>
  <li>External drives</li>
  <li>All-in-one printers</li>
  <li>Webcams</li>
  <li>Headphones</li>
  <li>USB cables and adapters</li>
  <li>Laptop stands and cooling pads</li>
</ul>
<p>You get the idea — anything that enhances or supports a computer.</p>

<h2>2. Why Start a Computer Accessories Business?</h2>
<p>Just take a moment and think about how many people own a computer or laptop.</p>
<p>According to recent estimates, there are about <strong>1.2 billion Windows PCs worldwide</strong>, plus millions of MacBooks and other devices. Every one of these users needs accessories at some point — from replacing worn-out keyboards to upgrading their sound with better speakers.</p>
<p>The second reason to go into the computer accessories business is that it's <strong>genuinely lucrative</strong>. It booms just like the phone accessories market. You can get up to <strong>50% profit margins</strong> on each product you sell.</p>

<h2>3. Step-by-Step Guide to Starting Your Computer Accessories Business</h2>
<p>To get started with a computer accessories business, follow these key steps:</p>

<h3>A. Get Acquainted with the Field</h3>
<p>If you're new to a town, you ask for directions from people who live there. The same goes for this type of business — you need to get familiar with the field first.</p>
<p>Find someone who has been in the field and get vital information from them. This includes learning where to source your goods, which products move fastest, the risks involved, and profit margins to expect.</p>

<h3>B. Get a Suitable Location</h3>
<p>The computer accessories business requires a well-positioned location for quick sales. You don't want your shop tucked away in an isolated area — instead, choose a spot with heavy foot traffic. Even if the rent is higher (though not excessively so), it's worth it because you'll recover your investment faster.</p>

<h3>C. Register Your Business</h3>
<p>Registering your business is vital because it gives you credibility. Imagine a customer outside your city wanting to buy from you — they'll feel much more comfortable paying into a registered business account than a personal one.</p>
<p>Don't miss out on customers outside your immediate location.</p>

<h3>D. Stock Your Shop with Computer Accessories</h3>
<p>Once you've gathered the information on where to source products, get your first batch of goods. Start with a variety of items to see what sells best in your area, then double down on those.</p>

<h2>4. Capital Required to Start a Computer Accessories Business</h2>
<p>For a solid start, you can begin with an equivalent of <strong>$500 to $1,500</strong>. If you have more, even better.</p>
<p>Roughly speaking, here's how you might split it:</p>
<ul>
  <li>Shop rent (small): ~$100</li>
  <li>Shop setup (shelves, lighting, signage): ~$150</li>
  <li>Initial inventory: ~$500-$1,000</li>
  <li>Registration and licensing: ~$50</li>
</ul>
<p>Keep in mind that your location will heavily influence the initial capital required. Urban areas cost more, but they also generate more sales.</p>

<h2>5. Essential Skills for a Successful Computer Accessories Business</h2>
<p>What skills do you need? Obviously, you need to know how to operate a computer — not just at a beginner level.</p>
<p>Why is this important? Let's say a client buys software from you and wants help installing it on their computer. If you don't know how, they'll likely turn to your competitors who do.</p>
<p>The alternative is to hire someone who knows how to handle those technical issues.</p>
<p>The second essential skill is being a <strong>good salesperson</strong>. Understanding customer needs, upselling complementary products (e.g., a mouse pad with every mouse), and giving honest advice will grow your customer base fast.</p>

<h2>6. How to Get Your First Sale</h2>
<p>Start with your existing network — friends, family, colleagues. Don't underestimate word-of-mouth marketing; it will surely bring you your first sales.</p>
<p>Start posting your products on <strong>WhatsApp Status</strong> and social media. Many entrepreneurs make significant money using these free channels alone.</p>

<h2>7. How to Scale Your Computer Accessories Business</h2>
<p>To scale your business, you need to reach customers online. The world is going digital, and you need to follow the trend before your competitors leave you behind.</p>
<p>Consider:</p>
<ul>
  <li>Building a simple website or online store</li>
  <li>Starting an Instagram/Facebook page with product photos</li>
  <li>Running targeted ads (Facebook, Instagram, TikTok)</li>
  <li>Setting up on marketplaces (Jumia, Amazon, eBay depending on your country)</li>
  <li>Offering delivery services</li>
</ul>
<p>Also, remember that people who buy from you have friends and relatives whom they'll refer to you over time. Excellent service equals free marketing.</p>

<h2>8. How Much Profit Can You Make?</h2>
<p>The computer accessories business is genuinely profitable. Let's say you make <strong>$30 in daily sales</strong> — at least <strong>$5</strong> (if not more) can be your profit.</p>
<p>In a month, you'll be earning approximately <strong>$5 x 30 = $150 in monthly profit</strong>. Not bad for a beginner, and this scales quickly as you grow your inventory, location, and marketing.</p>
<p>Experienced sellers routinely make <strong>$500 to $2,000+ per month</strong>, with online sellers even higher.</p>

<h2>Conclusion</h2>
<p>Life is all about making choices and taking vital decisions. Starting something is always better than merely hoping.</p>
<p>The computer accessories business is a lucrative venture almost anywhere in the world. People buy computers daily, so they'll need someone to supply the accessories they can't live without.</p>
<p><strong>Will you be the one to fill this need in the market?</strong></p>`;

const CONTENT_FR = `<p>L'entreprise d'accessoires informatiques est une activite que n'importe qui peut lancer facilement, tout comme les boutiques de quartier qu'on voit a chaque coin de rue.</p>
<p>Elle ne necessite pas de competences particulieres. Dans cet article, nous vous donnons un guide complet pour demarrer l'entreprise et la faire evoluer avec le temps.</p>

<h2>1. Qu'est-ce que les Accessoires Informatiques ?</h2>
<p>Avant de vous lancer, vous devez comprendre en quoi consiste ce business et quelles sont les attentes realistes.</p>
<p>Quand on parle d'accessoires informatiques, on pense a des articles comme :</p>
<ul>
  <li>Claviers</li>
  <li>Souris</li>
  <li>Imprimantes</li>
  <li>Videoprojecteurs</li>
  <li>Haut-parleurs</li>
  <li>Ecrans</li>
  <li>Microphones</li>
  <li>Disques durs externes</li>
  <li>Imprimantes multifonctions</li>
  <li>Webcams</li>
  <li>Casques et ecouteurs</li>
  <li>Cables USB et adaptateurs</li>
  <li>Supports d'ordinateur et refroidisseurs</li>
</ul>
<p>Vous comprenez l'idee, tout ce qui ameliore ou complete un ordinateur.</p>

<h2>2. Pourquoi Se Lancer dans une Entreprise d'Accessoires Informatiques ?</h2>
<p>Prenez juste un moment pour penser au nombre de personnes qui possedent un ordinateur ou un ordinateur portable.</p>
<p>Selon des estimations recentes, il y a environ <strong>1,2 milliard de PC Windows dans le monde</strong>, plus des millions de MacBooks et autres appareils. Chacun de ces utilisateurs a besoin d'accessoires a un moment donne, du remplacement d'un clavier use a la mise a niveau du son avec de meilleurs haut-parleurs.</p>
<p>La deuxieme raison de se lancer dans cette activite est qu'elle est <strong>veritablement lucrative</strong>. Elle explose comme le marche des accessoires de telephone. Vous pouvez obtenir jusqu'a <strong>50% de marge beneficiaire</strong> sur chaque produit vendu.</p>

<h2>3. Guide Etape par Etape pour Demarrer Votre Entreprise d'Accessoires Informatiques</h2>
<p>Pour commencer, suivez ces etapes cles :</p>

<h3>A. Familiarisez-vous avec le Secteur</h3>
<p>Si vous etes nouveau dans une ville, vous demandez votre chemin aux locaux. C'est pareil pour ce type d'activite, vous devez d'abord vous familiariser avec le secteur.</p>
<p>Trouvez quelqu'un qui travaille dans ce domaine depuis un certain temps et recueillez des informations precieuses. Cela inclut savoir ou vous approvisionner, quels produits se vendent le plus vite, les risques du metier, et les marges beneficiaires a attendre.</p>

<h3>B. Trouvez un Emplacement Adapte</h3>
<p>L'entreprise d'accessoires informatiques necessite un emplacement bien positionne pour vendre rapidement. Vous ne voulez pas d'une boutique isolee, choisissez un endroit avec beaucoup de passage. Meme si le loyer est plus eleve (mais pas excessivement), cela en vaut la peine car vous recuperez votre investissement plus rapidement.</p>

<h3>C. Enregistrez Votre Entreprise</h3>
<p>L'enregistrement de votre entreprise est essentiel car il vous donne de la credibilite. Imaginez un client hors de votre ville qui veut acheter chez vous, il se sentira beaucoup plus a l'aise en payant sur un compte d'entreprise enregistre plutot qu'un compte personnel.</p>
<p>Ne passez pas a cote des clients hors de votre zone immediate.</p>

<h3>D. Approvisionnez Votre Boutique en Accessoires Informatiques</h3>
<p>Une fois les informations recueillies sur ou vous approvisionner, prenez votre premier lot de marchandises. Commencez avec une variete d'articles pour voir ce qui se vend le mieux dans votre zone, puis concentrez-vous sur ces produits.</p>

<h2>4. Capital Necessaire pour Demarrer une Entreprise d'Accessoires Informatiques</h2>
<p>Pour un bon depart, vous pouvez commencer avec l'equivalent de <strong>500 a 1 500 dollars</strong>. Si vous avez plus, c'est encore mieux.</p>
<p>Voici a peu pres comment repartir ce montant :</p>
<ul>
  <li>Location de boutique (petite) : environ 100 $</li>
  <li>Amenagement (etageres, eclairage, enseigne) : environ 150 $</li>
  <li>Stock initial : environ 500 a 1 000 $</li>
  <li>Enregistrement et licences : environ 50 $</li>
</ul>
<p>Gardez en tete que votre emplacement influence fortement le capital requis. Les zones urbaines coutent plus cher, mais generent aussi plus de ventes.</p>

<h2>5. Competences Essentielles pour Reussir dans les Accessoires Informatiques</h2>
<p>De quelles competences avez-vous besoin ? Evidemment, il faut savoir utiliser un ordinateur, pas juste au niveau debutant.</p>
<p>Pourquoi c'est important ? Imaginez qu'un client achete un logiciel chez vous et veut de l'aide pour l'installer sur son ordinateur. Si vous ne savez pas le faire, il ira probablement chez vos concurrents.</p>
<p>L'alternative est d'embaucher quelqu'un qui gere ces questions techniques.</p>
<p>La deuxieme competence essentielle est d'etre un <strong>bon vendeur</strong>. Comprendre les besoins des clients, proposer des produits complementaires (ex : un tapis de souris avec chaque souris), et donner des conseils honnetes fera grandir votre clientele rapidement.</p>

<h2>6. Comment Obtenir Votre Premiere Vente</h2>
<p>Commencez avec votre reseau existant, amis, famille, collegues. Ne sous-estimez pas le bouche-a-oreille, il vous apportera vos premieres ventes.</p>
<p>Publiez vos produits sur <strong>WhatsApp Status</strong> et les reseaux sociaux. Beaucoup d'entrepreneurs gagnent des sommes importantes avec ces canaux gratuits.</p>

<h2>7. Comment Faire Croitre Votre Entreprise d'Accessoires Informatiques</h2>
<p>Pour faire evoluer votre entreprise, vous devez atteindre des clients en ligne. Le monde devient numerique, et vous devez suivre la tendance avant que vos concurrents ne vous depassent.</p>
<p>Considerez :</p>
<ul>
  <li>Creer un site web simple ou une boutique en ligne</li>
  <li>Ouvrir une page Instagram/Facebook avec de belles photos produits</li>
  <li>Lancer des publicites ciblees (Facebook, Instagram, TikTok)</li>
  <li>Vous inscrire sur des marketplaces (Jumia, Amazon selon votre pays)</li>
  <li>Proposer un service de livraison</li>
</ul>
<p>Aussi, rappelez-vous que les gens qui achetent chez vous ont des amis et proches qu'ils vous referreront avec le temps. Un excellent service egale du marketing gratuit.</p>

<h2>8. Combien de Profit Pouvez-Vous Faire ?</h2>
<p>L'entreprise d'accessoires informatiques est vraiment rentable. Disons que vous realisez <strong>30 $ de ventes quotidiennes</strong>, au moins <strong>5 $</strong> (voire plus) peuvent etre votre profit.</p>
<p>En un mois, vous gagnez environ <strong>5 $ x 30 = 150 $ de benefice mensuel</strong>. Pas mal pour un debut, et cela evolue rapidement avec la croissance de votre inventaire, emplacement, et marketing.</p>
<p>Les vendeurs experimentes gagnent regulierement <strong>500 a 2 000 $ ou plus par mois</strong>, avec les vendeurs en ligne encore plus.</p>

<h2>Conclusion</h2>
<p>La vie, c'est faire des choix et prendre des decisions importantes. Commencer quelque chose est toujours mieux que d'esperer.</p>
<p>L'entreprise d'accessoires informatiques est une activite lucrative quasiment partout dans le monde. Les gens achetent des ordinateurs tous les jours, ils auront besoin de quelqu'un pour leur fournir les accessoires dont ils ne peuvent se passer.</p>
<p><strong>Serez-vous celui qui repond a ce besoin sur le marche ?</strong></p>`;

function calcReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET() {
  try {
    let authorId: string | null = null;
    const existing = await db.select().from(authors).where(eq(authors.slug, AUTHOR_SLUG));

    if (existing.length > 0) {
      authorId = existing[0].id;
    } else {
      const altSlugs = ["solevault-editorial", "solevault-team", "newdealzone-editorial"];
      for (const alt of altSlugs) {
        const found = await db.select().from(authors).where(eq(authors.slug, alt));
        if (found.length > 0) {
          authorId = found[0].id;
          break;
        }
      }

      if (!authorId) {
        const [newAuthor] = await db.insert(authors).values({
          name: "NewDealZone Team",
          slug: AUTHOR_SLUG,
          avatar: "https://ui-avatars.com/api/?name=NewDealZone+Team&background=CA3F2E&color=fff&bold=true&size=200",
          email: "team@newdealzone.com",
          bio: "The NewDealZone editorial team writes about business ideas, tech, and entrepreneurship.",
          bioFr: "L'equipe editoriale de NewDealZone ecrit sur les idees de business, la tech, et l'entrepreneuriat.",
          role: "Editorial Team",
          roleFr: "Equipe Editoriale",
          active: true,
          sortOrder: 1,
        }).returning();
        authorId = newAuthor.id;
      }
    }

    const existingPost = await db.select().from(blogPosts).where(eq(blogPosts.slug, POST_SLUG_EN));

    const postValues = {
      slug: POST_SLUG_EN,
      slugFr: POST_SLUG_FR,
      title: "How to Start a Profitable Computer Accessories Business in Nigeria",
      excerpt: "Complete step-by-step guide to starting and scaling a profitable computer accessories business in Nigeria. Learn about capital, location, essential skills, marketing strategies, and profit margins.",
      content: CONTENT_EN,
      coverImage: COVER_IMAGE,
      coverImageAlt: "Various computer accessories including keyboard, mouse, headphones, and cables on a desk",
      coverImageAltFr: "Divers accessoires informatiques dont clavier, souris, casque et cables sur un bureau",
      titleFr: "Comment Demarrer une Entreprise Rentable d'Accessoires Informatiques",
      excerptFr: "Guide complet etape par etape pour demarrer et faire croitre une entreprise rentable d'accessoires informatiques. Apprenez sur le capital, l'emplacement, les competences essentielles, les strategies marketing et les marges beneficiaires.",
      contentFr: CONTENT_FR,
      category: "business",
      tags: JSON.stringify(["business ideas", "entrepreneurship", "computer accessories", "small business", "Nigeria", "startup guide"]),
      tagsFr: JSON.stringify(["idees de business", "entrepreneuriat", "accessoires informatiques", "petite entreprise", "guide startup"]),
      authorId,
      readTime: calcReadTime(CONTENT_EN),
      published: true,
      featured: false,
      publishedAt: new Date(),
      seoTitle: "How to Start a Profitable Computer Accessories Business in Nigeria",
      metaDescription: "Learn how to start a profitable computer accessories business in Nigeria. Complete guide with capital, location, skills, and marketing tips.",
      focusKeyphrase: "computer accessories business in Nigeria",
      ogImage: COVER_IMAGE,
      canonicalUrl: null,
      noIndex: false,
      seoTitleFr: "Comment Demarrer une Entreprise d'Accessoires Informatiques",
      metaDescriptionFr: "Guide complet pour demarrer une entreprise rentable d'accessoires informatiques. Capital, competences, marketing et conseils.",
      focusKeyphraseFr: "entreprise d'accessoires informatiques",
    };

    if (existingPost.length > 0) {
      const [updated] = await db.update(blogPosts).set(postValues).where(eq(blogPosts.slug, POST_SLUG_EN)).returning();
      return NextResponse.json({
        ok: true,
        message: "Existing post UPDATED with full content, image, and translations",
        id: updated.id,
        readTime: updated.readTime,
        wordCount: CONTENT_EN.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length,
        urls: {
          en: `/en/blog/${POST_SLUG_EN}`,
          fr: `/fr/blog/${POST_SLUG_FR}`,
        },
      });
    }

    const [post] = await db.insert(blogPosts).values(postValues).returning();
    return NextResponse.json({
      ok: true,
      message: "Post created successfully!",
      id: post.id,
      readTime: post.readTime,
      urls: {
        en: `/en/blog/${POST_SLUG_EN}`,
        fr: `/fr/blog/${POST_SLUG_FR}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}