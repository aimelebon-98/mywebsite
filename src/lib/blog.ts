export const BLOG_CATEGORIES = [
  { slug: "style-tips",      name: "Style Tips",       nameFr: "Conseils de style",      color: "bg-purple-100 text-purple-700" },
  { slug: "product-reviews", name: "Product Reviews",  nameFr: "Tests produits",         color: "bg-blue-100 text-blue-700" },
  { slug: "sneaker-news",    name: "Sneaker News",     nameFr: "Actualites sneaker",     color: "bg-red-100 text-red-700" },
  { slug: "care-guides",     name: "Care Guides",      nameFr: "Guides d'entretien",     color: "bg-emerald-100 text-emerald-700" },
  { slug: "buying-guides",   name: "Buying Guides",    nameFr: "Guides d'achat",         color: "bg-amber-100 text-amber-700" },
  { slug: "brand-stories",   name: "Brand Stories",    nameFr: "Histoires de marques",   color: "bg-pink-100 text-pink-700" },
];

export function getCategoryLabel(slug: string, isFr: boolean): string {
  const cat = BLOG_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return slug;
  return isFr ? cat.nameFr : cat.name;
}

export function getCategoryColor(slug: string): string {
  return BLOG_CATEGORIES.find(c => c.slug === slug)?.color || "bg-gray-100 text-gray-700";
}

export function formatDate(date: Date | string | null, locale: string = "en"): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
