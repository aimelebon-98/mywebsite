"use client";

import { useEffect, useState } from "react";
import type { ProductFaq } from "@/db/schema";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLocale } from "next-intl";

export default function ProductFaqDisplay() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

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

  // JSON-LD FAQPage schema (uses English for schema, Google indexes both)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": getQ(f),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": getA(f)
      }
    }))
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#CA3F2E]/10 rounded-2xl mb-3">
          <HelpCircle className="w-6 h-6 text-[#CA3F2E]" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-[#CA3F2E] mb-2">
          FAQ
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
          {isFr ? "Questions frequentes" : "Frequently Asked Questions"}
        </h2>
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        {faqs.map((f) => {
          const isOpen = openId === f.id;
          return (
            <div
              key={f.id}
              className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${isOpen ? "border-[#CA3F2E] shadow-md" : "border-gray-200 hover:border-gray-300"}`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : f.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className={`font-bold text-sm sm:text-base transition ${isOpen ? "text-[#CA3F2E]" : "text-gray-900"}`}>
                  {getQ(f)}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-[#CA3F2E] rotate-180" : "bg-gray-100"}`}>
                  <ChevronDown className={`w-4 h-4 transition ${isOpen ? "text-white" : "text-gray-600"}`} />
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                    {getA(f)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
