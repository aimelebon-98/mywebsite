import { NextResponse } from "next/server";
import { db } from "@/db";
import { authors, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

const AUTHOR_SLUG = "newdealzone-team";
const POST_SLUG_EN = "computer-accessories-business-nigeria";
const POST_SLUG_FR = "entreprise-accessoires-informatiques";

const COVER_IMAGE = "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?q=80&w=1200&auto=format&fit=crop";

const CONTENT_EN = `<p>The computer accessories business is one anyone can start easily.</p>
<h2>1. What Are Computer Accessories?</h2>
<p>Items like keyboards, mice, printers, monitors, headphones, external drives, and webcams.</p>
<h2>2. Why Start This Business?</h2>
<p>1.2 billion Windows PCs worldwide need accessories. Profit margins can reach 50%.</p>
<h2>3. Step-by-Step Guide</h2>
<p><strong>A. Get Acquainted with the Field:</strong> Learn from experienced sellers.</p>
<p><strong>B. Get a Suitable Location:</strong> Choose high-traffic areas.</p>
<p><strong>C. Register Your Business:</strong> Credibility matters.</p>
<p><strong>D. Stock Your Shop:</strong> Start with variety.</p>
<h2>4. Capital Required</h2>
<p>Start with $500-$1,500 for rent, setup, and inventory.</p>
<h2>5. Skills Needed</h2>
<p>Basic computer knowledge and sales skills are essential.</p>
<h2>6. Getting Your First Sale</h2>
<p>Use word-of-mouth, WhatsApp Status, and social media.</p>
<h2>7. How to Scale</h2>
<p>Build a website, run ads, and use marketplaces.</p>
<h2>8. Profit Potential</h2>
<p>Earn $150-$2,000+ per month depending on scale.</p>
<h2>Conclusion</h2>
<p>Start today. People need accessories daily. Will you be the one to supply them?</p>`;

const CONTENT_FR = `<p>L'entreprise d'accessoires informatiques est facile a lancer.</p>
<h2>1. Qu'est-ce que les Accessoires Informatiques ?</h2>
<p>Claviers, souris, imprimantes, ecrans, casques, disques externes, webcams.</p>
<h2>2. Pourquoi Se Lancer ?</h2>
<p>1,2 milliard de PC Windows dans le monde. Marges jusqu'a 50%.</p>
<h2>3. Guide Etape par Etape</h2>
<p><strong>A. Familiarisez-vous avec le Secteur:</strong> Apprenez des vendeurs experimentes.</p>
<p><strong>B. Trouvez un Emplacement:</strong> Zones a fort passage.</p>
<p><strong>C. Enregistrez Votre Entreprise:</strong> La credibilite compte.</p>
<p><strong>D. Approvisionnez Votre Boutique:</strong> Commencez avec variete.</p>
<h2>4. Capital Necessaire</h2>
<p>Commencez avec 500 a 1 500 dollars.</p>
<h2>5. Competences Necessaires</h2>
<p>Connaissances informatiques de base + vente.</p>
<h2>6. Premiere Vente</h2>
<p>Bouche-a-oreille, WhatsApp Status, reseaux sociaux.</p>
<h2>7. Comment Faire Croitre</h2>
<p>Site web, publicites, marketplaces.</p>
<h2>8. Potentiel de Profit</h2>
<p>150 a 2 000 dollars+ par mois.</p>
<h2>Conclusion</h2>
<p>Commencez aujourd'hui. Les gens ont besoin d'accessoires chaque jour.</p>`;

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
      excerpt: "Complete step-by-step guide to starting and scaling a profitable computer accessories business in Nigeria. Capital, location, skills, and profit tips.",
      content: CONTENT_EN,
      coverImage: COVER_IMAGE,
      coverImageAlt: "Various computer accessories including keyboard, mouse, headphones, and cables on a desk",
      coverImageAltFr: "Divers accessoires informatiques dont clavier, souris, casque et cables sur un bureau",
      titleFr: "Comment Demarrer une Entreprise Rentable d'Accessoires Informatiques",
      excerptFr: "Guide complet etape par etape pour demarrer et faire croitre une entreprise rentable d'accessoires informatiques.",
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
        message: "Existing post updated with all fields (image, alt, French version)",
        id: updated.id,
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
      urls: {
        en: `/en/blog/${POST_SLUG_EN}`,
        fr: `/fr/blog/${POST_SLUG_FR}`,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}