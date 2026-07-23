import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageLayout from "@/components/LegalPageLayout";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds - SoleVault",
  description: "Our returns and refunds policy for SoleVault orders.",
  robots: { index: true, follow: true },
};

export default async function ReturnsPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  const enSections = [
    {
      id: "window",
      title: "1. Return Window",
      content: (
        <p>You may return most items within <strong>[X days]</strong> of receiving your order for a full refund or exchange. Items must be unworn, unwashed, and in their original packaging with all tags attached.</p>
      ),
    },
    {
      id: "non-returnable",
      title: "2. Non-Returnable Items",
      content: (
        <>
          <p>The following items cannot be returned:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Worn or used footwear</li>
            <li>Items marked as final sale</li>
            <li>Custom or personalized products</li>
            <li>Gift cards</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-to-return",
      title: "3. How to Return an Item",
      content: (
        <>
          <p>To initiate a return:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact us at <strong>[YOUR EMAIL]</strong> with your order number and reason for return.</li>
            <li>We&apos;ll send you a return shipping label and instructions.</li>
            <li>Pack the item securely in its original packaging.</li>
            <li>Drop off the package at the designated carrier location.</li>
            <li>Once we receive and inspect the return, we&apos;ll process your refund within <strong>[X business days]</strong>.</li>
          </ol>
        </>
      ),
    },
    {
      id: "refunds",
      title: "4. Refunds",
      content: (
        <>
          <p>Refunds will be issued to the original payment method. Please note:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Original shipping fees are non-refundable (unless the return is due to our error).</li>
            <li>Refunds typically appear in your account within <strong>5-10 business days</strong> after processing.</li>
            <li>You will receive an email confirmation once your refund is issued.</li>
          </ul>
        </>
      ),
    },
    {
      id: "exchanges",
      title: "5. Exchanges",
      content: (
        <p>Need a different size or color? We&apos;re happy to exchange your item within the return window. Contact us at <strong>[YOUR EMAIL]</strong> and we&apos;ll guide you through the process. Exchanges are subject to product availability.</p>
      ),
    },
    {
      id: "damaged",
      title: "6. Damaged or Defective Items",
      content: (
        <p>If your item arrives damaged or defective, contact us within <strong>[X days]</strong> of receipt with photos of the damage. We&apos;ll offer a full refund, replacement, or store credit at no cost to you.</p>
      ),
    },
    {
      id: "return-shipping",
      title: "7. Return Shipping Costs",
      content: (
        <>
          <p>Return shipping costs are:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free:</strong> if the return is due to our error (wrong item, damaged, defective).</li>
            <li><strong>Customer&apos;s responsibility:</strong> for change-of-mind returns.</li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "8. Contact",
      content: (
        <p>Questions about a return? Reach out to <strong>[YOUR EMAIL]</strong> and we&apos;ll be happy to help.</p>
      ),
    },
  ];

  const frSections = [
    {
      id: "window",
      title: "1. Delai de retour",
      content: (
        <p>Vous pouvez retourner la plupart des articles dans les <strong>[X jours]</strong> suivant la reception de votre commande pour un remboursement ou un echange. Les articles doivent etre non portes, non laves et dans leur emballage d&apos;origine avec toutes les etiquettes.</p>
      ),
    },
    {
      id: "non-returnable",
      title: "2. Articles non retournables",
      content: (
        <>
          <p>Les articles suivants ne peuvent pas etre retournes :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Chaussures portees ou utilisees</li>
            <li>Articles en solde final</li>
            <li>Produits personnalises</li>
            <li>Cartes cadeaux</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-to-return",
      title: "3. Comment retourner un article",
      content: (
        <>
          <p>Pour initier un retour :</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contactez-nous a <strong>[VOTRE EMAIL]</strong> avec votre numero de commande.</li>
            <li>Nous vous enverrons une etiquette de retour et les instructions.</li>
            <li>Emballez l&apos;article dans son emballage d&apos;origine.</li>
            <li>Deposez le colis au point de collecte designe.</li>
            <li>Apres reception et inspection, nous traiterons votre remboursement sous <strong>[X jours ouvrables]</strong>.</li>
          </ol>
        </>
      ),
    },
    {
      id: "refunds",
      title: "4. Remboursements",
      content: (
        <>
          <p>Les remboursements seront effectues sur le mode de paiement d&apos;origine.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Les frais de livraison d&apos;origine ne sont pas remboursables (sauf en cas d&apos;erreur de notre part).</li>
            <li>Les remboursements apparaissent generalement sous <strong>5-10 jours ouvrables</strong>.</li>
            <li>Vous recevrez une confirmation par email.</li>
          </ul>
        </>
      ),
    },
    {
      id: "exchanges",
      title: "5. Echanges",
      content: (
        <p>Besoin d&apos;une autre taille ou couleur ? Contactez-nous a <strong>[VOTRE EMAIL]</strong>. Les echanges sont soumis a la disponibilite des stocks.</p>
      ),
    },
    {
      id: "damaged",
      title: "6. Articles endommages ou defectueux",
      content: (
        <p>Si votre article arrive endommage ou defectueux, contactez-nous dans les <strong>[X jours]</strong> suivant la reception avec des photos. Nous vous offrirons un remboursement complet, un remplacement ou un avoir.</p>
      ),
    },
    {
      id: "return-shipping",
      title: "7. Frais de retour",
      content: (
        <>
          <p>Les frais de retour sont :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Gratuits :</strong> si le retour est du a une erreur de notre part.</li>
            <li><strong>A la charge du client :</strong> pour les retours de changement d&apos;avis.</li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "8. Contact",
      content: (
        <p>Questions sur un retour ? Contactez <strong>[VOTRE EMAIL]</strong>.</p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 lg:pt-24">
        <LegalPageLayout
          title={isFr ? "Retours et remboursements" : "Returns & Refunds"}
          subtitle={isFr ? "Notre politique de retours et remboursements." : "Our returns and refunds policy."}
          lastUpdated="January 1, 2026"
          sections={isFr ? frSections : enSections}
        />
      </div>
      <Footer />
    </main>
  );
}
