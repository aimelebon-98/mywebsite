import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalPageLayout from "@/components/LegalPageLayout";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - SoleVault",
  description: "Learn how SoleVault collects, uses, and protects your personal information.",
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isFr = locale === "fr";

  const enSections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <>
          <p>SoleVault (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you visit <strong>[YOUR WEBSITE URL]</strong> or make a purchase from us.</p>
          <p>By using our website, you agree to the terms of this policy.</p>
        </>
      ),
    },
    {
      id: "data-collected",
      title: "2. Information We Collect",
      content: (
        <>
          <p>We collect the following categories of data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity data:</strong> name, email address, phone number.</li>
            <li><strong>Order data:</strong> shipping address, items purchased, order history.</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, pages visited.</li>
            <li><strong>Marketing data:</strong> your preferences in receiving marketing from us.</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      content: (
        <>
          <p>We use your data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate about your purchases and account</li>
            <li>Send marketing emails (only if you opted in)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </>
      ),
    },
    {
      id: "cookies",
      title: "4. Cookies &amp; Tracking",
      content: (
        <>
          <p>We use cookies to remember your preferences, keep you logged in, and analyze site usage. You can manage your cookie preferences at any time through our cookie banner or your browser settings.</p>
          <p>Types of cookies we use:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Necessary:</strong> required for the site to function (cart, session).</li>
            <li><strong>Analytics:</strong> help us understand how visitors use the site.</li>
            <li><strong>Marketing:</strong> used to show relevant ads (only with your consent).</li>
          </ul>
        </>
      ),
    },
    {
      id: "sharing",
      title: "5. Sharing Your Data",
      content: (
        <>
          <p>We do <strong>not</strong> sell your personal data. We share it only with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Payment processors (to process your payments securely)</li>
            <li>Shipping providers (to deliver your orders)</li>
            <li>Analytics services (in anonymized form)</li>
            <li>Legal authorities (when required by law)</li>
          </ul>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "6. Your Rights (GDPR)",
      content: (
        <>
          <p>If you are in the European Union or the UK, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (right to be forgotten)</li>
            <li>Object to certain uses of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
          <p>To exercise these rights, contact us at <strong>[YOUR EMAIL]</strong>.</p>
        </>
      ),
    },
    {
      id: "security",
      title: "7. Data Security",
      content: (
        <p>We use industry-standard security measures (SSL/HTTPS, encrypted databases, secure payment providers) to protect your data. However, no online system is 100% secure, and we cannot guarantee absolute security.</p>
      ),
    },
    {
      id: "retention",
      title: "8. Data Retention",
      content: (
        <p>We retain personal data only as long as necessary for the purposes described in this policy or as required by law. Order records are typically kept for <strong>[X years]</strong> for accounting and warranty purposes.</p>
      ),
    },
    {
      id: "changes",
      title: "9. Changes to This Policy",
      content: (
        <p>We may update this Privacy Policy from time to time. Any changes will be posted here with a new &quot;Last updated&quot; date. We encourage you to review this page periodically.</p>
      ),
    },
    {
      id: "contact",
      title: "10. Contact Us",
      content: (
        <>
          <p>For any questions about this Privacy Policy, contact:</p>
          <ul className="list-none pl-0 space-y-1">
            <li><strong>Company:</strong> [YOUR COMPANY NAME]</li>
            <li><strong>Email:</strong> [YOUR EMAIL]</li>
            <li><strong>Address:</strong> [YOUR BUSINESS ADDRESS]</li>
          </ul>
        </>
      ),
    },
  ];

  const frSections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <>
          <p>SoleVault (&laquo; nous &raquo;) respecte votre vie privee et s&apos;engage a proteger vos donnees personnelles. Cette Politique de Confidentialite explique comment nous collectons, utilisons et protegeons vos informations lorsque vous visitez <strong>[VOTRE URL]</strong> ou effectuez un achat.</p>
          <p>En utilisant notre site, vous acceptez les termes de cette politique.</p>
        </>
      ),
    },
    {
      id: "data-collected",
      title: "2. Informations que nous collectons",
      content: (
        <>
          <p>Nous collectons les categories de donnees suivantes :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Donnees d&apos;identite :</strong> nom, email, telephone.</li>
            <li><strong>Donnees de commande :</strong> adresse de livraison, articles achetes, historique.</li>
            <li><strong>Donnees techniques :</strong> adresse IP, navigateur, appareil, pages visitees.</li>
            <li><strong>Donnees marketing :</strong> vos preferences en matiere de communication.</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "3. Utilisation de vos informations",
      content: (
        <>
          <p>Nous utilisons vos donnees pour :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Traiter et executer vos commandes</li>
            <li>Communiquer sur vos achats et votre compte</li>
            <li>Envoyer des emails marketing (uniquement avec votre accord)</li>
            <li>Ameliorer notre site et nos services</li>
            <li>Respecter nos obligations legales</li>
          </ul>
        </>
      ),
    },
    {
      id: "cookies",
      title: "4. Cookies et suivi",
      content: (
        <>
          <p>Nous utilisons des cookies pour memoriser vos preferences, vous maintenir connecte et analyser l&apos;utilisation du site. Vous pouvez gerer vos preferences a tout moment via notre banniere de cookies.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Necessaires :</strong> requis pour le fonctionnement du site.</li>
            <li><strong>Analytiques :</strong> nous aident a comprendre l&apos;utilisation.</li>
            <li><strong>Marketing :</strong> pour afficher des publicites pertinentes (avec consentement).</li>
          </ul>
        </>
      ),
    },
    {
      id: "sharing",
      title: "5. Partage de vos donnees",
      content: (
        <>
          <p>Nous ne <strong>vendons pas</strong> vos donnees personnelles. Nous les partageons uniquement avec :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prestataires de paiement (traitement securise)</li>
            <li>Transporteurs (livraison de commandes)</li>
            <li>Services d&apos;analyse (sous forme anonymisee)</li>
            <li>Autorites legales (si la loi l&apos;exige)</li>
          </ul>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "6. Vos droits (RGPD)",
      content: (
        <>
          <p>Si vous etes dans l&apos;Union Europeenne, vous avez le droit de :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceder aux donnees vous concernant</li>
            <li>Demander la rectification de donnees inexactes</li>
            <li>Demander la suppression de vos donnees</li>
            <li>Vous opposer a certains traitements</li>
            <li>Retirer votre consentement a tout moment</li>
            <li>Deposer une plainte aupres d&apos;une autorite de controle (CNIL en France)</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous a <strong>[VOTRE EMAIL]</strong>.</p>
        </>
      ),
    },
    {
      id: "security",
      title: "7. Securite des donnees",
      content: (
        <p>Nous utilisons des mesures de securite standard (SSL/HTTPS, bases de donnees chiffrees, prestataires de paiement securises). Toutefois, aucun systeme n&apos;est 100% sur.</p>
      ),
    },
    {
      id: "retention",
      title: "8. Conservation des donnees",
      content: (
        <p>Nous conservons vos donnees uniquement le temps necessaire aux finalites decrites ou requises par la loi. Les commandes sont generalement conservees <strong>[X annees]</strong>.</p>
      ),
    },
    {
      id: "changes",
      title: "9. Modifications",
      content: (
        <p>Cette politique peut etre mise a jour. Toute modification sera publiee ici avec une nouvelle date. Nous vous encourageons a consulter cette page regulierement.</p>
      ),
    },
    {
      id: "contact",
      title: "10. Nous contacter",
      content: (
        <>
          <p>Pour toute question, contactez :</p>
          <ul className="list-none pl-0 space-y-1">
            <li><strong>Societe :</strong> [NOM DE LA SOCIETE]</li>
            <li><strong>Email :</strong> [VOTRE EMAIL]</li>
            <li><strong>Adresse :</strong> [VOTRE ADRESSE]</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20 lg:pt-24">
        <LegalPageLayout
          title={isFr ? "Politique de confidentialite" : "Privacy Policy"}
          subtitle={isFr ? "Comment nous protegeons vos donnees personnelles." : "How we collect, use, and protect your personal information."}
          lastUpdated="January 1, 2026"
          sections={isFr ? frSections : enSections}
        />
      </div>
      <Footer />
    </main>
  );
}
