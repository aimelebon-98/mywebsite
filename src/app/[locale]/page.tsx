import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeProducts from "@/components/HomeProducts";
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

  // Words that naturally follow "Walk the ___" / "Marche vers le/la/l'___"
  let typingWords: string[];
  try {
    const raw = t("heroTitle2Words");
    typingWords = raw.split(",").map(w => w.trim()).filter(Boolean);
    if (typingWords.length === 0) throw new Error("empty");
  } catch {
    typingWords = isFr
      ? ["Futur", "Sommet", "Style", "Rythme", "Succes", "Horizon"]
      : ["Future", "Streets", "Runway", "Extra Mile", "City", "Distance"];
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

      {/* HERO */}
      <section className="relative pt-20 lg:pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        <div className="absolute inset-0 opacity-[0.6]">
          <AnimatedNetwork
            className="absolute inset-0 w-full h-full"
            color="17, 24, 39"
            density={80}
            maxDistance={140}
            influenceRadius={190}
            attractStrength={0.65}
          />
        </div>
        <div className="absolute top-24 -left-20 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-gray-200/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28 pointer-events-none">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up pointer-events-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/95 backdrop-blur text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full mb-6 shadow-lg shadow-gray-900/10">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
                {t("badge")}
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-6">
                {t("heroTitle1")} <br />
                <TypingText
                  words={typingWords}
                  className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent"
                />
              </h1>
              <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
                {t("heroDesc")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/${locale}/shop`}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/25 hover:shadow-2xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
                >
                  {t("shopNow")}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={`/${locale}/shop?category=sneakers`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur text-gray-900 rounded-2xl font-semibold border-2 border-gray-200 hover:border-gray-900 hover:bg-white transition-all hover:-translate-y-0.5"
                >
                  {t("exploreSnkrs")}
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {["bg-blue-500","bg-pink-500","bg-green-500","bg-purple-500"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-[10px] font-bold">{["JW","SC","MT","EP"][i]}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t("happyCustomers")}</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-200 pointer-events-auto">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-200 via-brand-100 to-brand-50 rounded-[3rem] rotate-6" />
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-white rounded-[3rem] -rotate-3" />
                <div className="relative rounded-[3rem] overflow-hidden aspect-square shadow-2xl bg-gradient-to-br from-brand-100 to-brand-50 animate-float-slow">
                  <img
                    src="https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&q=80"
                    alt="Featured Shoe"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t("freeShipping")}</p>
                      <p className="text-[10px] text-gray-400">{t("freeShippingDesc")}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-xl animate-float animation-delay-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t("topRated")}</p>
                      <p className="text-[10px] text-gray-400">{t("topRatedDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BAR */}
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

      <Footer />
    </main>
  );
}
