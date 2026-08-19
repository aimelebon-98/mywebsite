export const CONCIERGE_TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: 1,
    features: [
      "Product listing with your images",
      "Basic English description",
      "Live within 24 hours",
    ],
  },
  {
    id: "translations",
    name: "With Translations",
    price: 2,
    features: [
      "Everything in Basic",
      "Full French translation",
      "Bilingual descriptions & tags",
    ],
  },
  {
    id: "premium",
    name: "Premium SEO",
    price: 5,
    features: [
      "Everything in Translations",
      "Professional written descriptions",
      "SEO metadata + focus keyphrase",
      "Optimized for Google search",
    ],
  },
] as const;

export type ConciergeTier = typeof CONCIERGE_TIERS[number];

export function getTierById(id: string): ConciergeTier | undefined {
  return CONCIERGE_TIERS.find(t => t.id === id);
}

export function getTierFee(id: string): number {
  return getTierById(id)?.price ?? 0;
}