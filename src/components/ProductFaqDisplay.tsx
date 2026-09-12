"use client";

import { useEffect, useState } from "react";
import type { ProductFaq } from "@/db/schema";
import { ChevronDown, HelpCircle, Plus } from "lucide-react";
import { useLocale } from "next-intl";

const INITIAL_VISIBLE = 4;

interface Props {
  isSubscription?: boolean;
}

const FOOTWEAR_FAQS = [
  {
    id: "fw-1",
    question: "Are all products 100% authentic?",
    questionFr: "Tous les produits sont-ils 100% authentiques ?",
    answer: "Yes, 100% guaranteed. Every item undergoes a rigorous multi-point inspection before dispatch to ensure absolute authenticity and premium quality.",
    answerFr: "Oui, garanti \u00e0 100%. Chaque article fait l'objet d'une inspection rigoureuse avant l'envoi pour garantir une authenticit\u00e9 absolue et une qualit\u00e9 premium.",
  },
  {
    id: "fw-2",
    question: "How does sizing work?",
    questionFr: "Comment choisir ma pointure ?",
    answer: "All sizes are listed in standard EU sizing. If a model runs small or large, a sizing recommendation is explicitly stated in the product specifications.",
    answerFr: "Toutes les pointures sont au format standard EU. Si un mod\u00e8le taille petit ou grand, cela est explicitement pr\u00e9cis\u00e9 dans les sp\u00e9cifications.",
  },
  {
    id: "fw-3",
    question: "What are the delivery times?",
    questionFr: "Quels sont les d\u00e9lais de livraison ?",
    answer: "Same-day express delivery is available in Abuja and Lom\u00e9. Regional shipments across West Africa typically arrive within 2-4 business days.",
    answerFr: "La livraison express le jour m\u00eame est disponible \u00e0 Abuja et Lom\u00e9. Les exp\u00e9ditions r\u00e9gionales prennent 2 \u00e0 4 jours ouvrables.",
  },
  {
    id: "fw-4",
    question: "What is your return and exchange policy?",
    questionFr: "Quelle est votre politique de retour et d'echange ?",
    answer: "We offer a 7-day hassle-free exchange window for unworn items in their original packaging and condition.",
    answerFr: "Nous proposons un d\u00e9lai d'echange de 7 jours sans tracas pour les articles non port\u00e9s dans leur emballage d'origine.",
  },
];

export default function ProductFaqDisplay({ isSubscription = false }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    if (isSubscription) {
      fetch("/api/product-faqs")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setFaqs(data);
            setOpenId(data[0].id);
          }
        })
        .catch(() => {});
    } else {
      const formatted: ProductFaq[] = FOOTWEAR_FAQS.map((f, idx) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        questionFr: f.questionFr,
        answerFr: f.answerFr,
        sortOrder: idx + 1,
        active: true,
        createdAt: new Date(),
      }));
      setFaqs(formatted);
      setOpenId(formatted[0].id);
    }
  }, [isSubscription]);

  if (faqs.length === 0) return null;

  const getQ = (f: ProductFaq) => (isFr && f.questionFr) ? f.questionFr : f.question;
  const getA = (f: ProductFaq) => (isFr && f.answerFr) ? f.answerFr : f.answer;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": getQ(f),
      "acceptedAnswer": { "@type": "Answer", "text": getA(f) }
    }))
  };

  const visibleFaqs = faqs.slice(0, visible);
  const hasMore = visible < faqs.length;

  return (
    <div className="lg:sticky lg:top-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 lg:mb-10">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-[#CA3F2E]/10 rounded-xl">
              <HelpCircle className="w-5 h-5 text-[#CA3F2E]" />
            </span>
            FAQ
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {isFr ? `${faqs.length} questions fr\u00e9quentes` : `${faqs.length} common questions`}
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-2.5">
        {visibleFaqs.map((f) => {
          const isOpen = openId === f.id;
          return (
            <div
              key={f.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${isOpen ? "border-[#CA3F2E] shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : f.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className={`font-bold text-sm transition ${isOpen ? "text-[#CA3F2E]" : "text-gray-900"}`}>
                  {getQ(f)}
                </span>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-[#CA3F2E] rotate-180" : "bg-gray-100"}`}>
                  <ChevronDown className={`w-3.5 h-3.5 transition ${isOpen ? "text-white" : "text-gray-600"}`} />
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                    {getA(f)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={() => setVisible(faqs.length)}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-900 hover:text-white transition"
        >
          <Plus className="w-4 h-4" />
          {isFr ? `Voir ${faqs.length - visible} de plus` : `Show ${faqs.length - visible} more`}
        </button>
      )}

      {!hasMore && faqs.length > INITIAL_VISIBLE && (
        <button
          onClick={() => { setVisible(INITIAL_VISIBLE); setOpenId(faqs[0].id); }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          {isFr ? "Voir moins" : "Show less"}
        </button>
      )}
    </div>
  );
}