"use client";

import { Star, Quote } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

type Testimonial = {
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  commentFr: string;
  product: string;
  productFr: string;
  color: string;
};

const testimonials: Testimonial[] = [
  { name: "James Wilson",   avatar: "JW", rating: 5,
    comment: "Absolutely love these shoes! The comfort is incredible and they look even better in person. Best purchase I have made this year.",
    commentFr: "J'adore ces chaussures! Le confort est incroyable et elles sont encore plus belles en vrai. Meilleur achat de l'année.",
    product: "Air Max Velocity", productFr: "Air Max Velocity", color: "bg-blue-500" },
  { name: "Sarah Chen",     avatar: "SC", rating: 5,
    comment: "The quality is outstanding. I have worn them daily for 3 months and they still look brand new. Highly recommend SoleVault!",
    commentFr: "La qualité est exceptionnelle. Je les porte tous les jours depuis 3 mois et elles sont comme neuves. Je recommande vivement SoleVault!",
    product: "Cloud Walker", productFr: "Cloud Walker", color: "bg-pink-500" },
  { name: "Michael Torres", avatar: "MT", rating: 5,
    comment: "Great shoes overall! Very comfortable for long walks. Excellent cushioning and support. Will buy more colors soon.",
    commentFr: "Superbes chaussures! Très confortables pour les longues marches. Excellent amorti et maintien. Je vais acheter d'autres coloris bientôt.",
    product: "Marathon Elite", productFr: "Marathon Elite", color: "bg-green-500" },
  { name: "Emily Parker",   avatar: "EP", rating: 5,
    comment: "I am obsessed with these! Got so many compliments. The WhatsApp ordering was super easy too. Will definitely buy again.",
    commentFr: "Je suis obsédée par ces chaussures! J'ai reçu tellement de compliments. La commande via WhatsApp était très simple. J'achèterai à nouveau, c'est sûr.",
    product: "Neon Pulse", productFr: "Neon Pulse", color: "bg-purple-500" },
  { name: "David Kim",      avatar: "DK", rating: 5,
    comment: "Premium quality at a reasonable price. The cushioning is next level. My feet have never felt this good!",
    commentFr: "Qualité premium à un prix raisonnable. L'amorti est incomparable. Mes pieds ne se sont jamais sentis aussi bien!",
    product: "Velocity Pro X", productFr: "Velocity Pro X", color: "bg-amber-500" },
  { name: "Lisa Anderson",  avatar: "LA", rating: 5,
    comment: "Beautiful design and very comfortable. Shipping was fast and packaging was excellent. Love supporting this brand.",
    commentFr: "Design magnifique et très confortable. Livraison rapide et emballage impeccable. J'adore soutenir cette marque.",
    product: "Oxford Gentleman", productFr: "Oxford Gentleman", color: "bg-teal-500" },
  { name: "Robert Martinez",avatar: "RM", rating: 5,
    comment: "These running shoes changed my game. PR after PR since I got them. The energy return is phenomenal!",
    commentFr: "Ces chaussures de course ont tout changé pour moi. Record sur record depuis que je les ai. Le retour d'énergie est phénoménal!",
    product: "SpeedStrike", productFr: "SpeedStrike", color: "bg-red-500" },
  { name: "Amanda Blake",   avatar: "AB", rating: 5,
    comment: "Ordered 3 pairs already! The leather quality on the formal shoes is exceptional. Look and feel like shoes twice the price.",
    commentFr: "J'ai déjà commandé 3 paires! La qualité du cuir des chaussures habillées est exceptionnelle. On dirait des chaussures deux fois plus chères.",
    product: "Classic Leather Elite", productFr: "Classic Leather Elite", color: "bg-indigo-500" },
];

export default function ReviewsSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isFr = locale === "fr";

  return (
    <section className="py-16 lg:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {t("reviewsRating")}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">{t("reviewsTitle")}</h2>
          <p className="text-gray-500 max-w-md mx-auto">{t("reviewsSubtitle")}</p>
        </div>
      </div>

      {/* Marquee row 1 */}
      <div className="relative mb-4">
        <div className="flex gap-4 animate-marquee">
          {[...testimonials, ...testimonials].map((review, i) => (
            <ReviewCard key={`r1-${i}`} review={review} isFr={isFr} boughtLabel={t("reviewsBought")} verifiedLabel={t("reviewsVerified")} />
          ))}
        </div>
      </div>

      {/* Marquee row 2 - reverse */}
      <div className="relative">
        <div className="flex gap-4 animate-marquee" style={{ animationDirection: "reverse", animationDuration: "35s" }}>
          {[...testimonials.slice(4), ...testimonials.slice(0, 4), ...testimonials.slice(4), ...testimonials.slice(0, 4)].map((review, i) => (
            <ReviewCard key={`r2-${i}`} review={review} isFr={isFr} boughtLabel={t("reviewsBought")} verifiedLabel={t("reviewsVerified")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  isFr,
  boughtLabel,
  verifiedLabel,
}: {
  review: Testimonial;
  isFr: boolean;
  boughtLabel: string;
  verifiedLabel: string;
}) {
  const displayComment = isFr ? review.commentFr : review.comment;
  const displayProduct = isFr ? review.productFr : review.product;

  return (
    <div className="flex-shrink-0 w-[340px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 ${review.color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{review.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{review.name}</p>
          <p className="text-xs text-gray-400">{boughtLabel} {displayProduct}</p>
        </div>
        <Quote className="w-5 h-5 text-gray-200 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-0.5 mb-3">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{displayComment}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {verifiedLabel}
      </div>
    </div>
  );
}