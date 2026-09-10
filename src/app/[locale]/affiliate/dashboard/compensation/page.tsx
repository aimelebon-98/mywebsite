"use client";

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
  AlertTriangle 
} from "lucide-react";

export default function CompensationPlanPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const t = isFr ? {
    title: "Plan de R\u00e9mun\u00e9ration",
    subtitle: "D\u00e9couvrez comment maximiser vos gains gr\u00e2ce \u00e0 notre mod\u00e8le d'affiliation hybride.",
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
    title: "Compensation Plan",
    subtitle: "Learn how to maximize your earnings with our hybrid affiliate model.",
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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Target className="w-8 h-8 text-[#CA3F2E]" />
          {t.title}
        </h1>
        <p className="text-gray-400 mt-2">{t.subtitle}</p>
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