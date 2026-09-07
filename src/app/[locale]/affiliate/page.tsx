import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  Award,
  Globe,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AffiliateLandingPage({ params }: Props) {
  const { locale } = await params;
  const isFr = locale === "fr";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CA3F2E] rounded-full blur-[140px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CA3F2E]/10 border border-[#CA3F2E]/30 text-[#CA3F2E] text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {isFr ? "Programme Partenaire Officiel" : "Official Partner Program"}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {isFr ? (
              <>
                Mon\u00e9tisez votre audience avec{" "}
                <span className="text-[#CA3F2E]">New Deal Zone</span>
              </>
            ) : (
              <>
                Earn Cash Promoting Premium Footwear with{" "}
                <span className="text-[#CA3F2E]">New Deal Zone</span>
              </>
            )}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {isFr
              ? "Gagnez 5% de commission sur chaque commande valid\u00e9e. Cookie de 30 jours, paiements directs sur votre compte bancaire et suivi en temps r\u00e9el."
              : "Earn 5% commission on every verified order. 30-day tracking cookie, direct bank payouts in your local currency, and real-time analytics."}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/affiliate/apply`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold transition-all shadow-lg shadow-[#CA3F2E]/30 text-base"
            >
              {isFr ? "Postuler en 2 minutes" : "Apply in 2 Minutes"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}/affiliate/login`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/15 transition-all text-base"
            >
              {isFr ? "Espace Affili\u00e9 (Connexion)" : "Affiliate Login"}
            </Link>
          </div>

          {/* Quick stats banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#CA3F2E] font-bold text-2xl">
                <Percent className="w-5 h-5" /> 5.0%
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {isFr ? "Commission par vente" : "Commission per sale"}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#CA3F2E] font-bold text-2xl">
                <Zap className="w-5 h-5" /> 30 {isFr ? "Jours" : "Days"}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {isFr ? "Fen\u00eatre d'attribution cookie" : "Cookie tracking window"}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#CA3F2E] font-bold text-2xl">
                <Globe className="w-5 h-5" /> 8+
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {isFr ? "Devises support\u00e9es (FCFA, NGN...)" : "Currencies (NGN, FCFA, USD...)"}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#CA3F2E] font-bold text-2xl">
                <ShieldCheck className="w-5 h-5" /> $20
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {isFr ? "Seuil de retrait minimum" : "Minimum payout threshold"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {isFr ? "Comment \u00e7a marche ?" : "How It Works"}
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base">
            {isFr
              ? "Trois \u00e9tapes simples pour commencer \u00e0 g\u00e9n\u00e9rer des revenus r\u00e9guliers."
              : "Three simple steps to start earning consistent commission."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 relative">
            <div className="w-12 h-12 rounded-xl bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center font-extrabold text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">
              {isFr ? "1. Postulez en ligne" : "1. Apply Online"}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isFr
                ? "Remplissez le formulaire en 2 minutes. Notre \u00e9quipe valide votre compte sous 24-48h."
                : "Fill out the application form in 2 minutes. Our team reviews and approves your account within 24-48 hours."}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 relative">
            <div className="w-12 h-12 rounded-xl bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center font-extrabold text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">
              {isFr ? "2. Partagez votre lien" : "2. Share Your Link"}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isFr
                ? "Obtenez votre code unique (?ref=VOTRECODE). Partagez sur TikTok, Instagram, WhatsApp, YouTube ou votre blog."
                : "Get your custom referral link (?ref=YOURCODE). Share it across TikTok, Instagram, WhatsApp, YouTube, or your blog."}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 relative">
            <div className="w-12 h-12 rounded-xl bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center font-extrabold text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">
              {isFr ? "3. Recevez vos gains" : "3. Get Paid"}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isFr
                ? "D\u00e8s qu'une commande est livr\u00e9e, votre commission est cr\u00e9dit\u00e9e. Demandez un virement bancaire d\u00e8s $20."
                : "Once an order is completed, your commission is credited. Request a bank transfer straight to your account whenever you hit $20."}
            </p>
          </div>
        </div>
      </section>

      {/* WHY PARTNER WITH US */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {isFr ? "Pourquoi choisir New Deal Zone ?" : "Why Partner with Us?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <CheckCircle2 className="w-6 h-6 text-[#CA3F2E] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-white">
                  {isFr ? "Chaussures Premium \u00e0 Forte Conversion" : "High-Converting Premium Footwear"}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  {isFr
                    ? "Nos sneakers, mocassins et bottes b\u00e9n\u00e9ficient de visuels soign\u00e9s et d'avis clients authentiques."
                    : "Curated collection with studio photography, verified customer reviews, and fast delivery."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <CheckCircle2 className="w-6 h-6 text-[#CA3F2E] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-white">
                  {isFr ? "Paiements en Devises Locales" : "Local Currency Payouts"}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  {isFr
                    ? "Recevez vos gains en NGN, FCFA (XOF), USD, EUR ou GHS directement sur votre compte bancaire."
                    : "Get paid in NGN, FCFA (XOF), USD, EUR, or GHS directly to your local bank account."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <CheckCircle2 className="w-6 h-6 text-[#CA3F2E] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-white">
                  {isFr ? "Tableau de Bord D\u00e9di\u00e9" : "Dedicated Affiliate Dashboard"}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  {isFr
                    ? "Suivez vos clics, commandes, revenus en attente et historique de retraits en temps r\u00e9el."
                    : "Track clicks, orders, pending earnings, and payout history with transparent analytics."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <CheckCircle2 className="w-6 h-6 text-[#CA3F2E] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-white">
                  {isFr ? "G\u00e9n\u00e9rateur de Liens Produits" : "Deep Link Generator"}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  {isFr
                    ? "Cr\u00e9ez des liens d'affiliation pointant directement vers n'importe quelle paire de chaussures du site."
                    : "Generate affiliate links pointing directly to any specific shoe or category on the store."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-to-b from-[#CA3F2E]/20 to-transparent border border-[#CA3F2E]/30">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            {isFr
              ? "Pr\u00eat \u00e0 commencer \u00e0 gagner ?"
              : "Ready to Start Earning?"}
          </h2>
          <p className="mt-4 text-gray-300 text-base max-w-xl mx-auto">
            {isFr
              ? "Rejoignez notre r\u00e9seau de cr\u00e9ateurs, influenceurs et passionn\u00e9s de sneakers d\u00e8s aujourd'hui."
              : "Join our network of creators, influencers, and sneaker enthusiasts today."}
          </p>
          <div className="mt-8">
            <Link
              href={`/${locale}/affiliate/apply`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold transition-all shadow-lg shadow-[#CA3F2E]/30 text-base"
            >
              {isFr ? "Soumettre ma candidature" : "Submit Application"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}