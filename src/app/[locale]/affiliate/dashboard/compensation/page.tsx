"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  Target, 
  Box, 
  Bot, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Calculator,
  Calendar,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function CompensationPlanPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [selectedTeamSize, setSelectedTeamSize] = useState<10 | 50 | 100 | 1000 | 10000>(100);

  const teamProjections = {
    10: {
      l1: 5, l2: 5, l3: 0,
      monthly: 60,
      sixMonths: 360,
      oneYear: 720,
      annualLumpSum: 539.70,
    },
    50: {
      l1: 10, l2: 30, l3: 10,
      monthly: 170,
      sixMonths: 1020,
      oneYear: 2040,
      annualLumpSum: 1529.15,
    },
    100: {
      l1: 15, l2: 50, l3: 35,
      monthly: 285,
      sixMonths: 1710,
      oneYear: 3420,
      annualLumpSum: 2563.68,
    },
    1000: {
      l1: 50, l2: 350, l3: 600,
      monthly: 1800,
      sixMonths: 10800,
      oneYear: 21600,
      annualLumpSum: 16191.90,
    },
    10000: {
      l1: 100, l2: 2900, l3: 7000,
      monthly: 13800,
      sixMonths: 82800,
      oneYear: 165600,
      annualLumpSum: 124131.00,
    },
  };

  const activeProj = teamProjections[selectedTeamSize];

  const t = isFr ? {
    title: "Plan de R\u00e9mun\u00e9ration & Projections",
    subtitle: "D\u00e9couvrez comment maximiser vos gains gr\u00e2ce \u00e0 notre mod\u00e8le d'affiliation hybride.",
    calcTitle: "Calculateur de Potentiel de Gains",
    calcSubtitle: "S\u00e9lectionnez la taille de votre \u00e9quipe pour estimer vos revenus passifs r\u00e9currents :",
    teamSizeLabel: "Taille de l'\u00e9quipe :",
    monthlyEarnings: "Revenu Mensuel Estim\u00e9",
    sixMonthEarnings: "Potentiel sur 6 Mois",
    oneYearEarnings: "Potentiel sur 1 An",
    breakdownTitle: "R\u00e9partition de l'\u00e9quipe :",
    l1Count: "Niveau 1 (Direct 50%) :",
    l2Count: "Niveau 2 (\u00c9quipe 10%) :",
    l3Count: "Niveau 3 (Profond 5%) :",
    annualNote: "Si votre \u00e9quipe vend des abonnements annuels (179.91$), votre gain instantan\u00e9 est de :",
    matrixTitle: "Tableau Comparatif des Projections",
    physicalTitle: "1. Produits Physiques (V\u00eatements, Chaussures, etc.)",
    physicalDesc: "Gagnez une commission directe sur chaque produit physique vendu via votre lien.",
    physicalRate: "5% de commission",
    physicalRule: "Niveau unique (L1 uniquement). Pas de commission d'\u00e9quipe sur les produits physiques pour prot\u00e9ger les marges.",
    digitalTitle: "2. Produits Num\u00e9riques (SMZ AI Trading Bot Pro)",
    digitalDesc: "Notre produit phare offre des commissions massives sur 3 niveaux.",
    l1: "Niveau 1 (Direct)",
    l2: "Niveau 2 (\u00c9quipe)",
    l3: "Niveau 3 (Profond)",
    ruleTitle: "LA R\u00c8GLE DU STATUT ACTIF (TR\u00c8S IMPORTANT)",
    ruleDesc: "Pour prot\u00e9ger le r\u00e9seau et r\u00e9compenser les membres actifs, des r\u00e8gles strictes s'appliquent aux logiciels :",
    rule1Title: "Premier achat d'un client (L1) :",
    rule1Desc: "Vous touchez TOUJOURS les 50% de commission, m\u00eame si vous n'avez pas d'abonnement actif.",
    rule2Title: "Renouvellements d'un client (L1) :",
    rule2Desc: "Si votre client renouvelle son abonnement le mois suivant, vous touchez les 50% UNIQUEMENT si votre propre abonnement SMZ Bot est actif. Sinon, la commission est perdue (0$).",
    rule3Title: "Commissions d'\u00e9quipe (L2 & L3) :",
    rule3Desc: "Vous devez AVOIR UN ABONNEMENT SMZ BOT ACTIF pour d\u00e9bloquer les 10% et 5% sur les ventes de votre \u00e9quipe. Si votre abonnement expire, ces commissions sont bloqu\u00e9es.",
    scenarioTitle: "Sc\u00e9narios Pratiques",
    s1Title: "Sc\u00e9nario A : Vente de Chaussures",
    s1Desc: "Vous partagez votre lien. Un client ach\u00e8te des chaussures \u00e0 100$.",
    s1Result: "Vous gagnez 5$ (5%). Votre parrain gagne 0$.",
    s2Title: "Sc\u00e9nario B : Vente SMZ Bot (Achat Initial)",
    s2Desc: "Vous n'avez PAS d'abonnement actif. Un client ach\u00e8te le SMZ Bot 1 an (179.91$).",
    s2Result: "Vous gagnez 89.95$ (50% garantis sur le 1er achat).",
    s3Title: "Sc\u00e9nario C : Renouvellement SMZ Bot (Vous \u00eates Inactif)",
    s3Desc: "Le client du sc\u00e9nario B renouvelle son abonnement. Votre abonnement personnel a expir\u00e9.",
    s3Result: "Vous gagnez 0$. La commission est perdue car vous n'\u00eates pas actif.",
    s4Title: "Sc\u00e9nario D : Puissance de l'\u00c9quipe (Overrides)",
    s4Desc: "Vous \u00eates ACTIF. Vous avez recrut\u00e9 John (L1). John recrute Sarah (L2). Sarah vend un abonnement SMZ Bot \u00e0 179.91$.",
    s4Result: "Sarah gagne 89.95$ (50%). John gagne 17.99$ (10%). VOUS gagnez 8.99$ (5%).",
  } : {
    title: "Compensation Plan & Earnings Projections",
    subtitle: "Learn how to maximize your earnings with our hybrid affiliate model.",
    calcTitle: "Earnings Potential Calculator",
    calcSubtitle: "Select your potential team size to estimate your recurring passive income:",
    teamSizeLabel: "Active Team Size:",
    monthlyEarnings: "Estimated Monthly Income",
    sixMonthEarnings: "6-Month Earnings",
    oneYearEarnings: "1-Year Earnings",
    breakdownTitle: "Team Structure Split:",
    l1Count: "Level 1 (Direct 50%):",
    l2Count: "Level 2 (Team 10%):",
    l3Count: "Level 3 (Deep 5%):",
    annualNote: "If your team sells annual subscriptions ($179.91/yr), your lump-sum payout is:",
    matrixTitle: "Earnings Projection Matrix",
    physicalTitle: "1. Physical Products (Shoes, Apparel, Bags)",
    physicalDesc: "Earn a direct commission on every physical product sold through your link.",
    physicalRate: "5% Commission",
    physicalRule: "Single-tier (L1 only). No team overrides on physical products to protect manufacturing margins.",
    digitalTitle: "2. Digital Products (SMZ AI Trading Bot Pro)",
    digitalDesc: "Our flagship software offers massive multi-tier recurring commissions.",
    l1: "Level 1 (Direct)",
    l2: "Level 2 (Team)",
    l3: "Level 3 (Deep)",
    ruleTitle: "THE ACTIVE STATUS RULE (CRITICAL)",
    ruleDesc: "To protect the network and reward active members, strict rules apply to software commissions:",
    rule1Title: "First-time Customer Purchase (L1):",
    rule1Desc: "You ALWAYS earn the 50% commission, even if you do not have an active subscription yourself.",
    rule2Title: "Customer Renewals (L1):",
    rule2Desc: "When your customer renews next month, you earn 50% ONLY IF your own SMZ Bot subscription is ACTIVE. If your subscription is expired, the renewal commission is forfeited ($0).",
    rule3Title: "Team Overrides (L2 & L3):",
    rule3Desc: "You MUST HAVE AN ACTIVE SMZ BOT SUBSCRIPTION to unlock the 10% and 5% overrides on your team's sales. If you expire, overrides are locked.",
    scenarioTitle: "Live Scenarios",
    s1Title: "Scenario A: Selling Shoes",
    s1Desc: "You share your link. A customer buys a pair of shoes for $100.",
    s1Result: "You earn $5 (5%). Your inviter earns $0.",
    s2Title: "Scenario B: Selling SMZ Bot (Initial Purchase)",
    s2Desc: "You do NOT have an active subscription. A customer buys the 1-Year SMZ Bot ($179.91).",
    s2Result: "You earn $89.95 (50% is guaranteed on the first purchase).",
    s3Title: "Scenario C: SMZ Bot Renewal (You are Inactive)",
    s3Desc: "The customer from Scenario B renews their subscription. Your personal subscription is expired.",
    s3Result: "You earn $0. The renewal commission is forfeited because you are not active.",
    s4Title: "Scenario D: The Power of Team Overrides",
    s4Desc: "You are ACTIVE. You recruited John (L1). John recruited Sarah (L2). Sarah sells a $179.91 SMZ Bot.",
    s4Result: "Sarah earns $89.95 (50%). John earns $17.99 (10%). YOU earn $8.99 (5%).",
  };

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Target className="w-8 h-8 text-[#CA3F2E]" />
          {t.title}
        </h1>
        <p className="text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* CALCULATOR INTERACTIVE WIDGET */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121215] via-[#1a1215] to-[#251012] border border-[#CA3F2E]/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CA3F2E]/20 text-[#CA3F2E] text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              {t.calcTitle}
            </div>
            <p className="text-xs text-gray-300">{t.calcSubtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {([10, 50, 100, 1000, 10000] as const).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedTeamSize(size)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTeamSize === size
                    ? "bg-[#CA3F2E] text-white shadow-lg shadow-red-600/30 scale-105"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {size >= 1000 ? `${size / 1000}k` : size}
              </button>
            ))}
          </div>
        </div>

        {/* Projection Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> 1 Month
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              ${activeProj.monthly.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400">{t.monthlyEarnings}</p>
          </div>

          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> 6 Months
            </span>
            <p className="text-2xl sm:text-3xl font-black text-sky-300">
              ${activeProj.sixMonths.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400">{t.sixMonthEarnings}</p>
          </div>

          <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1 Year
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-300">
              ${activeProj.oneYear.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400">{t.oneYearEarnings}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-300">
          <div>
            <span className="font-bold text-white">{t.breakdownTitle}</span>{" "}
            <span>{t.l1Count} <strong>{activeProj.l1}</strong> · </span>
            <span>{t.l2Count} <strong>{activeProj.l2}</strong> · </span>
            <span>{t.l3Count} <strong>{activeProj.l3}</strong></span>
          </div>
          <div className="text-emerald-400 font-semibold font-mono">
            Annual Package = <strong className="text-white">${activeProj.annualLumpSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* MATRIX COMPARISON TABLE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#CA3F2E]" />
          {t.matrixTitle}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Team Size</th>
                <th className="py-3 px-3">Structure Split</th>
                <th className="py-3 px-3">1 Month</th>
                <th className="py-3 px-3">6 Months</th>
                <th className="py-3 px-3">1 Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
              {[
                { size: 10, split: "5 L1 + 5 L2", m: 60, s6: 360, y1: 720 },
                { size: 50, split: "10 L1 + 30 L2 + 10 L3", m: 170, s6: 1020, y1: 2040 },
                { size: 100, split: "15 L1 + 50 L2 + 35 L3", m: 285, s6: 1710, y1: 3420 },
                { size: 1000, split: "50 L1 + 350 L2 + 600 L3", m: 1800, s6: 10800, y1: 21600 },
                { size: 10000, split: "100 L1 + 2,900 L2 + 7,000 L3", m: 13800, s6: 82800, y1: 165600 },
              ].map((row) => (
                <tr key={row.size} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-bold text-white font-sans">{row.size.toLocaleString()} Members</td>
                  <td className="py-3.5 px-3 text-gray-400 font-sans">{row.split}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-400">${row.m.toLocaleString()} / mo</td>
                  <td className="py-3.5 px-3 text-sky-300">${row.s6.toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-bold text-amber-400">${row.y1.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Products */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">{t.physicalTitle}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{t.physicalDesc}</p>
          <div className="inline-block px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-lg">
            {t.physicalRate}
          </div>
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500/70 mt-0.5" />
            {t.physicalRule}
          </p>
        </div>

        {/* Digital Products */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-transparent border border-emerald-500/30 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-emerald-50">{t.digitalTitle}</h2>
          <p className="text-sm text-emerald-200/70 leading-relaxed">{t.digitalDesc}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-semibold text-emerald-100">{t.l1}</span>
              <span className="text-lg font-black text-emerald-400">50%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-semibold text-emerald-100">{t.l2}</span>
              <span className="text-lg font-black text-emerald-400">10%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-semibold text-emerald-100">{t.l3}</span>
              <span className="text-lg font-black text-emerald-400">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Active Rule */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30">
        <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5" />
          {t.ruleTitle}
        </h2>
        <p className="text-sm text-amber-200/80 mb-6">{t.ruleDesc}</p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">{t.rule1Title}</h4>
              <p className="text-xs text-gray-400 mt-1">{t.rule1Desc}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">{t.rule2Title}</h4>
              <p className="text-xs text-gray-400 mt-1">{t.rule2Desc}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">{t.rule3Title}</h4>
              <p className="text-xs text-gray-400 mt-1">{t.rule3Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#CA3F2E]" />
          {t.scenarioTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-blue-400 mb-2">{t.s1Title}</h4>
              <p className="text-xs text-gray-400 mb-4">{t.s1Desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-500/20">
              {t.s1Result}
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-emerald-400 mb-2">{t.s2Title}</h4>
              <p className="text-xs text-gray-400 mb-4">{t.s2Desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
              {t.s2Result}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-red-400 mb-2">{t.s3Title}</h4>
              <p className="text-xs text-gray-400 mb-4">{t.s3Desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-300 text-xs font-semibold border border-red-500/20">
              {t.s3Result}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-purple-400 mb-2">{t.s4Title}</h4>
              <p className="text-xs text-gray-400 mb-4">{t.s4Desc}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
              {t.s4Result}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}