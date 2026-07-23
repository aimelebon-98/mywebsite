import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageLayout from "@/components/LegalPageLayout";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - SoleVault",
  description: "The terms and conditions governing your use of SoleVault.",
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
        <p>By accessing or using SoleVault (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.</p>
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
      title: "3. Orders &amp; Payment",
      content: (
        <>
          <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.</p>
          <p>Prices are listed in <strong>[YOUR CURRENCY]</strong> and are subject to change without notice. Applicable taxes and shipping fees will be added at checkout.</p>
          <p>Payment must be completed at the time of purchase using one of our accepted methods.</p>
        </>
      ),
    },
    {
      id: "shipping",
      title: "4. Shipping &amp; Delivery",
      content: (
        <p>Please refer to our <a href="/shipping" className="text-gray-900 underline font-medium">Shipping Policy</a> for details on delivery times, fees, and available regions.</p>
      ),
    },
    {
      id: "returns",
      title: "5. Returns &amp; Refunds",
      content: (
        <p>Please refer to our <a href="/returns" className="text-gray-900 underline font-medium">Returns &amp; Refunds Policy</a> for details on returns, exchanges, and refunds.</p>
      ),
    },
    {
      id: "ip",
      title: "6. Intellectual Property",
      content: (
        <p>All content on this site (logos, product descriptions, images, code) is the property of SoleVault or its licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, or use our content without written permission.</p>
      ),
    },
    {
      id: "warranty",
      title: "7. Product Warranty",
      content: (
        <p>Our products come with a warranty against manufacturing defects for a period of <strong>[X months]</strong> from the date of purchase. This warranty does not cover normal wear and tear, misuse, or damage caused by the customer.</p>
      ),
    },
    {
      id: "liability",
      title: "8. Limitation of Liability",
      content: (
        <p>To the fullest extent permitted by law, SoleVault shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you for the specific product in question.</p>
      ),
    },
    {
      id: "governing",
      title: "9. Governing Law",
      content: (
        <p>These Terms are governed by the laws of <strong>[YOUR COUNTRY/STATE]</strong>. Any disputes will be resolved in the courts of <strong>[YOUR JURISDICTION]</strong>.</p>
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
      id: "contact",
      title: "11. Contact",
      content: (
        <p>Questions about these Terms? Contact us at <strong>[YOUR EMAIL]</strong>.</p>
      ),
    },
  ];

  const frSections = [
    {
      id: "acceptance",
      title: "1. Acceptation des conditions",
      content: (
        <p>En accedant ou en utilisant SoleVault (&laquo; le Service &raquo;), vous acceptez d&apos;etre lie par ces Conditions Generales. Si vous n&apos;etes pas d&apos;accord avec l&apos;un de ces termes, vous ne pouvez pas utiliser le Service.</p>
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
          <p>Les prix sont en <strong>[VOTRE DEVISE]</strong> et peuvent changer sans preavis. Les taxes et frais de livraison sont ajoutes au moment du paiement.</p>
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
        <p>Tout le contenu de ce site (logos, descriptions, images, code) est la propriete de SoleVault et protege par le droit d&apos;auteur. Vous ne pouvez pas le reproduire ou l&apos;utiliser sans autorisation ecrite.</p>
      ),
    },
    {
      id: "warranty",
      title: "7. Garantie produit",
      content: (
        <p>Nos produits sont garantis contre les defauts de fabrication pendant <strong>[X mois]</strong>. Cette garantie ne couvre pas l&apos;usure normale, la mauvaise utilisation ou les dommages causes par le client.</p>
      ),
    },
    {
      id: "liability",
      title: "8. Limitation de responsabilite",
      content: (
        <p>Dans la mesure permise par la loi, SoleVault ne sera pas responsable des dommages indirects, accessoires ou consecutifs. Notre responsabilite totale ne depassera pas le montant paye pour le produit concerne.</p>
      ),
    },
    {
      id: "governing",
      title: "9. Droit applicable",
      content: (
        <p>Ces Conditions sont regies par le droit de <strong>[VOTRE PAYS]</strong>. Tout litige sera resolu devant les tribunaux de <strong>[VOTRE JURIDICTION]</strong>.</p>
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
      id: "contact",
      title: "11. Contact",
      content: (
        <p>Questions ? Contactez-nous a <strong>[VOTRE EMAIL]</strong>.</p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 lg:pt-24">
        <LegalPageLayout
          title={isFr ? "Conditions generales" : "Terms of Service"}
          subtitle={isFr ? "Les regles qui regissent votre utilisation de SoleVault." : "The rules governing your use of SoleVault."}
          lastUpdated="January 1, 2026"
          sections={isFr ? frSections : enSections}
        />
      </div>
      <Footer />
    </main>
  );
}
