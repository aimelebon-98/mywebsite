"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, X, Check, MessageCircle } from "lucide-react";

const FOUNDER_AVATAR = "https://i.ibb.co/HTrQYdfK/Aime-komlan.jpg";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ============================================
          HERO - clean like contact page
          ============================================ */}
      <section className="bg-gray-900 text-white pt-32 lg:pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            {t("badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("manifestoIntro")}
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            {t("manifestoSub")}
          </p>
        </div>
      </section>

      {/* ============================================
          WE BELIEVE - clean 3 cards
          ============================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E]">
            {t("believeLabel")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            Our core beliefs
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {[
            { title: t("believe1Title"), body: t("believe1Body"), n: "01" },
            { title: t("believe2Title"), body: t("believe2Body"), n: "02" },
            { title: t("believe3Title"), body: t("believe3Body"), n: "03" },
          ].map((b) => (
            <div key={b.n} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-300 hover:shadow-md transition">
              <div className="text-xs font-bold text-[#CA3F2E] tracking-widest mb-3">{b.n}</div>
              <h3 className="font-bold text-gray-900 mb-2 leading-snug">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          WE REFUSE + WE PROMISE - side by side
          ============================================ */}
      <section className="bg-gray-50 py-16 lg:py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6 lg:gap-8">

          {/* We refuse */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-5 pb-5 border-b border-white/10">
              <X className="w-4 h-4 text-[#CA3F2E]" strokeWidth={3} />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E]">
                {t("refuseLabel")}
              </span>
            </div>
            <ul className="space-y-4">
              {[t("refuse1"), t("refuse2"), t("refuse3")].map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-3.5 h-3.5 text-gray-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-300 line-through decoration-[#CA3F2E]/60">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* We promise */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
              <Check className="w-4 h-4 text-[#CA3F2E]" strokeWidth={3} />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E]">
                {t("promiseLabel")}
              </span>
            </div>
            <ul className="space-y-5">
              {[
                { title: t("promise1Title"), body: t("promise1Body") },
                { title: t("promise2Title"), body: t("promise2Body") },
                { title: t("promise3Title"), body: t("promise3Body") },
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-3.5 h-3.5 text-[#CA3F2E] mt-1 flex-shrink-0" strokeWidth={3} />
                  <div>
                    <div className="font-bold text-sm text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================
          FOUNDER CARD - personal note with photo
          ============================================ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E]">
              {t("founderLabel")}
            </span>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 lg:p-10 border border-gray-100 shadow-sm">
            <div className="grid md:grid-cols-[180px_1fr] gap-6 lg:gap-8 items-start">
              {/* Photo */}
              <div className="flex justify-center md:justify-start">
                <div className="relative">
                  <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
                    <img
                      src={FOUNDER_AVATAR}
                      alt={t("founderName")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#CA3F2E] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-md">
                    Founder
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-5 italic">
                  &ldquo;{t("founderNote")}&rdquo;
                </p>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-bold text-gray-900">{t("founderName")}</div>
                    <div className="text-xs text-gray-500">{t("founderRole")}</div>
                  </div>
                  <div className="text-xs text-gray-400 italic">{t("founderSignature")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SIGNATURE + CTA - clean close
          ============================================ */}
      <section className="py-16 lg:py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            {t("signature")}
          </h2>
          <p className="text-gray-500 mb-8">
            {t("signatureSub")}
          </p>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-0.5 bg-gray-300" />
            <div className="flex items-baseline gap-1.5 font-black tracking-tight text-base">
              <span className="text-gray-900">NewDeal</span>
              <span className="text-gray-300 font-light">|</span>
              <span className="text-[#CA3F2E] tracking-widest text-sm">ZONE</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl font-bold text-sm transition"
            >
              {t("ctaShop")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-xl font-bold text-sm hover:border-gray-900 transition"
            >
              <MessageCircle className="w-4 h-4" />
              {t("ctaContact")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
