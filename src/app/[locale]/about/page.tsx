"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield, Star, Truck, HeartHandshake, Users, Award,
  ArrowRight, Check, X, Sparkles, Quote, MessageCircle, Tag
} from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ============================================
          HERO - Split editorial layout
          ============================================ */}
      <section className="pt-24 lg:pt-28 pb-16 lg:pb-24 relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/30 to-white pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#CA3F2E]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-orange-200/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-gray-100 rounded-full mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CA3F2E] animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">
                  {t("badge")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[0.95] mb-6 text-gray-900">
                {t("heroTitle1")}
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#CA3F2E] to-[#8B2A1E] bg-clip-text text-transparent">
                    {t("heroTitle2")}
                  </span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#CA3F2E]/15 -z-0 rounded"></span>
                </span>
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                {t("heroDesc")}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-[#CA3F2E] transition"
                >
                  {t("ctaShop")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-900 rounded-2xl font-bold text-sm hover:border-gray-900 transition"
                >
                  {t("ctaContact")}
                </Link>
              </div>
            </div>

            {/* Right: Image collage */}
            <div className="relative aspect-[4/5] lg:aspect-square">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">2025</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t("founded")}</div>
                  </div>
                </div>
              </div>
              {/* Floating rating card */}
              <div className="absolute -top-3 -right-3 bg-gray-900 text-white rounded-2xl px-5 py-3 shadow-xl">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <div className="text-xs text-gray-300">4.8/5 &middot; 2,400+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MARQUEE - Value proposition ticker
          ============================================ */}
      <section className="bg-gray-900 text-white py-4 overflow-hidden border-y border-gray-800">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center gap-16 px-8">
              {[t("marquee1"), t("marquee2"), t("marquee3"), t("marquee4")].map((text, i) => (
                <div key={r + "-" + i} className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CA3F2E]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          STATS - Big numbers
          ============================================ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2,400+", label: t("statCustomers"), Icon: Users, color: "from-red-100 to-red-50", iconColor: "text-[#CA3F2E]" },
              { value: "50+", label: t("statStyles"), Icon: Tag, color: "from-amber-100 to-amber-50", iconColor: "text-amber-600" },
              { value: "4.8", label: t("statRating"), Icon: Star, color: "from-yellow-100 to-yellow-50", iconColor: "text-yellow-600" },
              { value: "14", label: t("statReturn"), Icon: Truck, color: "from-green-100 to-green-50", iconColor: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="group relative">
                <div className={"absolute inset-0 rounded-2xl bg-gradient-to-br " + s.color + " opacity-0 group-hover:opacity-100 transition"} />
                <div className="relative p-6 text-center">
                  <div className={"w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition " + s.iconColor}>
                    <s.Icon className="w-6 h-6" />
                  </div>
                  <p className="text-4xl lg:text-5xl font-black text-gray-900 mb-1 tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          THREE CHAPTERS - Story timeline
          ============================================ */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white">
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
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {[
              { year: t("ch1Year"), title: t("ch1Title"), desc: t("ch1Desc"), n: "01" },
              { year: t("ch2Year"), title: t("ch2Title"), desc: t("ch2Desc"), n: "02" },
              { year: t("ch3Year"), title: t("ch3Title"), desc: t("ch3Desc"), n: "03" },
            ].map((c, i) => (
              <div key={c.n} className="relative">
                <div className={"relative bg-white rounded-3xl p-8 border transition-all " +
                  (i === 1 ? "border-[#CA3F2E]/30 shadow-lg shadow-red-100/50" : "border-gray-100 hover:border-gray-300 hover:shadow-md")}>
                  {/* Number badge */}
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
          VALUES GRID
          ============================================ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E] mb-3">
              {t("valuesBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              {t("valuesTitle")}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[
              { Icon: Shield, title: t("val1Title"), desc: t("val1Desc") },
              { Icon: Star, title: t("val2Title"), desc: t("val2Desc") },
              { Icon: Truck, title: t("val3Title"), desc: t("val3Desc") },
              { Icon: HeartHandshake, title: t("val4Title"), desc: t("val4Desc") },
              { Icon: Users, title: t("val5Title"), desc: t("val5Desc") },
              { Icon: Award, title: t("val6Title"), desc: t("val6Desc") },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#CA3F2E]/40 transition-all hover:shadow-lg hover:shadow-red-100/30 hover:-translate-y-1">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-gradient-to-br group-hover:from-[#CA3F2E] group-hover:to-[#8B2A1E] flex items-center justify-center mb-4 transition">
                    <Icon className="w-6 h-6 text-gray-700 group-hover:text-white transition" />
                  </div>
                  <h3 className="font-black text-gray-900 mb-2 text-base">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          THEM vs US - Comparison
          ============================================ */}
      <section className="py-20 lg:py-28 bg-gray-950 text-white relative overflow-hidden">
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
            {/* Them */}
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

            {/* Us */}
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
          BIG QUOTE
          ============================================ */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-12 h-12 text-[#CA3F2E]/30 mx-auto mb-6" />
          <blockquote className="text-2xl lg:text-3xl xl:text-4xl font-medium text-gray-900 leading-snug mb-8 tracking-tight">
            &ldquo;{t("quoteText")}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-sm">{t("quoteAuthor")}</div>
              <div className="text-xs text-gray-500">{t("quoteLocation")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TEAM
          ============================================ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase text-[#CA3F2E] mb-3">
              {t("teamBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">{t("teamTitle")}</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">{t("teamDesc")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { name: "Alex Martin", role: t("roleCEO"), img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85" },
              { name: "Sophie Lee", role: t("roleDesign"), img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=85" },
              { name: "James Carter", role: t("roleSupport"), img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=85" },
            ].map((m) => (
              <div key={m.name} className="group">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
                    <div className="text-white">
                      <div className="text-xs uppercase tracking-wider text-white/80 mb-1">{m.role}</div>
                      <div className="text-lg font-black">{m.name}</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-black text-gray-900">{m.name}</h3>
                  <p className="text-sm text-gray-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA - Final call
          ============================================ */}
      <section className="py-16 lg:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 p-10 lg:p-16 text-center shadow-2xl">
            {/* Red glow effects */}
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
