"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "James Wilson", avatar: "JW", rating: 5, comment: "Absolutely love these shoes! The comfort is incredible and they look even better in person. Best purchase I've made this year.", product: "Air Max Velocity", color: "bg-blue-500" },
  { name: "Sarah Chen", avatar: "SC", rating: 5, comment: "The quality is outstanding. I've worn them daily for 3 months and they still look brand new. Highly recommend SoleVault!", product: "Cloud Walker", color: "bg-pink-500" },
  { name: "Michael Torres", avatar: "MT", rating: 5, comment: "Great shoes overall! Very comfortable for long walks. Excellent cushioning and support. Will buy more colors soon.", product: "Marathon Elite", color: "bg-green-500" },
  { name: "Emily Parker", avatar: "EP", rating: 5, comment: "I'm obsessed with these! Got so many compliments. The WhatsApp ordering was super easy too. Will definitely buy again.", product: "Neon Pulse", color: "bg-purple-500" },
  { name: "David Kim", avatar: "DK", rating: 5, comment: "Premium quality at a reasonable price. The cushioning is next level. My feet have never felt this good!", product: "Velocity Pro X", color: "bg-amber-500" },
  { name: "Lisa Anderson", avatar: "LA", rating: 5, comment: "Beautiful design and very comfortable. Shipping was fast and packaging was excellent. Love supporting this brand.", product: "Oxford Gentleman", color: "bg-teal-500" },
  { name: "Robert Martinez", avatar: "RM", rating: 5, comment: "These running shoes changed my game. PR after PR since I got them. The energy return is phenomenal!", product: "SpeedStrike", color: "bg-red-500" },
  { name: "Amanda Blake", avatar: "AB", rating: 5, comment: "Ordered 3 pairs already! The leather quality on the formal shoes is exceptional. Look and feel like shoes twice the price.", product: "Classic Leather Elite", color: "bg-indigo-500" },
];

export default function ReviewsSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            4.7 Average Rating
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">Customer Reviews</h2>
          <p className="text-gray-500 max-w-md mx-auto">What our customers say about their SoleVault experience</p>
        </div>
      </div>
      
      {/* Marquee row 1 */}
      <div className="relative mb-4">
        <div className="flex gap-4 animate-marquee">
          {[...testimonials, ...testimonials].map((review, i) => (
            <ReviewCard key={`r1-${i}`} review={review} />
          ))}
        </div>
      </div>
      
      {/* Marquee row 2 - reverse */}
      <div className="relative">
        <div className="flex gap-4 animate-marquee" style={{ animationDirection: "reverse", animationDuration: "35s" }}>
          {[...testimonials.slice(4), ...testimonials.slice(0, 4), ...testimonials.slice(4), ...testimonials.slice(0, 4)].map((review, i) => (
            <ReviewCard key={`r2-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[340px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 ${review.color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{review.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{review.name}</p>
          <p className="text-xs text-gray-400">Bought: {review.product}</p>
        </div>
        <Quote className="w-5 h-5 text-gray-200 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-0.5 mb-3">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        Verified Purchase
      </div>
    </div>
  );
}
