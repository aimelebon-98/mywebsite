"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ChevronDown, HelpCircle, MessageCircle, Package, Truck, RefreshCw, CreditCard, Ruler, Shield, Sparkles, ThumbsUp, ThumbsDown, TrendingUp, X, Zap, Clock, CheckCircle2 } from "lucide-react";
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

// Popular questions indices (most viewed)
const POPULAR_INDICES = [0, 3, 4, 6, 11];

export default function FAQPage() {
  const t = useTranslations("faq");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isFr = locale === "fr";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("orders");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, "up" | "down" | null>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const CATEGORIES = [
    { id: "orders",   label: t("catOrders"),   icon: Package,    color: "from-blue-500 to-blue-600" },
    { id: "shipping", label: t("catShipping"), icon: Truck,      color: "from-purple-500 to-purple-600" },
    { id: "returns",  label: t("catReturns"),  icon: RefreshCw,  color: "from-amber-500 to-orange-600" },
    { id: "payment",  label: t("catPayment"),  icon: CreditCard, color: "from-emerald-500 to-emerald-600" },
    { id: "sizing",   label: t("catSizing"),   icon: Ruler,      color: "from-pink-500 to-rose-600" },
    { id: "account",  label: t("catSupport"),  icon: Shield,     color: "from-indigo-500 to-indigo-600" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.map((f, i) => ({ ...f, originalIndex: i })).filter(f => {
      const question = isFr ? f.qFr : f.q;
      const answer   = isFr ? f.aFr : f.a;
      const matchesCategory = f.category === category;
      const matchesQuery = !q || question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category, isFr]);

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#CA3F2E]/20 text-[#CA3F2E] px-1 rounded">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const handleVote = (index: number, vote: "up" | "down") => {
    setVotes(prev => ({ ...prev, [index]: prev[index] === vote ? null : vote }));
  };

  const getCategoryData = (catId: string) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* HERO with animated gradient bg */}
        <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-[#8B2A1E] overflow-hidden">
          {/* Animated blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#CA3F2E]/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-40 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          </div>

          {/* Floating question marks */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
            {mounted && [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-white text-6xl font-bold animate-bounce"
                style={{
                  top: `${(i * 13) % 90}%`,
                  left: `${(i * 17) % 90}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + (i % 3)}s`,
                }}
              >
                ?
              </div>
            ))}
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#CA3F2E]" />
              <span>{isFr ? "Centre d'aide" : "Help Center"}</span>
            </div>

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-3xl mb-6 shadow-2xl shadow-[#CA3F2E]/50 hover:scale-105 transition-transform duration-500">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
              {t("title")}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Glassmorphism Search */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#CA3F2E] via-purple-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpenIndex(null); }}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-14 pr-14 py-5 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl text-sm text-gray-900 shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition placeholder:text-gray-400"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm"><span className="font-bold">{FAQS.length}+</span> {isFr ? "Questions" : "Questions"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm"><span className="font-bold">24/7</span> {isFr ? "Support" : "Support"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm"><span className="font-bold">&lt;5min</span> {isFr ? "Réponse" : "Reply"}</span>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" className="w-full h-16" preserveAspectRatio="none">
              <path fill="#ffffff" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" />
            </svg>
          </div>
        </section>

        {/* CATEGORY TABS */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14">
          <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <div className="flex items-center min-w-max">
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setOpenIndex(null); }}
                    className={`relative px-5 sm:px-6 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span className="relative inline-block">
                      {c.label}
                      {active && (
                        <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gray-900" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* POPULAR (only when no filter/search) */}
        {!query && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-12 pb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900">
                {isFr ? "Questions populaires" : "Popular Questions"}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {POPULAR_INDICES.map((idx) => {
                const faq = FAQS[idx];
                const question = isFr ? faq.qFr : faq.q;
                const catData = getCategoryData(faq.category);
                const CatIcon = catData.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCategory(faq.category);
                      setOpenIndex(idx);
                      setTimeout(() => {
                        document.getElementById(`faq-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 100);
                    }}
                    className="group text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-[#CA3F2E] hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${catData.color} flex items-center justify-center`}>
                        <CatIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#CA3F2E] transition line-clamp-2">
                          {question}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ LIST */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Result counter */}
          {(query || filtered.length !== FAQS.filter(f => f.category === category).length) && filtered.length > 0 && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{filtered.length}</span> {isFr ? "résultat(s)" : "result(s)"}
              </p>
              <button
                onClick={() => { setQuery(""); setCategory("orders"); setOpenIndex(null); }}
                className="text-xs font-semibold text-[#CA3F2E] hover:text-[#8B2A1E] transition"
              >
                {tc("clearFilters")}
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noResults")}</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                {t("noResultsDesc")}
              </p>
              <button
                onClick={() => { setQuery(""); setCategory("orders"); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
                {tc("clearFilters")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq) => {
                const index = faq.originalIndex;
                const isOpen = openIndex === index;
                const question = isFr ? faq.qFr : faq.q;
                const answer   = isFr ? faq.aFr : faq.a;
                const catData = getCategoryData(faq.category);
                const CatIcon = catData.icon;
                const userVote = votes[index];

                return (
                  <div
                    id={`faq-${index}`}
                    key={`${faq.category}-${index}`}
                    className={`group relative bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-[#CA3F2E] shadow-2xl shadow-[#CA3F2E]/10 scale-[1.01]"
                        : "border-gray-100 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {/* Gradient accent bar */}
                    {isOpen && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${catData.color}`} />
                    )}

                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full flex items-center gap-4 px-5 py-5 text-left"
                    >
                      {/* Category icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${catData.color} flex items-center justify-center transition-transform ${isOpen ? "scale-110 rotate-6" : "group-hover:scale-105"}`}>
                        <CatIcon className="w-5 h-5 text-white" />
                      </div>

                      <span className={`flex-1 font-bold text-sm sm:text-base transition ${isOpen ? "text-[#CA3F2E]" : "text-gray-900"}`}>
                        {highlightMatch(question)}
                      </span>

                      {/* Animated chevron */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isOpen ? "bg-[#CA3F2E] rotate-180" : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                        <ChevronDown className={`w-4 h-4 transition ${isOpen ? "text-white" : "text-gray-600"}`} />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-500 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pl-19">
                          <div className="pl-14">
                            <p className="text-sm text-gray-600 leading-relaxed mb-5">
                              {highlightMatch(answer)}
                            </p>

                            {/* Divider */}
                            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs text-gray-500 font-medium">
                                {isFr ? "Cela vous a-t-il été utile?" : "Was this helpful?"}
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleVote(index, "up")}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                                    userVote === "up"
                                      ? "bg-emerald-500 text-white"
                                      : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  {isFr ? "Oui" : "Yes"}
                                </button>
                                <button
                                  onClick={() => handleVote(index, "down")}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                                    userVote === "down"
                                      ? "bg-red-500 text-white"
                                      : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                  }`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  {isFr ? "Non" : "No"}
                                </button>
                              </div>
                            </div>

                            {userVote === "down" && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 flex items-start gap-2">
                                <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{isFr ? "Désolé! Contactez-nous sur WhatsApp pour une aide personnalisée." : "Sorry! Contact us on WhatsApp for personalized help."}</span>
                              </div>
                            )}
                            {userVote === "up" && (
                              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>{isFr ? "Merci pour votre retour!" : "Thanks for your feedback!"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA - Still need help */}
          <div className="mt-16 relative overflow-hidden rounded-3xl">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-[#8B2A1E]" />
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#CA3F2E]/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            <div className="relative p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-5 shadow-2xl shadow-green-500/30 hover:scale-105 transition-transform duration-500">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
                {t("stillQuestions")}
              </h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm sm:text-base">
                {t("stillQuestionsDesc")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/${locale}/contact`}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition shadow-xl hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition" />
                  {isFr ? "Nous contacter" : "Contact Us"}
                </Link>
                <Link
                  href={`/${locale}/shop`}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition shadow-xl hover:-translate-y-0.5"
                >
                  {t("browseShop")}
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}