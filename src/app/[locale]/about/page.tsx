"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Check, X, Sparkles, MessageCircle } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ============================================
          COMPACT HERO - editorial statement
          ============================================ */}
      <section className="pt-28 lg:pt-32 pb-16 lg:pb-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#CA3F2E] animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-[#CA3F2E]">
              {t("badge")}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-gray-900 mb-6">
            {t("heroTitle1")}
            <br />
            <span className="bg-gradient-to-r from-[#CA3F2E] to-[#8B2A1E] bg-clip-text text-transparent">
              {t("heroTitle2")}
            </span>
          </h1>

          <p className="text-gray-600 text-lg lg:text-xl leading-relaxed max-w-2xl">
            {t("heroDesc")}
          </p>
        </div>
      </section>

      {/* ============================================
          OUR STORY - editorial prose
          ============================================ */}
      <section className="py-12 lg:py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E]">
              {t("storyBadge")}
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mt-3 tracking-tight">
              {t("storyTitle")}
            </h2>
          </div>

          <div className="space-y-5 text-gray-600 leading-relaxed text-base lg:text-lg">
            <p>{t("storyP1")}</p>
            <p>{t("storyP2")}</p>
            <p>{t("storyP3")}</p>
          </div>
        </div>
      </section>

      {/* ============================================
          THREE CHAPTERS - kept from previous
          ============================================ */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E] mb-3">
              {t("chaptersBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
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
                <div className={"relative bg-white rounded-3xl p-8 border transition-all " +
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
          THEM vs US - kept from previous
          ============================================ */}
      <section className="py-20 lg:py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(202,63,46,0.15),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E] mb-3">
              {t("diffBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              {t("diffTitle")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white/5 backdrop-blur rounded-3xl p-6 lg:p-8 border border-white/10">
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/10">
                <X className="w-5 h-5 text-gray-500" />
                <h3 className="font-black text-gray-400 uppercase text-sm tracking-wide">
                  {t("diffColThem")}
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { label: t("diff1"), val: t("diff1Them") },
                  { label: t("diff2"), val: t("diff2Them") },
                  { label: t("diff3"), val: t("diff3Them") },
                  { label: t("diff4"), val: t("diff4Them") },
                  { label: t("diff5"), val: t("diff5Them") },
                ].map(row => (
                  <li key={row.label} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">{row.label}</div>
                      <div className="text-sm text-gray-400 line-through">{row.val}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-3xl p-6 lg:p-8 shadow-2xl shadow-red-950/30 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                  <h3 className="font-black text-white uppercase text-sm tracking-wide">
                    {t("diffColUs")}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { label: t("diff1"), val: t("diff1Us") },
                    { label: t("diff2"), val: t("diff2Us") },
                    { label: t("diff3"), val: t("diff3Us") },
                    { label: t("diff4"), val: t("diff4Us") },
                    { label: t("diff5"), val: t("diff5Us") },
                  ].map(row => (
                    <li key={row.label} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-white/80 uppercase tracking-wider font-bold">{row.label}</div>
                        <div className="text-sm text-white font-semibold">{row.val}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA - kept from previous
          ============================================ */}
      <section className="py-16 lg:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-10 lg:p-16 text-center shadow-2xl">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#CA3F2E]/30 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#CA3F2E]/20 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full mb-6">
                <Sparkles className="w-3 h-3 text-[#CA3F2E]" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-white">
                  {t("ctaShop")}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                {t("ctaTitle")}
              </h2>
              <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
                {t("ctaDesc")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/shop"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black hover:bg-gray-100 transition text-sm"
                >
                  {t("ctaShop")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-2xl font-black transition text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("ctaContact")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
