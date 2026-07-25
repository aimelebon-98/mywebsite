import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeProducts from "@/components/HomeProducts";
import HomeBlogSection from "@/components/HomeBlogSection";
import AnimatedNetwork from "@/components/AnimatedNetwork";
import TypingText from "@/components/TypingText";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones, Star } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { db } from "@/db";
import { categories as categoriesTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const CATEGORY_IMAGES: Record<string, string> = {
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  running:  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
  formal:   "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80",
  boots:    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80",
  sandals:  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80",
  casual:   "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",
};

const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80";

export default async function HomePage() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const isFr = locale === "fr";

  // Try to read heroTitle2Words from translations; fallback to defaults
  let typingWords: string[];
  try {
    const raw = t("heroTitle2Words");
    typingWords = raw.split(",").map(w => w.trim()).filter(Boolean);
    if (typingWords.length === 0) throw new Error("empty");
  } catch {
    typingWords = isFr
      ? ["Futur", "Rues", "Sentiers", "Ville", "Legende"]
      : ["Future", "Streets", "Trails", "City", "Legacy"];
  }

  let categories: { name: string; slug: string; img: string }[] = [];
  try {
    const cats = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.active, true))
      .orderBy(asc(categoriesTable.sortOrder));

    categories = cats.map(c => ({
      name: isFr && c.nameFr ? c.nameFr : c.nameEn,
      slug: c.slug,
      img: CATEGORY_IMAGES[c.slug] || DEFAULT_CATEGORY_IMAGE,
    }));
  } catch {
    categories = [
      { name: t("catSneakers"), slug: "sneakers", img: CATEGORY_IMAGES.sneakers },
      { name: t("catRunning"),  slug: "running",  img: CATEGORY_IMAGES.running },
      { name: t("catFormal"),   slug: "formal",   img: CATEGORY_IMAGES.formal },
      { name: t("catBoots"),    slug: "boots",    img: CATEGORY_IMAGES.boots },
      { name: t("catSandals"),  slug: "sandals",  img: CATEGORY_IMAGES.sandals },
      { name: t("catCasual"),   slug: "casual",   img: CATEGORY_IMAGES.casual },
    ];
  }

  const features = [
    { icon: Truck,       title: t("featureShipping"), desc: t("featureShippingDesc") },
    { icon: Shield,      title: t("featurePayment"),  desc: t("featurePaymentDesc")  },
    { icon: RotateCcw,   title: t("featureReturns"),  desc: t("featureReturnsDesc")  },
    { icon: Headphones,  title: t("featureSupport"),  desc: t("featureSupportDesc")  },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* HERO - Redesigned with brand red accents */}
      <section className="relative pt-20 lg:pt-24 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.4]">
          <AnimatedNetwork
            className="absolute inset-0 w-full h-full"
            color="17, 24, 39"
            density={60}
            maxDistance={140}
            influenceRadius={190}
            attractStrength={0.65}
          />
        </div>

        <div className="absolute top-24 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30" style={{ backgroundColor: "#CA3F2E" }} />
        <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: "#CA3F2E" }} />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-amber-400 rounded-full blur-3xl pointer-events-none opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 pointer-events-none">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            <div className="animate-fade-in-up pointer-events-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg" style={{ backgroundColor: "#CA3F2E", color: "white" }}>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {t("badge")}
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-6 text-gray-900">
                {t("heroTitle1")} <br />
                <span className="relative inline-block">
                  <TypingText words={typingWords} className="relative z-10" />
                  <span className="absolute bottom-1 left-0 right-0 h-3 rounded-full opacity-30 -z-0" style={{ backgroundColor: "#CA3F2E" }} />
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
                {t("heroDesc")}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/shop`}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 text-white rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-xl hover:-translate-y-0.5 hover:brightness-110"
                  style={{ backgroundColor: "#CA3F2E", boxShadow: "0 10px 30px rgba(202, 63, 46, 0.35)" }}
                >
                  {t("shopNow")}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={`/${locale}/shop?category=sneakers`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/90 backdrop-blur text-gray-900 rounded-xl font-bold text-sm uppercase tracking-wide border-2 border-gray-200 hover:border-gray-900 hover:bg-white transition-all hover:-translate-y-0.5"
                >
                  {t("exploreSnkrs")}
                </Link>
              </div>

              <div className="flex items-center gap-5 mt-10 pt-6 border-t border-gray-100">
                <div className="flex -space-x-2">
                  {["bg-blue-500","bg-pink-500","bg-green-500","bg-purple-500"].map((c, i) => (
                    <div key={i} className={`w-9 h-9 ${c} rounded-full border-2 border-white flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-[11px] font-bold">{["JW","SC","MT","EP"][i]}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    <span className="text-sm font-bold text-gray-900 ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t("happyCustomers")}</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-200 pointer-events-auto">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-[3rem] rotate-6" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }} />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 via-orange-50 to-white rounded-[3rem] -rotate-3" />

                <div className="relative rounded-[3rem] overflow-hidden aspect-square shadow-2xl bg-white animate-float-slow">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85" alt="Featured shoe" className="w-full h-full object-cover" />

                  <div className="absolute top-6 right-6 bg-white rounded-2xl px-4 py-2.5 shadow-xl">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Starting at</div>
                    <div className="text-xl font-black" style={{ color: "#CA3F2E" }}>$149</div>
                  </div>

                  <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white rounded-full pl-2 pr-4 py-2 shadow-xl">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#CA3F2E" }}>
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">Best Seller</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 z-10 hidden sm:block animate-float-slow" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#CA3F2E15" }}>
                      <Truck className="w-5 h-5" style={{ color: "#CA3F2E" }} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Free shipping</div>
                      <div className="text-sm font-bold text-gray-900">Over $100</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">{t("shopByCategory")}</h2>
              <p className="text-gray-500 max-w-md mx-auto">{t("shopByCategoryDesc")}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/shop?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square hover:-translate-y-1 transition-all duration-300 shadow-sm"
                >
                  <img src={cat.img} alt={cat.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <HomeProducts />

        <HomeBlogSection />

        <Footer />
    </main>
  );
}
