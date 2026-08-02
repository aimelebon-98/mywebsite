import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "NewDealZone <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

export async function sendPasswordResetEmail(to: string, name: string, token: string, locale: "en" | "fr" = "en"): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured");
    return false;
  }

  const resetUrl = `${SITE_URL}/${locale}/account/reset-password?token=${token}`;

  const subject = locale === "fr"
    ? "Reinitialiser votre mot de passe - NewDealZone"
    : "Reset your password - NewDealZone";

  const greeting = locale === "fr" ? `Bonjour ${name || ""}` : `Hi ${name || "there"}`;
  const intro = locale === "fr"
    ? "Vous avez demande a reinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :"
    : "You requested a password reset. Click the button below to continue:";
  const buttonText = locale === "fr" ? "Reinitialiser mon mot de passe" : "Reset my password";
  const expiry = locale === "fr"
    ? "Ce lien expire dans 1 heure. Si vous n'avez pas demande cela, ignorez cet email."
    : "This link expires in 1 hour. If you didn't request this, ignore this email.";

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="background: #CA3F2E; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">NewDealZone</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #333;">${greeting},</p>
        <p style="color: #555; line-height: 1.6;">${intro}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #CA3F2E; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">${buttonText}</a>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.6;">${expiry}</p>
        <p style="color: #aaa; font-size: 12px; margin-top: 20px; word-break: break-all;">${resetUrl}</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return false;
  }
}

export async function sendWelcomeEmail(to: string, name: string, locale: "en" | "fr" = "en"): Promise<boolean> {
  if (!resend) return false;

  const subject = locale === "fr"
    ? `Bienvenue chez NewDealZone, ${name} !`
    : `Welcome to NewDealZone, ${name}!`;

  const heading = locale === "fr" ? "Bienvenue !" : "Welcome!";
  const message = locale === "fr"
    ? `Merci d'avoir cree un compte chez NewDealZone. Vous pouvez maintenant suivre vos commandes, gerer votre liste de souhaits et bien plus.`
    : `Thanks for creating an account at NewDealZone. You can now track orders, manage your wishlist, and more.`;
  const cta = locale === "fr" ? "Decouvrir la boutique" : "Explore the shop";

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">${heading}</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #333;">${locale === "fr" ? "Bonjour" : "Hi"} ${name},</p>
        <p style="color: #555; line-height: 1.6;">${message}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/${locale}/shop" style="background: #CA3F2E; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">${cta}</a>
        </div>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch { return false; }
}
