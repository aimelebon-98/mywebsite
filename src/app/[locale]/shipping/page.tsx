import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageLayout from "@/components/LegalPageLayout";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy - SoleVault",
  description: "Shipping fees, delivery times, and available regions for SoleVault orders.",
  robots: { index: true, follow: true },
};

export default async function ShippingPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  const enSections = [
    {
      id: "regions",
      title: "1. Available Regions",
      content: (
        <>
          <p>We currently ship to: <strong>[LIST YOUR REGIONS - e.g., Worldwide, North America, EU]</strong>.</p>
          <p>If your country is not listed at checkout, please contact us at <strong>[YOUR EMAIL]</strong> for a custom quote.</p>
        </>
      ),
    },
    {
      id: "times",
      title: "2. Delivery Times",
      content: (
        <>
          <p>Estimated delivery times after order processing:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Domestic (standard):</strong> [X-Y] business days</li>
            <li><strong>Domestic (express):</strong> [X-Y] business days</li>
            <li><strong>International (standard):</strong> [X-Y] business days</li>
            <li><strong>International (express):</strong> [X-Y] business days</li>
          </ul>
          <p>Orders are typically processed within <strong>1-2 business days</strong>. You will receive a tracking number as soon as your order ships.</p>
        </>
      ),
    },
    {
      id: "fees",
      title: "3. Shipping Fees",
      content: (
        <>
          <p>Shipping fees are calculated at checkout based on your location and order weight.</p>
          <p><strong>Free shipping</strong> is available on orders over <strong>[$X]</strong> to <strong>[YOUR REGION]</strong>.</p>
        </>
      ),
    },
    {
      id: "tracking",
      title: "4. Order Tracking",
      content: (
        <p>Once your order ships, we&apos;ll send you a confirmation email with a tracking link. You can also check the status of your order through the tracking number provided.</p>
      ),
    },
    {
      id: "customs",
      title: "5. Customs &amp; Import Duties",
      content: (
        <p>International orders may be subject to customs duties, taxes, or import fees imposed by the destination country. These are the responsibility of the customer and are not included in our shipping fees.</p>
      ),
    },
    {
      id: "issues",
      title: "6. Delays &amp; Lost Packages",
      content: (
        <>
          <p>While we do everything possible to ensure timely delivery, delays may occur due to weather, customs, or carrier issues. We are not responsible for delays caused by the shipping carrier.</p>
          <p>If your package appears lost (not delivered <strong>[X days]</strong> after the estimated date), contact us immediately at <strong>[YOUR EMAIL]</strong>.</p>
        </>
      ),
    },
    {
      id: "wrong-address",
      title: "7. Incorrect Address",
      content: (
        <p>Please double-check your shipping address at checkout. We are not responsible for packages shipped to incorrect addresses provided by the customer. Address changes can only be made before the order ships.</p>
      ),
    },
  ];

  const frSections = [
    {
      id: "regions",
      title: "1. Zones de livraison",
      content: (
        <>
          <p>Nous livrons actuellement dans : <strong>[LISTE DES ZONES]</strong>.</p>
          <p>Si votre pays n&apos;est pas propose au moment du paiement, contactez-nous a <strong>[VOTRE EMAIL]</strong> pour un devis personnalise.</p>
        </>
      ),
    },
    {
      id: "times",
      title: "2. Delais de livraison",
      content: (
        <>
          <p>Delais estimes apres traitement de la commande :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>National (standard) :</strong> [X-Y] jours ouvrables</li>
            <li><strong>National (express) :</strong> [X-Y] jours ouvrables</li>
            <li><strong>International (standard) :</strong> [X-Y] jours ouvrables</li>
            <li><strong>International (express) :</strong> [X-Y] jours ouvrables</li>
          </ul>
          <p>Les commandes sont traitees sous <strong>1-2 jours ouvrables</strong>. Vous recevrez un numero de suivi des l&apos;expedition.</p>
        </>
      ),
    },
    {
      id: "fees",
      title: "3. Frais de livraison",
      content: (
        <>
          <p>Les frais sont calcules au moment du paiement selon votre localisation et le poids.</p>
          <p><strong>Livraison gratuite</strong> pour les commandes de plus de <strong>[X EUR]</strong> vers <strong>[VOTRE ZONE]</strong>.</p>
        </>
      ),
    },
    {
      id: "tracking",
      title: "4. Suivi de commande",
      content: (
        <p>Des l&apos;expedition, nous vous enverrons un email de confirmation avec un lien de suivi.</p>
      ),
    },
    {
      id: "customs",
      title: "5. Douane et taxes",
      content: (
        <p>Les commandes internationales peuvent etre soumises a des droits de douane, taxes ou frais d&apos;importation. Ces frais sont a la charge du client.</p>
      ),
    },
    {
      id: "issues",
      title: "6. Retards et colis perdus",
      content: (
        <>
          <p>Malgre tous nos efforts, des retards peuvent survenir. Nous ne sommes pas responsables des retards causes par le transporteur.</p>
          <p>Si votre colis semble perdu (non livre <strong>[X jours]</strong> apres la date estimee), contactez-nous immediatement.</p>
        </>
      ),
    },
    {
      id: "wrong-address",
      title: "7. Adresse incorrecte",
      content: (
        <p>Verifiez votre adresse de livraison au moment du paiement. Nous ne sommes pas responsables des colis livres a des adresses incorrectes fournies par le client.</p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 lg:pt-24">
        <LegalPageLayout
          title={isFr ? "Politique de livraison" : "Shipping Policy"}
          subtitle={isFr ? "Delais, frais et zones de livraison." : "Delivery times, fees, and available regions."}
          lastUpdated="January 1, 2026"
          sections={isFr ? frSections : enSections}
        />
      </div>
      <Footer />
    </main>
  );
}
