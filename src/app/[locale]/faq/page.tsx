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
  category: string;
};

const FAQS: FAQ[] = [
  {
    category: "orders",
    q: "How do I place an order on SoleVault?",
    a: "Browse our shop, select your size and color, then click BUY NOW or add the item to your cart. When you're ready, go to your cart, fill in your name, phone number, and delivery address, then click 'Checkout via WhatsApp'. You'll be redirected to WhatsApp where our team will confirm your order and payment details.",
  },
  {
    category: "orders",
    q: "Can I modify or cancel my order after placing it?",
    a: "Yes! Since orders are confirmed via WhatsApp, simply reply to your order chat within 2 hours to modify or cancel. Once your order is packed for shipping, changes may no longer be possible.",
  },
  {
    category: "orders",
    q: "How will I know my order was received?",
    a: "You'll receive an instant confirmation on WhatsApp from our team after placing your order. If you don't hear back within a few hours during business hours, please message us again to confirm.",
  },
  {
    category: "shipping",
    q: "How much does shipping cost?",
    a: "Shipping is FREE on all orders over $100. For orders below $100, standard shipping rates apply and will be confirmed via WhatsApp before payment.",
  },
  {
    category: "shipping",
    q: "How long does delivery take?",
    a: "Standard delivery typically takes 3-7 business days depending on your location. Express shipping options are available on request. You'll receive updates via WhatsApp throughout the process.",
  },
  {
    category: "shipping",
    q: "Do you ship internationally?",
    a: "Yes, we ship to most countries worldwide. International shipping fees and delivery times vary by destination. Contact us via WhatsApp for a quote before placing your order.",
  },
  {
    category: "returns",
    q: "What is your return policy?",
    a: "We offer a 14-day return policy on unworn items in their original packaging. Items must have all tags attached and show no signs of wear. Sale items and customized products are final sale.",
  },
  {
    category: "returns",
    q: "How do I return or exchange an item?",
    a: "Simply message us on WhatsApp with your order details and reason for return. We'll guide you through the process and provide a return address. Once we receive and inspect the item, your refund or exchange will be processed within 3-5 business days.",
  },
  {
    category: "returns",
    q: "Who pays for return shipping?",
    a: "If the return is due to a defect or our error, we cover the shipping. For change-of-mind returns, the customer is responsible for return shipping costs.",
  },
  {
    category: "payment",
    q: "What payment methods do you accept?",
    a: "Payment is arranged via WhatsApp after order confirmation. We accept bank transfers, mobile money, credit/debit cards, and cash on delivery (in select areas). Our team will share the available options for your location.",
  },
  {
    category: "payment",
    q: "Is it safe to pay online?",
    a: "Absolutely. We use trusted payment channels and never store your card details. All transactions are secure and encrypted. If you're ever unsure, contact us directly via WhatsApp before making any payment.",
  },
  {
    category: "sizing",
    q: "How do I find my correct shoe size?",
    a: "Each product page shows available sizes. We recommend measuring your foot in centimeters and comparing it to our size chart. If you're between sizes, we generally suggest sizing up for comfort. Still unsure? Message us on WhatsApp and we'll help.",
  },
  {
    category: "sizing",
    q: "What if the size does not fit?",
    a: "No worries! You can exchange for a different size within 14 days as long as the shoes are unworn and in original condition. Just message us on WhatsApp to arrange the exchange.",
  },
  {
    category: "sizing",
    q: "Are the sizes true to size?",
    a: "Most of our shoes fit true to size, but some brands run slightly small or large. Check the product description for specific fit notes, or reach out to us on WhatsApp for personalized sizing advice.",
  },
  {
    category: "account",
    q: "How can I contact customer support?",
    a: "The fastest way to reach us is through the WhatsApp button at the bottom-right of every page. Our team responds during business hours and typically replies within a few minutes.",
  },
  {
    category: "account",
    q: "Are my personal details safe?",
    a: "Yes. We only collect the information needed to fulfill your order (name, phone, delivery address) and never share it with third parties. Your data is stored securely.",
  },
  {
    category: "account",
    q: "Do you have a physical store I can visit?",
    a: "We currently operate primarily online to offer you the best prices. Contact us via WhatsApp to inquire about pickup locations or showroom appointments in your area.",
  },
];

export default function FAQPage() {
  const t = useTranslations("faq");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const CATEGORIES = [
    { id: "all", label: t("catAll"), icon: HelpCircle },
    { id: "orders", label: t("catOrders"), icon: Package },
    { id: "shipping", label: t("catShipping"), icon: Truck },
    { id: "returns", label: t("catReturns"), icon: RefreshCw },
    { id: "payment", label: t("catPayment"), icon: CreditCard },
    { id: "sizing", label: t("catSizing"), icon: Ruler },
    { id: "account", label: t("catSupport"), icon: Shield },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter(f => {
      const matchesCategory = category === "all" || f.category === category;
      const matchesQuery = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

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
                        {faq.q}
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
                          {faq.a}
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
