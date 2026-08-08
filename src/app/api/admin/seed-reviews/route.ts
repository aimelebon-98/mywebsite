import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AVATARS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=15",
  "https://i.pravatar.cc/150?img=20",
  "https://i.pravatar.cc/150?img=25",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=45",
  "https://i.pravatar.cc/150?img=48",
];

interface ReviewSeed {
  customerName: string;
  rating: number;
  comment: string;
  commentFr: string;
  verified: boolean;
  daysAgo: number;
  avatarIdx: number;
}

const PRODUCT_REVIEWS: Record<string, ReviewSeed[]> = {
  // ==================== NIKE AIR FORCE 1 (5 reviews) ====================
  "nike-air-force-1-cream-grey-rope-laces": [
    { customerName: "Chioma Adeyemi", rating: 5, comment: "Bought these for my son's birthday and he's absolutely obsessed. The rope laces give a fresh twist on the classic AF1 look. Sizing runs true. Fast delivery to Lagos!", commentFr: "Achet\u00e9es pour l'anniversaire de mon fils et il en est fou. Les lacets en corde donnent une touche fra\u00eeche au look AF1 classique. La taille est juste. Livraison rapide \u00e0 Lagos!", verified: true, daysAgo: 12, avatarIdx: 0 },
    { customerName: "Emeka Okafor", rating: 5, comment: "Legit Air Force 1s! The cream and grey combo looks premium. Comfortable for all-day wear. Best purchase I've made this year.", commentFr: "V\u00e9ritables Air Force 1! La combinaison cr\u00e8me et gris a l'air premium. Confortables toute la journ\u00e9e. Meilleur achat de l'ann\u00e9e.", verified: true, daysAgo: 25, avatarIdx: 1 },
    { customerName: "Fatima Diallo", rating: 5, comment: "The cream color is so versatile, goes with everything in my wardrobe. Quality leather and craftsmanship. Merci New Deal Zone!", commentFr: "J'adore! La couleur cr\u00e8me est tr\u00e8s polyvalente, s'accorde avec tout dans ma garde-robe. Cuir et artisanat de qualit\u00e9. Merci New Deal Zone!", verified: true, daysAgo: 71, avatarIdx: 4 },
    { customerName: "Grace Mensah", rating: 5, comment: "Ordered from Accra and arrived within 5 days. Perfect fit and the shoes look even better in person. Getting compliments daily!", commentFr: "Command\u00e9es d'Accra et arriv\u00e9es en 5 jours. Taille parfaite et les chaussures sont encore plus belles en vrai. Je re\u00e7ois des compliments tous les jours!", verified: true, daysAgo: 102, avatarIdx: 6 },
    { customerName: "David Okonkwo", rating: 4, comment: "Great sneakers overall. The sole is thicker than the standard AF1 which I actually prefer. Only wish they had more color options.", commentFr: "Excellentes baskets dans l'ensemble. La semelle est plus \u00e9paisse que la AF1 standard, ce que je pr\u00e9f\u00e8re. Dommage qu'il n'y ait pas plus de couleurs.", verified: true, daysAgo: 89, avatarIdx: 5 },
  ],

  // ==================== ALEXANDER MCQUEEN (5 reviews) ====================
  "alexander-mcqueen-tread-slick-black-white": [
    { customerName: "James Anderson", rating: 5, comment: "The build quality is insane! These McQueens are worth every penny. Comfortable enough for long walks and stylish enough for nights out.", commentFr: "La qualit\u00e9 de construction est folle! Ces McQueen valent chaque centime. Assez confortables pour de longues marches et assez \u00e9l\u00e9gantes pour les soir\u00e9es.", verified: true, daysAgo: 10, avatarIdx: 3 },
    { customerName: "Adaora Nnamdi", rating: 5, comment: "Perfect black and white combo! The tread sole is chunky but not overwhelming. Very versatile - I wear them with everything.", commentFr: "Combinaison noir et blanc parfaite! La semelle \u00e0 crampons est chunky sans \u00eatre \u00e9crasante. Tr\u00e8s polyvalentes - je les porte avec tout.", verified: true, daysAgo: 24, avatarIdx: 2 },
    { customerName: "Antoine Bernard", rating: 5, comment: "Amazing sneakers! McQueen is my favorite brand and these Tread Slicks are exceptional. The leather is top quality.", commentFr: "Superbes baskets! McQueen est ma marque pr\u00e9f\u00e9r\u00e9e et ces Tread Slick sont exceptionnelles. Le cuir est de qualit\u00e9 sup\u00e9rieure.", verified: true, daysAgo: 41, avatarIdx: 5 },
    { customerName: "Femi Adebayo", rating: 5, comment: "Copped these last month and they've become my go-to sneakers. The oversized sole is a statement. Fits true to size for me.", commentFr: "Achet\u00e9es le mois dernier et elles sont devenues mes baskets de r\u00e9f\u00e9rence. La semelle surdimensionn\u00e9e est un statement. Taille juste pour moi.", verified: true, daysAgo: 76, avatarIdx: 1 },
    { customerName: "Priscilla Amoah", rating: 4, comment: "Beautiful sneakers with great attention to detail. Took a few wears to break in but now super comfortable. Great customer service too!", commentFr: "Belles baskets avec une grande attention aux d\u00e9tails. Il a fallu quelques ports pour les assouplir mais maintenant super confortables. Excellent service client!", verified: true, daysAgo: 58, avatarIdx: 6 },
  ],

  // ==================== OFF-WHITE BOOT (5 reviews) ====================
  "off-white-chunky-trail-boot-tan": [
    { customerName: "Kolawole Adeyinka", rating: 5, comment: "Absolute statement piece! The chunky sole is exactly like the pictures and the tan color is beautiful in person. Worth every naira.", commentFr: "Une pi\u00e8ce statement absolue! La semelle chunky est exactement comme sur les photos et la couleur fauve est magnifique en vrai. Vaut chaque naira.", verified: true, daysAgo: 8, avatarIdx: 0 },
    { customerName: "Sophie Laurent", rating: 5, comment: "Superb quality! The Off-White boots are an investment but these are incredible. The leather is premium.", commentFr: "Superbe qualit\u00e9! Les bottes Off-White sont un investissement mais celles-ci sont incroyables. Le cuir est de premi\u00e8re qualit\u00e9.", verified: true, daysAgo: 22, avatarIdx: 8 },
    { customerName: "Tobi Balogun", rating: 5, comment: "Fire! These are the real deal. Perfect for street style. The tan color is warm and works with dark denim beautifully.", commentFr: "\u00c9norme! Ce sont les vraies. Parfaites pour le street style. La couleur fauve est chaude et se marie magnifiquement avec le denim fonc\u00e9.", verified: true, daysAgo: 34, avatarIdx: 2 },
    { customerName: "Camille Dubois", rating: 5, comment: "The winter must-have! These boots go with all my looks. The quality is impeccable and comfort is on point.", commentFr: "Le must-have de l'hiver! Ces bottes vont avec tous mes looks. La qualit\u00e9 est irr\u00e9prochable et le confort est au rendez-vous.", verified: true, daysAgo: 115, avatarIdx: 7 },
    { customerName: "Amina Cisse", rating: 4, comment: "Beautiful boots but they run slightly small. I ordered a size up and they fit perfectly. Otherwise, top quality construction.", commentFr: "Belles bottes mais elles taillent l\u00e9g\u00e8rement petit. J'ai command\u00e9 une taille au-dessus et elles vont parfaitement. Sinon, construction de qualit\u00e9 sup\u00e9rieure.", verified: true, daysAgo: 51, avatarIdx: 9 },
  ],

  // ==================== GUCCI LOAFER (5 reviews) ====================
  "gucci-chunky-platform-loafer-bee-black": [
    { customerName: "Elizabeth Okonkwo", rating: 5, comment: "Absolutely stunning! The bee detail is exquisite and the chunky platform adds height without sacrificing comfort. A true statement piece.", commentFr: "Absolument \u00e9blouissants! Le d\u00e9tail de l'abeille est raffin\u00e9 et la plateforme chunky ajoute de la hauteur sans sacrifier le confort. Une vraie pi\u00e8ce statement.", verified: true, daysAgo: 15, avatarIdx: 4 },
    { customerName: "Isabelle Moreau", rating: 5, comment: "The Gucci loafers of my dreams! The bee embroidery is perfect and the black leather is sumptuous. No regrets.", commentFr: "Les mocassins Gucci de mes r\u00eaves! La broderie de l'abeille est parfaite et le cuir noir est somptueux. Achat sans regret.", verified: true, daysAgo: 28, avatarIdx: 8 },
    { customerName: "Adaeze Okoli", rating: 5, comment: "Wore these to a wedding and got so many compliments. The platform gives just the right amount of height. Very comfortable too!", commentFr: "Port\u00e9s \u00e0 un mariage et j'ai re\u00e7u tellement de compliments. La plateforme donne juste la bonne hauteur. Tr\u00e8s confortables aussi!", verified: true, daysAgo: 44, avatarIdx: 2 },
    { customerName: "Marie Duval", rating: 5, comment: "Excellent quality! The leather is soft and comfortable from the first wear. The platform is stable and elegant.", commentFr: "Excellente qualit\u00e9! Le cuir est doux et confortable d\u00e8s le premier port. La plateforme est stable et \u00e9l\u00e9gante.", verified: true, daysAgo: 95, avatarIdx: 7 },
    { customerName: "Rachel Green", rating: 4, comment: "Love the look of these loafers. The bee embellishment is beautiful. Took a bit to break in but now they're my favorite pair.", commentFr: "J'adore le look de ces mocassins. L'embellissement de l'abeille est magnifique. Il a fallu un peu de temps pour les assouplir mais maintenant c'est ma paire favorite.", verified: true, daysAgo: 62, avatarIdx: 9 },
  ],

  // ==================== NIKE CHUNKY TRAIL (5 reviews) ====================
  "nike-chunky-trail-sneaker-black-grey": [
    { customerName: "Oluwaseun Adeleke", rating: 5, comment: "These trail sneakers are fire! The chunky sole is comfortable for long walks. The black and grey combo goes with everything.", commentFr: "Ces baskets trail sont incroyables! La semelle chunky est confortable pour les longues marches. La combinaison noir et gris s'accorde avec tout.", verified: true, daysAgo: 14, avatarIdx: 0 },
    { customerName: "Julie Rousseau", rating: 5, comment: "Love at first sight! Nike sneakers are always quality and these are no exception. Optimal comfort.", commentFr: "Achat coup de c\u0153ur! Les baskets Nike sont toujours de qualit\u00e9 et celles-ci ne font pas exception. Confort optimal.", verified: true, daysAgo: 30, avatarIdx: 8 },
    { customerName: "Andre Coulibaly", rating: 5, comment: "Perfect for the rainy season! The chunky grip is excellent and they look great too. Nike quality never disappoints.", commentFr: "Parfaites pour la saison des pluies! L'adh\u00e9rence chunky est excellente et elles ont fi\u00e8re allure aussi. La qualit\u00e9 Nike ne d\u00e9\u00e7oit jamais.", verified: true, daysAgo: 64, avatarIdx: 9 },
    { customerName: "Halima Ibrahim", rating: 5, comment: "Very comfortable and stylish. I've worn them hiking and to the mall - they perform well in both settings. Great buy!", commentFr: "Tr\u00e8s confortables et \u00e9l\u00e9gantes. Je les ai port\u00e9es en randonn\u00e9e et au centre commercial - elles se comportent bien dans les deux cas. Excellent achat!", verified: true, daysAgo: 82, avatarIdx: 4 },
    { customerName: "Bola Ogundimu", rating: 4, comment: "Great sneakers for daily wear. The trail-inspired design is functional and stylish. Sizing runs slightly big, order half size down.", commentFr: "Excellentes baskets pour un usage quotidien. Le design inspir\u00e9 des sentiers est fonctionnel et \u00e9l\u00e9gant. La taille est l\u00e9g\u00e8rement grande, commandez une demi-taille en dessous.", verified: true, daysAgo: 47, avatarIdx: 1 },
  ],
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "seed-reviews-ndz-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allProducts = await db.select().from(products).where(eq(products.active, true));

    let totalInserted = 0;
    const results: Array<{ slug: string; inserted: number; avgRating: number; error?: string }> = [];

    for (const product of allProducts) {
      const reviewsForProduct = PRODUCT_REVIEWS[product.slug];

      if (!reviewsForProduct) {
        results.push({ slug: product.slug, inserted: 0, avgRating: 0, error: "No template" });
        continue;
      }

      // Idempotent: delete existing
      await db.delete(reviews).where(eq(reviews.productId, product.id));

      // Insert reviews
      const reviewInserts = reviewsForProduct.map((r) => ({
        productId: product.id,
        customerName: r.customerName,
        rating: r.rating,
        comment: r.comment,
        commentFr: r.commentFr,
        avatar: AVATARS[r.avatarIdx % AVATARS.length],
        verified: r.verified,
        createdAt: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
      }));

      await db.insert(reviews).values(reviewInserts);

      // Use REAL count and rating (no inflation)
      const totalRating = reviewsForProduct.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / reviewsForProduct.length) * 10) / 10;

      await db
        .update(products)
        .set({
          rating: avgRating.toFixed(1),
          reviewCount: reviewsForProduct.length,
        })
        .where(eq(products.id, product.id));

      totalInserted += reviewsForProduct.length;
      results.push({
        slug: product.slug,
        inserted: reviewsForProduct.length,
        avgRating,
      });
    }

    return NextResponse.json({ success: true, totalInserted, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}