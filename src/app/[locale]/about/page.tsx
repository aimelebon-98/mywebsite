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
    <main className="min-h-screen relative overflow-hidden">
      {/* ============================================
          ANIMATED BACKGROUND - floating gradient blobs
          Sits behind everything, subtle and pro
          ============================================ */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#CA3F2E]/8 blur-3xl animate-blob-1" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-orange-200/20 blur-3xl animate-blob-2" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full bg-amber-100/25 blur-3xl animate-blob-3" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#8B2A1E]/6 blur-3xl animate-blob-1" style={{ animationDelay: "-8s" }} />
      </div>

      <Navbar />

      {/* ============================================
          FOUNDER CARD - first section
          ============================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 relative">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-[minmax(300px,380px)_1fr]">
            {/* Photo */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 md:p-8">
              <div className="relative">
                <div className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl">
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
            <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E] mb-4">
                {t("founderLabel")}
              </span>
              <p className="font-fancy text-xl md:text-2xl lg:text-[28px] text-gray-800 leading-[1.4] mb-6">
                &ldquo;{t("founderNote")}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-5 border-t border-gray-100 flex-wrap gap-3">
                <div>
                  <div className="font-bold text-gray-900">{t("founderName")}</div>
                  <div className="text-xs text-gray-500">{t("founderRole")}</div>
                </div>
                <div className="font-fancy text-sm text-gray-500">{t("founderSignature")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          THREE CHAPTERS - restored numbered timeline
          ============================================ */}
      <section className="py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E] mb-3">
              {t("chaptersBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {t("chaptersTitle")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connecting line */}
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
          WE REFUSE + WE PROMISE
          ============================================ */}
      <section className="py-16 lg:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* We refuse */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                <X className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
                {t("refuseLabel")}
              </span>
            </div>
            <ul className="space-y-3">
              {[t("refuse1"), t("refuse2"), t("refuse3")].map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500 line-through">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* We promise */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-[#CA3F2E]/20 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-[#CA3F2E] rounded-xl flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#CA3F2E]">
                {t("promiseLabel")}
              </span>
            </div>
            <ul className="space-y-4">
              {[
                { title: t("promise1Title"), body: t("promise1Body") },
                { title: t("promise2Title"), body: t("promise2Body") },
                { title: t("promise3Title"), body: t("promise3Body") },
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#CA3F2E] mt-0.5 flex-shrink-0" strokeWidth={3} />
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
          CTA - clean close
          ============================================ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center relative">
        <h2 className="font-fancy text-3xl sm:text-4xl text-gray-900 mb-3 tracking-tight">
          {t("signature")}
        </h2>
        <p className="text-gray-500 mb-6">
          {t("signatureSub")}
        </p>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-0.5 bg-gray-200" />
          <div className="flex items-baseline gap-1.5 font-black tracking-tight text-base">
            <span className="text-gray-900">NewDeal</span>
            <span className="text-gray-300 font-light">|</span>
            <span className="text-[#CA3F2E] tracking-widest text-sm">ZONE</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200" />
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
