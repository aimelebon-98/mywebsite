"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Check, MessageCircle } from "lucide-react";

const FOUNDER_AVATAR = "https://i.ibb.co/HTrQYdfK/Aime-komlan.jpg";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* ============================================
          ANIMATED BACKGROUND
          ============================================ */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#CA3F2E]/8 blur-3xl animate-blob-1" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-orange-200/20 blur-3xl animate-blob-2" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full bg-amber-100/25 blur-3xl animate-blob-3" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#8B2A1E]/6 blur-3xl animate-blob-1" style={{ animationDelay: "-8s" }} />
      </div>

      <Navbar />

      {/* ============================================
          HERO STATEMENT - big and bold
          ============================================ */}
      <section className="pt-28 lg:pt-36 pb-12 lg:pb-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-full mb-6 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#CA3F2E] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-700">
              {t("badge")}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] text-gray-900 mb-5">
            {t("manifestoIntro")}
          </h1>

          <p className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-500 tracking-tight max-w-3xl mx-auto">
            {t("manifestoSub")}
          </p>
        </div>
      </section>

      {/* ============================================
          THREE CHAPTERS - numbered timeline
          ============================================ */}
      <section className="py-10 lg:py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E] mb-3">
              {t("chaptersBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {t("chaptersTitle")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {[
              { year: t("ch1Year"), title: t("ch1Title"), desc: t("ch1Desc"), n: "01" },
              { year: t("ch2Year"), title: t("ch2Title"), desc: t("ch2Desc"), n: "02" },
              { year: t("ch3Year"), title: t("ch3Title"), desc: t("ch3Desc"), n: "03" },
            ].map((c, i) => (
              <div key={c.n} className="relative">
                <div className={"relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 border transition-all " +
                  (i === 1 ? "border-[#CA3F2E]/30 shadow-lg shadow-red-100/50" : "border-gray-100 hover:border-gray-300 hover:shadow-md")}>
                  <div className="absolute -top-4 left-8 px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black tracking-widest">
                    {c.n}
                  </div>

                  <div className={"text-5xl font-black mb-3 tracking-tight " + (i === 1 ? "text-[#CA3F2E]" : "text-gray-900")}>
                    {c.year}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{c.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FOUNDER CARD (LEFT) + WE PROMISE (RIGHT)
          Replaces the "We refuse" spot
          ============================================ */}
      <section className="py-10 lg:py-12 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">

          {/* Founder card - replaces We Refuse */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
            {/* Photo band */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 md:p-8">
              <div className="relative">
                <div className="w-52 h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
                  <img
                    src={FOUNDER_AVATAR}
                    alt={t("founderName")}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#CA3F2E] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
                  Founder
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-6 lg:p-8 flex-1 flex flex-col">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E] mb-3">
                {t("founderLabel")}
              </span>
              <p className="font-fancy text-lg md:text-xl lg:text-[22px] text-gray-800 leading-[1.45] mb-5 flex-1">
                &ldquo;{t("founderNoteBefore")}
                <span className="inline-flex items-baseline gap-1 font-black tracking-tight font-sans">
                  <span className="text-gray-900">NewDeal</span>
                  <span className="text-gray-300 font-light mx-0.5">|</span>
                  <span className="text-[#CA3F2E] tracking-widest text-[0.9em]">ZONE</span>
                </span>
                {t("founderNoteAfter")}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{t("founderName")}</div>
                  <div className="text-xs text-gray-500">{t("founderRole")}</div>
                </div>
                <div className="font-fancy text-sm text-gray-500">{t("founderSignature")}</div>
              </div>
            </div>
          </div>

          {/* We promise */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-[#CA3F2E]/20 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-[#CA3F2E] rounded-xl flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E]">
                {t("promiseLabel")}
              </span>
            </div>
            <ul className="space-y-7 lg:space-y-8 flex-1">
              {[
                { title: t("promise1Title"), body: t("promise1Body") },
                { title: t("promise2Title"), body: t("promise2Body") },
                { title: t("promise3Title"), body: t("promise3Body") },
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#CA3F2E]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-3.5 h-3.5 text-[#CA3F2E]" strokeWidth={3} />
                  </div>
                  <div>
                    <div className="font-black text-lg lg:text-xl text-gray-900 leading-tight mb-1.5">{p.title}</div>
                    <div className="text-sm lg:text-base text-gray-500 leading-relaxed">{p.body}</div>
                  </div>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>

      {/* ============================================
          CTA - clean close
          ============================================ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 text-center relative">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 tracking-tight">
          {t("signature")}
        </h2>
        <p className="text-gray-500 mb-6">
          {t("signatureSub")}
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-md" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12.5 2H4a2 2 0 00-2 2v8.5a2 2 0 00.59 1.41l8.5 8.5a2 2 0 002.82 0l8.5-8.5a2 2 0 000-2.82L13.91 2.59A2 2 0 0012.5 2z" fill="white" />
                <circle cx="7.5" cy="7.5" r="1.6" fill="#CA3F2E" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5 font-black tracking-tight text-lg leading-none">
              <span className="text-gray-900">NewDeal</span>
              <span className="text-gray-300 font-light">|</span>
              <span className="text-[#CA3F2E] tracking-widest text-base">ZONE</span>
            </div>
          </div>
          <div className="w-10 h-0.5 bg-gray-200" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
          >
            {t("ctaShop")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-xl font-semibold text-sm hover:border-gray-900 transition"
          >
            <MessageCircle className="w-4 h-4" />
            {t("ctaContact")}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
