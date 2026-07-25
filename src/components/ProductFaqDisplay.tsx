"use client";

import { useEffect, useState } from "react";
import type { ProductFaq } from "@/db/schema";
import { ChevronDown, HelpCircle, Plus } from "lucide-react";
import { useLocale } from "next-intl";

const INITIAL_VISIBLE = 4;

export default function ProductFaqDisplay() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    fetch("/api/product-faqs")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
          setOpenId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

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
            {isFr ? `${faqs.length} questions frequentes` : `${faqs.length} common questions`}
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
