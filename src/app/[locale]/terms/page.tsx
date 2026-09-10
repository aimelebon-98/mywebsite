import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageLayout from "@/components/LegalPageLayout";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - NewDealZone",
  description: "The terms and conditions governing your use of NewDealZone and the Affiliate Partner Program.",
  robots: { index: true, follow: true },
};

export default async function TermsPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  const enSections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <p>By accessing or using NewDealZone (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.</p>
      ),
    },
    {
      id: "use",
      title: "2. Use of the Website",
      content: (
        <>
          <p>You may use our website only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service in any way that violates any applicable law or regulation</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Impersonate any person or entity</li>
            <li>Use the Service to send spam or unsolicited communications</li>
          </ul>
        </>
      ),
    },
    {
      id: "orders",
      title: "3. Orders & Payment",
      content: (
        <>
          <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.</p>
          <p>Prices are listed in <strong>USD</strong> and are subject to change without notice. Applicable taxes and shipping fees will be added at checkout.</p>
          <p>Payment must be completed at the time of purchase using one of our accepted methods.</p>
        </>
      ),
    },
    {
      id: "shipping",
      title: "4. Shipping & Delivery",
      content: (
        <p>Please refer to our <a href="/shipping" className="text-gray-900 underline font-medium">Shipping Policy</a> for details on delivery times, fees, and available regions.</p>
      ),
    },
    {
      id: "returns",
      title: "5. Returns & Refunds",
      content: (
        <p>Please refer to our <a href="/returns" className="text-gray-900 underline font-medium">Returns & Refunds Policy</a> for details on returns, exchanges, and refunds.</p>
      ),
    },
    {
      id: "ip",
      title: "6. Intellectual Property",
      content: (
        <p>All content on this site (logos, product descriptions, images, code) is the property of NewDealZone or its licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, or use our content without written permission.</p>
      ),
    },
    {
      id: "warranty",
      title: "7. Product Warranty",
      content: (
        <p>Our products come with a warranty against manufacturing defects for a period of <strong>6 months</strong> from the date of purchase. This warranty does not cover normal wear and tear, misuse, or damage caused by the customer.</p>
      ),
    },
    {
      id: "liability",
      title: "8. Limitation of Liability",
      content: (
        <p>To the fullest extent permitted by law, NewDealZone shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you for the specific product in question.</p>
      ),
    },
    {
      id: "governing",
      title: "9. Governing Law",
      content: (
        <p>These Terms are governed by the laws of <strong>Nigeria</strong>. Any disputes will be resolved in the courts of <strong>Nigeria</strong>.</p>
      ),
    },
    {
      id: "changes",
      title: "10. Changes to Terms",
      content: (
        <p>We reserve the right to modify these Terms at any time. Changes are effective when posted. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.</p>
      ),
    },
    {
      id: "affiliate",
      title: "11. Affiliate Partner Program Terms",
      content: (
        <>
          <p>By participating in the NewDealZone Affiliate Partner Program, affiliates agree to the following conditions:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>
              <strong>Hybrid Commission Structure:</strong> Affiliates earn a <strong>5% direct commission</strong> on physical goods (shoes, apparel, leather products) on a single tier (Level 1). On digital software subscriptions (e.g. SMZ AI Trading Bot Pro), affiliates can earn up to 3 tiers of commission: <strong>50% (Level 1 Direct)</strong>, <strong>10% (Level 2 Team Override)</strong>, and <strong>5% (Level 3 Deep Override)</strong>.
            </li>
            <li>
              <strong>First-Time Sales vs. Recurring Renewals:</strong> Direct Level 1 50% commissions are guaranteed on a customer&apos;s initial software purchase regardless of the affiliate&apos;s subscription status. However, recurring software subscription renewals (months 2+, annual renewals) and multi-level team overrides (L2 10% and L3 5%) strictly require the affiliate to maintain an active SMZ Bot Pro subscription. If the affiliate&apos;s subscription is inactive or expired at the time of renewal, recurring commissions and overrides are forfeited.
            </li>
            <li>
              <strong>Payment on Delivery (Physical Products):</strong> Commissions for physical products ordered via Cash on Delivery or WhatsApp checkout are logged in a &quot;Pending&quot; state and become withdrawable into the available balance ONLY upon confirmed delivery of the order. Cancelled, returned, or refunded orders forfeit commission.
            </li>
            <li>
              <strong>Withdrawals & Wallet Requirements:</strong> The minimum withdrawal threshold is <strong>$20.00 USD</strong>. All commission payouts are remitted in USDT via the Tron (TRC20) network to the wallet address specified in the affiliate&apos;s Settings.
            </li>
            <li>
              <strong>Anti-Fraud & Prohibited Conduct:</strong> Self-referrals, creating duplicate accounts to farm commissions, misleading advertising, or sending unsolicited spam are strictly prohibited. Violations will result in immediate account termination and forfeiture of all accrued balances.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "12. Contact",
      content: (
        <p>Questions about these Terms? Contact us at <strong>support@newdealzone.com</strong>.</p>
      ),
    },
  ];

  const frSections = [
    {
      id: "acceptance",
      title: "1. Acceptation des conditions",
      content: (
        <p>En accedant ou en utilisant NewDealZone (&laquo; le Service &raquo;), vous acceptez d&apos;etre lie par ces Conditions Generales. Si vous n&apos;etes pas d&apos;accord avec l&apos;un de ces termes, vous ne pouvez pas utiliser le Service.</p>
      ),
    },
    {
      id: "use",
      title: "2. Utilisation du site",
      content: (
        <>
          <p>Vous ne pouvez utiliser notre site qu&apos;a des fins legales. Vous vous engagez a ne pas :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utiliser le Service en violation d&apos;une loi applicable</li>
            <li>Tenter d&apos;acceder de maniere non autorisee au Service</li>
            <li>Perturber le Service ou les serveurs</li>
            <li>Vous faire passer pour une autre personne</li>
            <li>Envoyer du spam ou des communications non sollicitees</li>
          </ul>
        </>
      ),
    },
    {
      id: "orders",
      title: "3. Commandes et paiement",
      content: (
        <>
          <p>Toutes les commandes sont soumises a acceptation et disponibilite. Nous nous reservons le droit de refuser ou d&apos;annuler toute commande.</p>
          <p>Les prix sont en <strong>USD</strong> et peuvent changer sans preavis. Les taxes et frais de livraison sont ajoutes au moment du paiement.</p>
          <p>Le paiement doit etre complete au moment de l&apos;achat avec l&apos;une de nos methodes acceptees.</p>
        </>
      ),
    },
    {
      id: "shipping",
      title: "4. Livraison",
      content: (
        <p>Consultez notre <a href="/shipping" className="text-gray-900 underline font-medium">Politique de livraison</a> pour les details.</p>
      ),
    },
    {
      id: "returns",
      title: "5. Retours et remboursements",
      content: (
        <p>Consultez notre <a href="/returns" className="text-gray-900 underline font-medium">Politique de retours</a> pour les details.</p>
      ),
    },
    {
      id: "ip",
      title: "6. Propriete intellectuelle",
      content: (
        <p>Tout le contenu de ce site (logos, descriptions, images, code) est la propriete de NewDealZone et protege par le droit d&apos;auteur. Vous ne pouvez pas le reproduire ou l&apos;utiliser sans autorisation ecrite.</p>
      ),
    },
    {
      id: "warranty",
      title: "7. Garantie produit",
      content: (
        <p>Nos produits sont garantis contre les defauts de fabrication pendant <strong>6 mois</strong>. Cette garantie ne couvre pas l&apos;usure normale, la mauvaise utilisation ou les dommages causes par le client.</p>
      ),
    },
    {
      id: "liability",
      title: "8. Limitation de responsabilite",
      content: (
        <p>Dans la mesure permise par la loi, NewDealZone ne sera pas responsable des dommages indirects, accessoires ou consecutifs. Notre responsabilite totale ne depassera pas le montant paye pour le produit concerne.</p>
      ),
    },
    {
      id: "governing",
      title: "9. Droit applicable",
      content: (
        <p>Ces Conditions sont regies par le droit de <strong>Nigeria</strong>. Tout litige sera resolu devant les tribunaux de <strong>Nigeria</strong>.</p>
      ),
    },
    {
      id: "changes",
      title: "10. Modifications",
      content: (
        <p>Nous nous reservons le droit de modifier ces Conditions a tout moment. Votre utilisation continue du Service constitue votre acceptation des modifications.</p>
      ),
    },
    {
      id: "affiliate",
      title: "11. Conditions du Programme d'Affiliation",
      content: (
        <>
          <p>En participant au Programme d&apos;Affiliation NewDealZone, les affili\u00e9s acceptent les conditions suivantes :</p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>
              <strong>Structure de commission hybride :</strong> Les affili\u00e9s per\u00e7oivent une <strong>commission directe de 5%</strong> sur les produits physiques (chaussures, v\u00eatement, maroquinerie) sur un seul niveau. Sur les abonnements logiciels (ex: SMZ AI Trading Bot Pro), les affili\u00e9s peuvent gagner sur 3 niveaux : <strong>50% (Niveau 1 Direct)</strong>, <strong>10% (Niveau 2 Override \u00c9quipe)</strong> et <strong>5% (Niveau 3 Override Profond)</strong>.
            </li>
            <li>
              <strong>Premier achat vs Renouvellements :</strong> La commission directe de 50% sur le premier achat d&apos;un client est garantie quel que soit le statut de l&apos;affili\u00e9. En revanche, les renouvellements d&apos;abonnement logiciel et les overrides d&apos;équipe (L2 10% et L3 5%) necessitent un abonnement actif au SMZ Bot Pro. Si l&apos;affili\u00e9 est inactif au moment du renouvellement, la commission est perdue.
            </li>
            <li>
              <strong>Paiement \u00e0 la livraison (Produits physiques) :</strong> Les commissions sur les produits physiques command\u00e9s en paiement \u00e0 la livraison sont en attente et deviennent retirables UNIQUEMENT apr\u00e8s confirmation de la livraison.
            </li>
            <li>
              <strong>Retraits et Portefeuille :</strong> Le seuil minimum de retrait est de <strong>20,00 $ USD</strong>. Tous les paiements sont effectu\u00e9s en USDT via le r\u00e9seau Tron (TRC20).
            </li>
            <li>
              <strong>Lutte contre la fraude :</strong> L&apos;auto-parrainage, le spam et la cr\u00e9ation de faux comptes pour cumuler des commissions sont strictement interdits sous peine de fermeture immediate du compte et confiscation des soldes.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "12. Contact",
      content: (
        <p>Questions ? Contactez-nous a <strong>support@newdealzone.com</strong>.</p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div>
        <LegalPageLayout
          title={isFr ? "Conditions generales" : "Terms of Service"}
          subtitle={isFr ? "Les regles qui regissent votre utilisation de NewDealZone." : "The rules governing your use of NewDealZone."}
          lastUpdated="September 10, 2026"
          sections={isFr ? frSections : enSections}
        />
      </div>
      <Footer />
    </main>
  );
}