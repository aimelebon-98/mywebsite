"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, HelpCircle, MessageCircle, Package, Truck, RefreshCw, CreditCard, Ruler, Shield, ArrowRight, X, ChevronRight, BookOpen, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

type FAQ = {
  q: string;
  a: string;
  qFr: string;
  aFr: string;
  category: string;
};

const FAQS: FAQ[] = [
  {
    category: "orders",
    q: "How do I place an order on SoleVault?",
    a: "Browse our shop, select your size and color, then click BUY NOW or add the item to your cart. When you are ready, go to your cart, fill in your name, phone number, and delivery address, then click Checkout via WhatsApp. You will be redirected to WhatsApp where our team will confirm your order and payment details.",
    qFr: "Comment passer une commande sur SoleVault?",
    aFr: "Parcourez notre boutique, sélectionnez votre taille et couleur, puis cliquez sur ACHETER ou ajoutez l'article au panier. Quand vous êtes prêt, allez au panier, remplissez votre nom, numéro de téléphone et adresse de livraison, puis cliquez sur Commander via WhatsApp. Vous serez redirigé vers WhatsApp où notre équipe confirmera votre commande et les détails de paiement.",
  },
  {
    category: "orders",
    q: "Can I modify or cancel my order after placing it?",
    a: "Yes! Since orders are confirmed via WhatsApp, simply reply to your order chat within 2 hours to modify or cancel. Once your order is packed for shipping, changes may no longer be possible.",
    qFr: "Puis-je modifier ou annuler ma commande après l'avoir passée?",
    aFr: "Oui! Comme les commandes sont confirmées via WhatsApp, il suffit de répondre à votre discussion dans les 2 heures pour modifier ou annuler. Une fois votre commande emballée pour l'expédition, les changements peuvent ne plus être possibles.",
  },
  {
    category: "orders",
    q: "How will I know my order was received?",
    a: "You will receive an instant confirmation on WhatsApp from our team after placing your order. If you do not hear back within a few hours during business hours, please message us again to confirm.",
    qFr: "Comment saurai-je que ma commande a été reçue?",
    aFr: "Vous recevrez une confirmation instantanée sur WhatsApp de la part de notre équipe après avoir passé votre commande. Si vous n'avez pas de nouvelles dans les quelques heures pendant les heures d'ouverture, veuillez nous recontacter pour confirmer.",
  },
  {
    category: "shipping",
    q: "How much does shipping cost?",
    a: "Shipping is FREE on all orders over $100. For orders below $100, standard shipping rates apply and will be confirmed via WhatsApp before payment.",
    qFr: "Combien coûte la livraison?",
    aFr: "La livraison est GRATUITE sur toutes les commandes de plus de 100$. Pour les commandes en dessous de 100$, les tarifs standard s'appliquent et seront confirmés via WhatsApp avant le paiement.",
  },
  {
    category: "shipping",
    q: "How long does delivery take?",
    a: "Standard delivery typically takes 3-7 business days depending on your location. Express shipping options are available on request. You will receive updates via WhatsApp throughout the process.",
    qFr: "Combien de temps prend la livraison?",
    aFr: "La livraison standard prend généralement 3 à 7 jours ouvrables selon votre localisation. Des options de livraison express sont disponibles sur demande. Vous recevrez des mises à jour via WhatsApp tout au long du processus.",
  },
  {
    category: "shipping",
    q: "Do you ship internationally?",
    a: "Yes, we ship to most countries worldwide. International shipping fees and delivery times vary by destination. Contact us via WhatsApp for a quote before placing your order.",
    qFr: "Livrez-vous à l'international?",
    aFr: "Oui, nous expédions dans la plupart des pays du monde. Les frais et délais de livraison internationale varient selon la destination. Contactez-nous via WhatsApp pour un devis avant de passer votre commande.",
  },
  {
    category: "returns",
    q: "What is your return policy?",
    a: "We offer a 14-day return policy on unworn items in their original packaging. Items must have all tags attached and show no signs of wear. Sale items and customized products are final sale.",
    qFr: "Quelle est votre politique de retour?",
    aFr: "Nous offrons une politique de retour de 14 jours sur les articles non portés dans leur emballage d'origine. Les articles doivent avoir toutes les étiquettes attachées et ne montrer aucun signe d'usure. Les articles en solde et les produits personnalisés sont non-remboursables.",
  },
  {
    category: "returns",
    q: "How do I return or exchange an item?",
    a: "Simply message us on WhatsApp with your order details and reason for return. We will guide you through the process and provide a return address. Once we receive and inspect the item, your refund or exchange will be processed within 3-5 business days.",
    qFr: "Comment retourner ou échanger un article?",
    aFr: "Envoyez-nous simplement un message sur WhatsApp avec les détails de votre commande et le motif du retour. Nous vous guiderons dans le processus et vous fournirons une adresse de retour. Une fois l'article reçu et inspecté, votre remboursement ou échange sera traité sous 3 à 5 jours ouvrables.",
  },
  {
    category: "returns",
    q: "Who pays for return shipping?",
    a: "If the return is due to a defect or our error, we cover the shipping. For change-of-mind returns, the customer is responsible for return shipping costs.",
    qFr: "Qui paie les frais de retour?",
    aFr: "Si le retour est dû à un défaut ou à une erreur de notre part, nous prenons en charge les frais d'expédition. Pour les retours pour changement d'avis, le client est responsable des frais de retour.",
  },
  {
    category: "payment",
    q: "What payment methods do you accept?",
    a: "Payment is arranged via WhatsApp after order confirmation. We accept bank transfers, mobile money, credit/debit cards, and cash on delivery (in select areas). Our team will share the available options for your location.",
    qFr: "Quels moyens de paiement acceptez-vous?",
    aFr: "Le paiement est organisé via WhatsApp après confirmation de la commande. Nous acceptons les virements bancaires, mobile money, cartes de crédit/débit, et paiement à la livraison (dans certaines régions). Notre équipe partagera les options disponibles pour votre région.",
  },
  {
    category: "payment",
    q: "Is it safe to pay online?",
    a: "Absolutely. We use trusted payment channels and never store your card details. All transactions are secure and encrypted. If you are ever unsure, contact us directly via WhatsApp before making any payment.",
    qFr: "Est-il sûr de payer en ligne?",
    aFr: "Absolument. Nous utilisons des canaux de paiement de confiance et ne stockons jamais vos détails de carte. Toutes les transactions sont sécurisées et chiffrées. Si vous avez un doute, contactez-nous directement via WhatsApp avant de faire tout paiement.",
  },
  {
    category: "sizing",
    q: "How do I find my correct shoe size?",
    a: "Each product page shows available sizes. We recommend measuring your foot in centimeters and comparing it to our size chart. If you are between sizes, we generally suggest sizing up for comfort. Still unsure? Message us on WhatsApp and we will help.",
    qFr: "Comment trouver ma bonne pointure?",
    aFr: "Chaque page produit affiche les tailles disponibles. Nous recommandons de mesurer votre pied en centimètres et de comparer avec notre guide des tailles. Si vous êtes entre deux tailles, nous suggérons généralement de prendre la taille au-dessus pour le confort. Toujours indécis? Envoyez-nous un message sur WhatsApp et nous vous aiderons.",
  },
  {
    category: "sizing",
    q: "What if the size does not fit?",
    a: "No worries! You can exchange for a different size within 14 days as long as the shoes are unworn and in original condition. Just message us on WhatsApp to arrange the exchange.",
    qFr: "Que faire si la taille ne convient pas?",
    aFr: "Pas d'inquiétude! Vous pouvez échanger pour une autre taille dans les 14 jours tant que les chaussures ne sont pas portées et dans leur état d'origine. Envoyez-nous simplement un message sur WhatsApp pour organiser l'échange.",
  },
  {
    category: "sizing",
    q: "Are the sizes true to size?",
    a: "Most of our shoes fit true to size, but some brands run slightly small or large. Check the product description for specific fit notes, or reach out to us on WhatsApp for personalized sizing advice.",
    qFr: "Les tailles sont-elles fidèles?",
    aFr: "La plupart de nos chaussures taillent normalement, mais certaines marques taillent légèrement petit ou grand. Consultez la description du produit pour les notes spécifiques, ou contactez-nous sur WhatsApp pour des conseils de taille personnalisés.",
  },
  {
    category: "account",
    q: "How can I contact customer support?",
    a: "The fastest way to reach us is through the WhatsApp button at the bottom-right of every page. Our team responds during business hours and typically replies within a few minutes.",
    qFr: "Comment puis-je contacter le support client?",
    aFr: "Le moyen le plus rapide de nous joindre est le bouton WhatsApp en bas à droite de chaque page. Notre équipe répond pendant les heures d'ouverture et répond généralement en quelques minutes.",
  },
  {
    category: "account",
    q: "Are my personal details safe?",
    a: "Yes. We only collect the information needed to fulfill your order (name, phone, delivery address) and never share it with third parties. Your data is stored securely.",
    qFr: "Mes informations personnelles sont-elles sécurisées?",
    aFr: "Oui. Nous ne collectons que les informations nécessaires pour traiter votre commande (nom, téléphone, adresse de livraison) et ne les partageons jamais avec des tiers. Vos données sont stockées en toute sécurité.",
  },
  {
    category: "account",
    q: "Do you have a physical store I can visit?",
    a: "We currently operate primarily online to offer you the best prices. Contact us via WhatsApp to inquire about pickup locations or showroom appointments in your area.",
    qFr: "Avez-vous un magasin physique que je peux visiter?",
    aFr: "Nous opérons actuellement principalement en ligne pour vous offrir les meilleurs prix. Contactez-nous via WhatsApp pour connaître les points de retrait ou les rendez-vous en showroom dans votre région.",
  },
];

