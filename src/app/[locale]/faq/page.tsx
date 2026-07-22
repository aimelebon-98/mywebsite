"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ChevronDown, HelpCircle, MessageCircle, Package, Truck, RefreshCw, CreditCard, Ruler, Shield } from "lucide-react";
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
  const [category, setCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const CATEGORIES = [
    { id: "all",      label: t("catAll"),      icon: HelpCircle },
    { id: "orders",   label: t("catOrders"),   icon: Package    },
    { id: "shipping", label: t("catShipping"), icon: Truck      },
    { id: "returns",  label: t("catReturns"),  icon: RefreshCw  },
    { id: "payment",  label: t("catPayment"),  icon: CreditCard },
    { id: "sizing",   label: t("catSizing"),   icon: Ruler      },
    { id: "account",  label: t("catSupport"),  icon: Shield     },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter(f => {
      const question = isFr ? f.qFr : f.q;
      const answer   = isFr ? f.aFr : f.a;
      const matchesCategory = category === "all" || f.category === category;
      const matchesQuery = !q || question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category, isFr]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
              {t("title")}
            </h1>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenIndex(null); }}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); setOpenIndex(null); }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* FAQ list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t("noResults")}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {t("noResultsDesc")}
              </p>
              <button
                onClick={() => { setQuery(""); setCategory("all"); }}
                className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition"
              >
                {tc("clearFilters")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, index) => {
                const isOpen = openIndex === index;
                const question = isFr ? faq.qFr : faq.q;
                const answer   = isFr ? faq.aFr : faq.a;
                return (
                  <div
                    key={`${faq.category}-${index}`}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isOpen ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">
                        {question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-gray-900" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Still need help */}
          <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t("stillQuestions")}
            </h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              {t("stillQuestionsDesc")}
            </p>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition"
            >
              {t("browseShop")}
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
