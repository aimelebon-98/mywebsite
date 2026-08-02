"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, X, Check } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ============================================
          OPENING STATEMENT
          ============================================ */}
      <section className="min-h-[80vh] flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24 relative overflow-hidden">
        {/* Subtle red glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#CA3F2E]/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="inline-block mb-8">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#CA3F2E]">
              {t("badge")}
            </div>
            <div className="mt-2 w-12 h-0.5 bg-[#CA3F2E]" />
          </div>

          <h1 className="text-[10vw] sm:text-6xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-[-0.03em] text-gray-900 max-w-5xl">
            {t("manifestoIntro")}
          </h1>

          <p className="mt-6 text-2xl lg:text-4xl font-light text-gray-500 tracking-tight max-w-3xl">
            {t("manifestoSub")}
          </p>
        </div>
      </section>

      {/* ============================================
          WE BELIEVE - 3 core beliefs
          ============================================ */}
      <section className="py-24 lg:py-32 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 lg:mb-20">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#CA3F2E] mb-2">
              {t("believeLabel")}
            </div>
            <div className="w-12 h-0.5 bg-[#CA3F2E]" />
          </div>

          <div className="space-y-20 lg:space-y-28">
            {[
              { title: t("believe1Title"), body: t("believe1Body"), n: "01" },
              { title: t("believe2Title"), body: t("believe2Body"), n: "02" },
              { title: t("believe3Title"), body: t("believe3Body"), n: "03" },
            ].map((b) => (
              <div key={b.n} className="grid md:grid-cols-[80px_1fr] gap-6 lg:gap-12 items-start">
                <div className="text-4xl lg:text-6xl font-black text-gray-100 leading-none">
                  {b.n}
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight mb-5 max-w-4xl">
                    {b.title}
                  </h2>
                  <p className="text-lg lg:text-xl text-gray-500 leading-relaxed max-w-3xl">
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          WE REFUSE - contrast/edge in dark
          ============================================ */}
      <section className="py-24 lg:py-32 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#CA3F2E]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#CA3F2E] mb-2">
              {t("refuseLabel")}
            </div>
            <div className="w-12 h-0.5 bg-[#CA3F2E]" />
          </div>

          <div className="space-y-8 lg:space-y-12">
            {[t("refuse1"), t("refuse2"), t("refuse3")].map((line, i) => (
              <div key={i} className="flex items-start gap-5 lg:gap-8 border-b border-white/10 pb-8 lg:pb-12 last:border-0">
                <X className="w-6 h-6 lg:w-8 lg:h-8 text-[#CA3F2E] flex-shrink-0 mt-2" strokeWidth={3} />
                <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] text-white line-through decoration-[#CA3F2E] decoration-4">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          WE PROMISE - back to light
          ============================================ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 lg:mb-20">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#CA3F2E] mb-2">
              {t("promiseLabel")}
            </div>
            <div className="w-12 h-0.5 bg-[#CA3F2E]" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: t("promise1Title"), body: t("promise1Body") },
              { title: t("promise2Title"), body: t("promise2Body") },
              { title: t("promise3Title"), body: t("promise3Body") },
            ].map((p, i) => (
              <div key={i} className="relative pt-8 border-t-2 border-gray-900">
                <div className="absolute -top-1.5 left-0 w-8 h-2.5 bg-[#CA3F2E]" />
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-[#CA3F2E]" strokeWidth={3} />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">0{i + 1}</span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black tracking-tight text-gray-900 mb-3 leading-tight">
                  {p.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SIGNATURE - closing thought
          ============================================ */}
      <section className="py-24 lg:py-32 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
            {t("signature")}
          </h2>
          <p className="text-xl lg:text-2xl text-gray-500 font-light tracking-tight mb-10">
            {t("signatureSub")}
          </p>

          {/* Brand mark - minimal */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="w-8 h-0.5 bg-gray-300" />
            <div className="flex items-baseline gap-1.5 font-black tracking-tight text-lg">
              <span className="text-gray-900">NewDeal</span>
              <span className="text-gray-300 font-light">|</span>
              <span className="text-[#CA3F2E] tracking-widest text-base">ZONE</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300" />
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-none font-black text-sm tracking-wide uppercase transition"
          >
            {t("ctaShop")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