export default function FAQPage() {
  const t = useTranslations("faq");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isFr = locale === "fr";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("orders");
  const [activeSection, setActiveSection] = useState<string>("orders");

  const CATEGORIES = [
    { id: "orders",   label: t("catOrders"),   icon: Package,    desc: isFr ? "Passer et gérer" : "Placing & managing" },
    { id: "shipping", label: t("catShipping"), icon: Truck,      desc: isFr ? "Livraison et délais" : "Delivery & times" },
    { id: "returns",  label: t("catReturns"),  icon: RefreshCw,  desc: isFr ? "Retours et échanges" : "Refunds & exchanges" },
    { id: "payment",  label: t("catPayment"),  icon: CreditCard, desc: isFr ? "Modes de paiement" : "Payment methods" },
    { id: "sizing",   label: t("catSizing"),   icon: Ruler,      desc: isFr ? "Guide des tailles" : "Size guide" },
    { id: "account",  label: t("catSupport"),  icon: Shield,     desc: isFr ? "Compte et support" : "Account & help" },
  ];

  // If searching, show all matching results across all categories
  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.map((f, i) => ({ ...f, originalIndex: i })).filter(f => {
      const question = isFr ? f.qFr : f.q;
      const answer   = isFr ? f.aFr : f.a;
      if (isSearching) {
        return question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
      }
      return f.category === category;
    });
  }, [query, category, isFr, isSearching]);

  // Group filtered by category when searching
  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [filtered]);

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const getCategoryData = (catId: string) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
  const getCategoryCount = (catId: string) => FAQS.filter(f => f.category === catId).length;

  // Scroll spy for section highlighting when not searching
  useEffect(() => {
    if (isSearching) return;
    setActiveSection(category);
  }, [category, isSearching]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* Compact hero */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5">
                <Link href={`/${locale}`} className="hover:text-gray-900 transition">
                  {isFr ? "Accueil" : "Home"}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-semibold">FAQ</span>
              </nav>

              <div className="flex items-start gap-4 mb-4">
                <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-[#CA3F2E] rounded-xl items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-2">
                    {t("title")}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mt-6 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] focus:border-transparent focus:bg-white transition placeholder:text-gray-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 transition"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              {isSearching && (
                <p className="text-xs text-gray-500 mt-3">
                  {filtered.length} {filtered.length === 1 ? (isFr ? "résultat trouvé" : "result found") : (isFr ? "résultats trouvés" : "results found")} {isFr ? "pour" : "for"} <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
            {/* SIDEBAR */}
            <aside className="lg:sticky lg:top-28 lg:self-start mb-8 lg:mb-0">
              <div className="lg:block">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-3">
                  {isFr ? "Catégories" : "Categories"}
                </p>
                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const active = !isSearching && activeSection === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCategory(c.id);
                          setQuery("");
                        }}
                        className={`flex-shrink-0 lg:flex-shrink group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          active
                            ? "bg-[#CA3F2E] text-white shadow-sm"
                            : "text-gray-700 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition ${
                          active ? "bg-white/20" : "bg-gray-100 group-hover:bg-[#CA3F2E]/10"
                        }`}>
                          <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-600 group-hover:text-[#CA3F2E]"}`} />
                        </div>
                        <div className="flex-1 min-w-0 hidden lg:block">
                          <div className={`text-sm font-semibold ${active ? "text-white" : "text-gray-900"}`}>
                            {c.label}
                          </div>
                          <div className={`text-xs ${active ? "text-white/70" : "text-gray-500"}`}>
                            {getCategoryCount(c.id)} {isFr ? "articles" : "articles"}
                          </div>
                        </div>
                        <div className="lg:hidden text-sm font-semibold whitespace-nowrap">
                          {c.label}
                        </div>
                      </button>
                    );
                  })}
                </nav>

                {/* Contact card */}
                <div className="hidden lg:block mt-8 p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="w-9 h-9 bg-[#CA3F2E]/10 rounded-lg flex items-center justify-center mb-3">
                    <MessageCircle className="w-4 h-4 text-[#CA3F2E]" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    {isFr ? "Besoin d'aide?" : "Need help?"}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    {isFr ? "Notre équipe répond en moins de 5 minutes." : "Our team replies in under 5 minutes."}
                  </p>
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#CA3F2E] hover:text-[#8B2A1E] transition"
                  >
                    {isFr ? "Contactez-nous" : "Contact us"}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div id="faq-content">
              {filtered.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t("noResults")}</h3>
                  <p className="text-sm text-gray-500 mb-5">{t("noResultsDesc")}</p>
                  <button
                    onClick={() => { setQuery(""); setCategory("orders"); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {tc("clearFilters")}
                  </button>
                </div>
              ) : isSearching ? (
                // Search results: grouped by category
                <div className="space-y-8">
                  {Object.entries(groupedResults).map(([catId, items]) => {
                    const catData = getCategoryData(catId);
                    const CatIcon = catData.icon;
                    return (
                      <div key={catId}>
                        <div className="flex items-center gap-2 mb-4">
                          <CatIcon className="w-4 h-4 text-[#CA3F2E]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {catData.label}
                          </h3>
                          <span className="text-xs text-gray-400">({items.length})</span>
                        </div>
                        <div className="space-y-3">
                          {items.map((faq) => {
                            const question = isFr ? faq.qFr : faq.q;
                            const answer   = isFr ? faq.aFr : faq.a;
                            return (
                              <details
                                key={faq.originalIndex}
                                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition"
                              >
                                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {highlightMatch(question)}
                                  </span>
                                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center group-open:bg-[#CA3F2E] transition">
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-open:text-white group-open:rotate-90 transition" />
                                  </div>
                                </summary>
                                <div className="px-5 pb-5 pt-1">
                                  <div className="pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {highlightMatch(answer)}
                                    </p>
                                  </div>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Normal category view
                <div>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="w-11 h-11 bg-[#CA3F2E] rounded-xl flex items-center justify-center">
                      {(() => {
                        const CatIcon = getCategoryData(category).icon;
                        return <CatIcon className="w-5 h-5 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                        {getCategoryData(category).label}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {filtered.length} {isFr ? "questions" : "questions"} - {getCategoryData(category).desc}
                      </p>
                    </div>
                  </div>

                  {/* Questions list */}
                  <div className="space-y-3">
                    {filtered.map((faq, idx) => {
                      const question = isFr ? faq.qFr : faq.q;
                      const answer   = isFr ? faq.aFr : faq.a;
                      return (
                        <details
                          key={`${category}-${faq.originalIndex}`}
                          open={idx === 0}
                          className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                            <span className="font-semibold text-gray-900 text-sm sm:text-base group-open:text-[#CA3F2E] transition">
                              {question}
                            </span>
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center group-open:bg-[#CA3F2E] transition">
                              <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-open:text-white group-open:rotate-90 transition-all" />
                            </div>
                          </summary>
                          <div className="px-5 pb-5 pt-1">
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {answer}
                              </p>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom help section */}
              <div className="mt-12 grid sm:grid-cols-2 gap-4">
                <Link
                  href={`/${locale}/contact`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-[#CA3F2E] hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 bg-[#CA3F2E]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#CA3F2E] transition">
                    <Mail className="w-4 h-4 text-[#CA3F2E] group-hover:text-white transition" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {isFr ? "Nous écrire" : "Send a message"}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {isFr ? "Réponse en 24h ouvrables" : "Reply within 24 business hours"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#CA3F2E]">
                    {isFr ? "Contact" : "Contact"}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </span>
                </Link>

                <Link
                  href={`/${locale}/shop`}
                  className="group bg-gray-900 border border-gray-900 rounded-xl p-5 hover:bg-black transition-all"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    {isFr ? "Chat WhatsApp" : "WhatsApp chat"}
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    {isFr ? "Réponse en moins de 5 minutes" : "Reply in under 5 minutes"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-white">
                    {t("browseShop")}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}