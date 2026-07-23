import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Shield, Star, Truck, HeartHandshake, Users, Award } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative bg-gray-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            {t("badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            {t("heroTitle1")}<br />
            <span className="text-gray-300">{t("heroTitle2")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("heroDesc")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,400+", label: t("statCustomers") },
              { value: "50+",    label: t("statStyles") },
              { value: "4.8",    label: t("statRating") },
              { value: "30",     label: t("statReturn") },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
              {t("storyBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {t("storyTitle")}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">{t("storyP1")}</p>
            <p className="text-gray-500 leading-relaxed mb-4">{t("storyP2")}</p>
            <p className="text-gray-500 leading-relaxed">{t("storyP3")}</p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
                alt="SoleVault shoes"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gray-900 text-white rounded-2xl px-6 py-4 shadow-xl">
              <p className="text-2xl font-bold">2025</p>
              <p className="text-xs text-gray-400">{t("founded")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
              {t("valuesBadge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("valuesTitle")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { Icon: Shield,         title: t("val1Title"), desc: t("val1Desc") },
              { Icon: Star,           title: t("val2Title"), desc: t("val2Desc") },
              { Icon: Truck,          title: t("val3Title"), desc: t("val3Desc") },
              { Icon: HeartHandshake, title: t("val4Title"), desc: t("val4Desc") },
              { Icon: Users,          title: t("val5Title"), desc: t("val5Desc") },
              { Icon: Award,          title: t("val6Title"), desc: t("val6Desc") },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
            {t("teamBadge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("teamTitle")}</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t("teamDesc")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Alex Martin",  role: t("roleCEO"),     img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
            { name: "Sophie Lee",   role: t("roleDesign"),  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
            { name: "James Carter", role: t("roleSupport"), img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
          ].map((m) => (
            <div key={m.name} className="text-center group">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 group-hover:border-gray-900 transition">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-gray-900">{m.name}</h3>
              <p className="text-sm text-gray-500">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-gray-400 mb-8 text-lg">{t("ctaDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition text-sm"
            >
              {t("ctaShop")}
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition text-sm"
            >
              {t("ctaContact")}
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}