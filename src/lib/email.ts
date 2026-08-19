import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "NewDealZone <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

// ============================================================
// SHARED EMAIL HEADER - styled brand logo
// ============================================================
function brandHeader(): string {
  return `
    <div style="background:linear-gradient(135deg,#CA3F2E 0%,#8B2A1E 100%);padding:32px 30px;text-align:center;border-radius:16px 16px 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="padding-right:12px;vertical-align:middle;">
            <div style="width:44px;height:44px;background:rgba(255,255,255,0.18);border-radius:12px;display:inline-block;text-align:center;line-height:44px;">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
                <path d="M12.5 2H4a2 2 0 00-2 2v8.5a2 2 0 00.59 1.41l8.5 8.5a2 2 0 002.82 0l8.5-8.5a2 2 0 000-2.82L13.91 2.59A2 2 0 0012.5 2z" fill="white"/>
                <circle cx="7.5" cy="7.5" r="1.6" fill="#CA3F2E"/>
              </svg>
            </div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-weight:900;font-size:22px;letter-spacing:-0.02em;line-height:1;">
              <span style="color:white;">NewDeal</span>
              <span style="color:rgba(255,255,255,0.4);font-weight:300;margin:0 4px;">|</span>
              <span style="color:white;letter-spacing:0.15em;font-size:18px;">ZONE</span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function brandFooter(locale: "en" | "fr"): string {
  const site = SITE_URL.replace("https://","").replace("http://","");
  const tagline = locale === "fr" ? "Chaussures premium pour toutes les occasions" : "Premium footwear for every occasion";
  return `
    <div style="background:#111827;padding:24px;text-align:center;border-radius:0 0 16px 16px;">
      <div style="font-family:-apple-system,sans-serif;font-weight:900;font-size:14px;letter-spacing:-0.02em;line-height:1;">
        <span style="color:white;">NewDeal</span>
        <span style="color:rgba(255,255,255,0.35);font-weight:300;margin:0 3px;">|</span>
        <span style="color:#CA3F2E;letter-spacing:0.15em;font-size:12px;">ZONE</span>
      </div>
      <div style="color:#9ca3af;font-size:11px;margin-top:6px;">${tagline}</div>
      <div style="color:#6b7280;font-size:11px;margin-top:8px;">
        <a href="${SITE_URL}/${locale}" style="color:#9ca3af;text-decoration:none;">${site}</a>
      </div>
    </div>
  `;
}

// ============================================================
// PASSWORD RESET
// ============================================================
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
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <p style="font-size:16px;color:#333;margin:0 0 12px 0;">${greeting},</p>
        <p style="color:#555;line-height:1.6;margin:0 0 24px 0;">${intro}</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;">${buttonText}</a>
        </div>
        <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">${expiry}</p>
        <p style="color:#aaa;font-size:12px;margin-top:20px;word-break:break-all;">${resetUrl}</p>
      </div>
      ${brandFooter(locale)}
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

// ============================================================
// WELCOME EMAIL (with optional welcome coupon)
// ============================================================
export interface WelcomeCoupon {
  code: string;
  type: string;
  value: string | number;
  description?: string | null;
  descriptionFr?: string | null;
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  locale: "en" | "fr" = "en",
  coupon?: WelcomeCoupon | null
): Promise<boolean> {
  if (!resend) return false;

  const subject = locale === "fr"
    ? `Bienvenue ${name} !`
    : `Welcome, ${name}!`;

  const heading = locale === "fr" ? "Bienvenue !" : "Welcome!";
  const message = locale === "fr"
    ? "Merci d'avoir cree un compte. Vous pouvez maintenant suivre vos commandes, gerer votre liste de souhaits et bien plus."
    : "Thanks for creating an account. You can now track orders, manage your wishlist, and more.";
  const cta = locale === "fr" ? "Decouvrir la boutique" : "Explore the shop";

  let couponBlock = "";
  if (coupon && coupon.code) {
    const value = typeof coupon.value === "string" ? parseFloat(coupon.value) : coupon.value;
    const valueLabel = coupon.type === "percent" ? `${value}%` : `$${value.toFixed(2)}`;
    const couponTitle = locale === "fr" ? "Votre cadeau de bienvenue" : "Your welcome gift";
    const couponSubtitle = locale === "fr"
      ? `${valueLabel} de reduction sur votre premiere commande`
      : `${valueLabel} off your first order`;
    const codeLabel = locale === "fr" ? "Code" : "Code";
    const useLabel = locale === "fr" ? "Utilisez ce code au panier" : "Use this code at checkout";
    const desc = locale === "fr" && coupon.descriptionFr ? coupon.descriptionFr : coupon.description || "";

    couponBlock = `
      <div style="background:linear-gradient(135deg,#CA3F2E 0%,#8B2A1E 100%);border-radius:14px;padding:24px;margin:24px 0;text-align:center;">
        <div style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${couponTitle}</div>
        <div style="color:white;font-size:20px;font-weight:900;margin-bottom:16px;">${couponSubtitle}</div>
        <div style="background:white;border-radius:10px;padding:16px;display:inline-block;min-width:200px;">
          <div style="color:#666;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">${codeLabel}</div>
          <div style="color:#CA3F2E;font-family:monospace;font-size:26px;font-weight:900;letter-spacing:3px;">${coupon.code}</div>
        </div>
        <div style="color:rgba(255,255,255,0.9);font-size:13px;margin-top:12px;">${useLabel}</div>
        ${desc ? `<div style="color:rgba(255,255,255,0.75);font-size:12px;margin-top:8px;font-style:italic;">${desc}</div>` : ""}
      </div>
    `;
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <h1 style="color:#111827;margin:0 0 12px 0;font-size:24px;">${heading}</h1>
        <p style="font-size:16px;color:#333;margin:0 0 12px 0;">${locale === "fr" ? "Bonjour" : "Hi"} ${name},</p>
        <p style="color:#555;line-height:1.6;margin:0 0 12px 0;">${message}</p>
        ${couponBlock}
        <div style="text-align:center;margin:30px 0;">
          <a href="${SITE_URL}/${locale}/shop" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;">${cta}</a>
        </div>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch { return false; }
}

// ============================================================
// ORDER CONFIRMATION
// ============================================================
export interface OrderEmailData {
  orderNumber: string;
  items: Array<{
    name?: string;
    size?: string;
    color?: string;
    quantity?: number;
    price?: number;
    imageUrl?: string;
    subtotal?: number;
  }>;
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  currency: string;
  customerPhone: string;
  customerAddress: string;
}

function fmt(amount: number, currency: string): string {
  return currency + amount.toFixed(2);
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: OrderEmailData,
  locale: "en" | "fr" = "en"
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping order confirmation");
    return false;
  }

  const subject = locale === "fr"
    ? "Commande recue " + order.orderNumber
    : "Order received " + order.orderNumber;

  const t = locale === "fr" ? {
    heading: "Commande recue !",
    hi: "Bonjour",
    thanks: "Merci pour votre commande. Nous avons bien recu vos details. Notre equipe vous contactera sur WhatsApp pour confirmer et coordonner la livraison.",
    orderLabel: "Numero de commande",
    itemsLabel: "Articles",
    qty: "Qte",
    subtotal: "Sous-total",
    discount: "Remise",
    shipping: "Livraison",
    shippingNote: "Calculee selon votre adresse",
    total: "Total",
    deliveryLabel: "Livraison",
    contactPhone: "Telephone",
    address: "Adresse",
    trackOrder: "Suivre ma commande",
    footer: "Une question ? Repondez a cet email ou contactez-nous sur WhatsApp.",
  } : {
    heading: "Order received!",
    hi: "Hi",
    thanks: "Thanks for your order. We have received all the details. Our team will contact you on WhatsApp to confirm and coordinate delivery.",
    orderLabel: "Order number",
    itemsLabel: "Items",
    qty: "Qty",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    shippingNote: "Calculated based on your address",
    total: "Total",
    deliveryLabel: "Delivery",
    contactPhone: "Phone",
    address: "Address",
    trackOrder: "Track my order",
    footer: "Any questions? Reply to this email or reach us on WhatsApp.",
  };

  const itemsHtml = order.items.map(it => {
    const subtotal = it.subtotal || ((it.price || 0) * (it.quantity || 1));
    const img = it.imageUrl ? `<img src="${it.imageUrl}" width="56" height="56" style="border-radius:8px;object-fit:cover;" />` : `<div style="width:56px;height:56px;background:#f3f4f6;border-radius:8px;"></div>`;
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">${img}</td>
        <td style="padding:12px 12px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
          <div style="font-weight:600;color:#111827;font-size:14px;">${it.name || ""}</div>
          <div style="color:#6b7280;font-size:12px;margin-top:2px;">
            ${it.size ? "Size: " + it.size : ""}${it.size && it.color ? " - " : ""}${it.color ? "Color: " + it.color : ""}
          </div>
          <div style="color:#6b7280;font-size:12px;margin-top:2px;">${t.qty}: ${it.quantity || 1}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:top;">
          <div style="font-weight:700;color:#111827;font-size:14px;">${fmt(subtotal, order.currency)}</div>
        </td>
      </tr>
    `;
  }).join("");

  const discountRow = order.discountAmount > 0 ? `
    <tr>
      <td style="padding:6px 0;color:#059669;font-size:14px;">
        ${t.discount}${order.discountCode ? " (" + order.discountCode + ")" : ""}
      </td>
      <td style="padding:6px 0;color:#059669;font-size:14px;text-align:right;font-weight:600;">
        -${fmt(order.discountAmount, order.currency)}
      </td>
    </tr>
  ` : "";

  const trackUrl = `${SITE_URL}/${locale}/account/orders`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;width:48px;height:48px;background:#d1fae5;border-radius:50%;line-height:48px;">
            <span style="color:#059669;font-size:24px;">&#10003;</span>
          </div>
          <h1 style="color:#111827;margin:12px 0 4px 0;font-size:24px;">${t.heading}</h1>
          <div style="color:#6b7280;font-size:13px;">${t.orderLabel}: <strong style="color:#111827;font-family:monospace;">${order.orderNumber}</strong></div>
        </div>

        <p style="font-size:15px;color:#333;margin:0 0 12px 0;">${t.hi} ${name},</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 24px 0;">${t.thanks}</p>

        <div style="margin:24px 0;">
          <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">${t.itemsLabel}</div>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
        </div>

        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">${t.subtotal}</td>
            <td style="padding:6px 0;color:#111827;font-size:14px;text-align:right;font-weight:600;">${fmt(order.subtotal, order.currency)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">${t.shipping}</td>
            <td style="padding:6px 0;color:#9ca3af;font-size:12px;text-align:right;font-style:italic;">${t.shippingNote}</td>
          </tr>
          <tr><td colspan="2" style="padding:8px 0 0 0;border-top:2px solid #e5e7eb;"></td></tr>
          <tr>
            <td style="padding:12px 0 0 0;color:#111827;font-size:16px;font-weight:800;">${t.total}</td>
            <td style="padding:12px 0 0 0;color:#CA3F2E;font-size:20px;font-weight:900;text-align:right;">${fmt(order.total, order.currency)}</td>
          </tr>
        </table>

        <div style="margin:28px 0;padding:16px;background:#f9fafb;border-radius:12px;">
          <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${t.deliveryLabel}</div>
          <div style="color:#111827;font-size:13px;line-height:1.6;">
            <div><strong>${t.contactPhone}:</strong> ${order.customerPhone}</div>
            <div style="margin-top:4px;"><strong>${t.address}:</strong> ${order.customerAddress}</div>
          </div>
        </div>

        <div style="text-align:center;margin:32px 0 16px 0;">
          <a href="${trackUrl}" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;font-size:14px;">${t.trackOrder}</a>
        </div>

        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:24px 0 0 0;line-height:1.6;">${t.footer}</p>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Order confirmation send failed:", err);
    return false;
  }
}


// ============================================================
// VENDOR: APPLICATION RECEIVED (auto reply after submission)
// ============================================================
export async function sendVendorApplicationReceivedEmail(
  to: string,
  applicantName: string,
  storeName: string,
  locale: "en" | "fr" = "en"
): Promise<boolean> {
  if (!resend) return false;

  const subject = locale === "fr"
    ? "Candidature vendeur recue - NewDealZone"
    : "Vendor application received - NewDealZone";

  const t = locale === "fr" ? {
    heading: "Candidature recue !",
    hi: "Bonjour",
    intro1: `Merci d'avoir postule pour devenir vendeur sur NewDealZone avec votre boutique <strong>${storeName}</strong>.`,
    intro2: "Notre equipe examinera votre candidature sous 24 a 48 heures. Vous recevrez un email des qu'une decision sera prise.",
    while: "En attendant :",
    tip1: "Preparez vos meilleures photos produits (haute qualite)",
    tip2: "Rassemblez vos coordonnees bancaires pour les paiements",
    tip3: "Reflechissez a vos prix et politiques d'expedition",
    thanks: "Merci de vouloir rejoindre NewDealZone !",
  } : {
    heading: "Application received!",
    hi: "Hi",
    intro1: `Thank you for applying to become a vendor on NewDealZone with your store <strong>${storeName}</strong>.`,
    intro2: "Our team will review your application within 24 to 48 hours. You will receive an email as soon as a decision is made.",
    while: "In the meantime:",
    tip1: "Prepare your best product photos (high quality)",
    tip2: "Gather your bank details for payouts",
    tip3: "Think about your pricing and shipping policies",
    thanks: "Thank you for wanting to join NewDealZone!",
  };

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;width:48px;height:48px;background:#fef3c7;border-radius:50%;line-height:48px;">
            <span style="color:#d97706;font-size:22px;">&#8987;</span>
          </div>
          <h1 style="color:#111827;margin:12px 0 4px 0;font-size:22px;">${t.heading}</h1>
        </div>
        <p style="font-size:15px;color:#333;margin:0 0 12px 0;">${t.hi} ${applicantName},</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 16px 0;">${t.intro1}</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 20px 0;">${t.intro2}</p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:20px 0;">
          <div style="font-weight:700;color:#111827;font-size:14px;margin-bottom:8px;">${t.while}</div>
          <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:13px;line-height:1.8;">
            <li>${t.tip1}</li>
            <li>${t.tip2}</li>
            <li>${t.tip3}</li>
          </ul>
        </div>
        <p style="color:#6b7280;font-size:13px;text-align:center;margin-top:24px;">${t.thanks}</p>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Vendor application email failed:", err);
    return false;
  }
}

// ============================================================
// VENDOR: APPLICATION APPROVED (with login credentials)
// ============================================================
export async function sendVendorApprovedEmail(
  to: string,
  applicantName: string,
  storeName: string,
  tempPassword: string,
  locale: "en" | "fr" = "en"
): Promise<boolean> {
  if (!resend) return false;

  const subject = locale === "fr"
    ? "Votre boutique est approuvee - NewDealZone"
    : "Your store is approved - NewDealZone";

  const loginUrl = `${SITE_URL}/${locale}/vendor/login`;

  const t = locale === "fr" ? {
    heading: "Felicitations, vous etes vendeur !",
    hi: "Bonjour",
    intro: `Votre boutique <strong>${storeName}</strong> a ete approuvee. Vous pouvez maintenant vous connecter et commencer a vendre.`,
    credsTitle: "Vos identifiants de connexion",
    emailLabel: "Email",
    passwordLabel: "Mot de passe temporaire",
    changePassword: "Changez votre mot de passe apres la premiere connexion.",
    nextSteps: "Prochaines etapes",
    step1: "Connectez-vous a votre tableau de bord vendeur",
    step2: "Completez votre profil (logo, banniere, coordonnees bancaires)",
    step3: "Ajoutez vos premiers produits (validation admin sous 24h)",
    step4: "Commencez a recevoir des commandes",
    cta: "Se connecter au tableau de bord",
  } : {
    heading: "Congratulations, you are a vendor!",
    hi: "Hi",
    intro: `Your store <strong>${storeName}</strong> has been approved. You can now log in and start selling.`,
    credsTitle: "Your login credentials",
    emailLabel: "Email",
    passwordLabel: "Temporary password",
    changePassword: "Change your password after your first login.",
    nextSteps: "Next steps",
    step1: "Log in to your vendor dashboard",
    step2: "Complete your profile (logo, banner, bank details)",
    step3: "Add your first products (admin approval within 24h)",
    step4: "Start receiving orders",
    cta: "Log in to dashboard",
  };

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;width:48px;height:48px;background:#d1fae5;border-radius:50%;line-height:48px;">
            <span style="color:#059669;font-size:24px;">&#10003;</span>
          </div>
          <h1 style="color:#111827;margin:12px 0 4px 0;font-size:22px;">${t.heading}</h1>
        </div>
        <p style="font-size:15px;color:#333;margin:0 0 12px 0;">${t.hi} ${applicantName},</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 20px 0;">${t.intro}</p>

        <div style="background:linear-gradient(135deg,#CA3F2E 0%,#8B2A1E 100%);border-radius:12px;padding:20px;margin:20px 0;color:white;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">${t.credsTitle}</div>
          <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px;margin-bottom:8px;">
            <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">${t.emailLabel}</div>
            <div style="font-family:monospace;font-size:14px;margin-top:4px;color:#ffffff;"><a href="mailto:${to}" style="color:#ffffff !important;text-decoration:none !important;">${to}</a></div>
          </div>
          <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px;">
            <div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">${t.passwordLabel}</div>
            <div style="font-family:monospace;font-size:16px;margin-top:4px;font-weight:700;letter-spacing:2px;">${tempPassword}</div>
          </div>
          <div style="font-size:11px;margin-top:12px;opacity:0.85;">${t.changePassword}</div>
        </div>

        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:20px 0;">
          <div style="font-weight:700;color:#111827;font-size:14px;margin-bottom:8px;">${t.nextSteps}</div>
          <ol style="margin:0;padding-left:20px;color:#4b5563;font-size:13px;line-height:1.8;">
            <li>${t.step1}</li>
            <li>${t.step2}</li>
            <li>${t.step3}</li>
            <li>${t.step4}</li>
          </ol>
        </div>

        <div style="text-align:center;margin:28px 0;">
          <a href="${loginUrl}" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;font-size:14px;">${t.cta}</a>
        </div>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Vendor approved email failed:", err);
    return false;
  }
}

// ============================================================
// VENDOR: APPLICATION REJECTED
// ============================================================
export async function sendVendorRejectedEmail(
  to: string,
  applicantName: string,
  reason: string,
  locale: "en" | "fr" = "en"
): Promise<boolean> {
  if (!resend) return false;

  const subject = locale === "fr"
    ? "Candidature vendeur - Mise a jour"
    : "Vendor application - Update";

  const t = locale === "fr" ? {
    heading: "Candidature examinee",
    hi: "Bonjour",
    intro: "Merci pour votre interet pour NewDealZone. Apres examen, nous ne pouvons pas approuver votre candidature pour le moment.",
    reasonLabel: "Raison :",
    encourage: "Vous pouvez postuler a nouveau apres avoir aborde les points ci-dessus. Nous serions ravis de vous revoir.",
  } : {
    heading: "Application reviewed",
    hi: "Hi",
    intro: "Thank you for your interest in NewDealZone. After review, we are unable to approve your application at this time.",
    reasonLabel: "Reason:",
    encourage: "You are welcome to reapply after addressing the points above. We would love to hear from you again.",
  };

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <h1 style="color:#111827;margin:0 0 12px 0;font-size:22px;">${t.heading}</h1>
        <p style="font-size:15px;color:#333;margin:0 0 12px 0;">${t.hi} ${applicantName},</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 16px 0;">${t.intro}</p>
        ${reason ? `
          <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:14px;margin:16px 0;">
            <div style="font-weight:700;color:#991b1b;font-size:13px;margin-bottom:6px;">${t.reasonLabel}</div>
            <div style="color:#4b5563;font-size:13px;line-height:1.6;">${reason}</div>
          </div>
        ` : ""}
        <p style="color:#4b5563;line-height:1.6;margin:16px 0 0 0;">${t.encourage}</p>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Vendor rejected email failed:", err);
    return false;
  }
}

// ============================================================
// VENDOR: PRODUCT APPROVED / REJECTED
// ============================================================
export async function sendVendorProductStatusEmail(
  to: string,
  vendorName: string,
  productName: string,
  approved: boolean,
  note: string,
  locale: "en" | "fr" = "en"
): Promise<boolean> {
  if (!resend) return false;

  const subject = approved
    ? (locale === "fr" ? `Produit approuve : ${productName}` : `Product approved: ${productName}`)
    : (locale === "fr" ? `Produit non approuve : ${productName}` : `Product not approved: ${productName}`);

  const dashboardUrl = `${SITE_URL}/${locale}/vendor/products`;

  const t = locale === "fr" ? {
    hi: "Bonjour",
    approvedHead: "Votre produit est en ligne !",
    rejectedHead: "Produit necessite des modifications",
    approvedMsg: `Votre produit <strong>${productName}</strong> a ete approuve et est maintenant visible sur NewDealZone.`,
    rejectedMsg: `Votre produit <strong>${productName}</strong> n'a pas ete approuve. Veuillez consulter les commentaires ci-dessous et le soumettre a nouveau.`,
    noteLabel: "Note admin :",
    cta: "Voir mes produits",
  } : {
    hi: "Hi",
    approvedHead: "Your product is live!",
    rejectedHead: "Product needs updates",
    approvedMsg: `Your product <strong>${productName}</strong> has been approved and is now visible on NewDealZone.`,
    rejectedMsg: `Your product <strong>${productName}</strong> was not approved. Please review the feedback below and resubmit.`,
    noteLabel: "Admin note:",
    cta: "View my products",
  };

  const icon = approved ? "&#10003;" : "&#9888;";
  const iconBg = approved ? "#d1fae5" : "#fef3c7";
  const iconColor = approved ? "#059669" : "#d97706";
  const heading = approved ? t.approvedHead : t.rejectedHead;
  const message = approved ? t.approvedMsg : t.rejectedMsg;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;width:48px;height:48px;background:${iconBg};border-radius:50%;line-height:48px;">
            <span style="color:${iconColor};font-size:22px;">${icon}</span>
          </div>
          <h1 style="color:#111827;margin:12px 0 4px 0;font-size:22px;">${heading}</h1>
        </div>
        <p style="font-size:15px;color:#333;margin:0 0 12px 0;">${t.hi} ${vendorName},</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 16px 0;">${message}</p>
        ${note ? `
          <div style="background:#f9fafb;border-left:4px solid #CA3F2E;border-radius:8px;padding:14px;margin:16px 0;">
            <div style="font-weight:700;color:#111827;font-size:13px;margin-bottom:6px;">${t.noteLabel}</div>
            <div style="color:#4b5563;font-size:13px;line-height:1.6;">${note}</div>
          </div>
        ` : ""}
        <div style="text-align:center;margin:28px 0;">
          <a href="${dashboardUrl}" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;font-size:14px;">${t.cta}</a>
        </div>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Vendor product status email failed:", err);
    return false;
  }
}

// ============================================================
// VENDOR: PAYOUT PROCESSED
// ============================================================
export async function sendVendorPayoutProcessedEmail(
  to: string,
  vendorName: string,
  amount: string,
  currency: string,
  reference: string,
  locale: "en" | "fr" = "en"
): Promise<boolean> {
  if (!resend) return false;

  const subject = locale === "fr"
    ? `Paiement envoye : ${amount} ${currency}`
    : `Payout sent: ${amount} ${currency}`;

  const t = locale === "fr" ? {
    heading: "Paiement envoye !",
    hi: "Bonjour",
    intro: `Votre paiement de <strong>${amount} ${currency}</strong> a ete traite et envoye a votre compte bancaire.`,
    refLabel: "Reference de transaction :",
    thanks: "Merci de vendre avec NewDealZone !",
    cta: "Voir mes gains",
  } : {
    heading: "Payout sent!",
    hi: "Hi",
    intro: `Your payout of <strong>${amount} ${currency}</strong> has been processed and sent to your bank account.`,
    refLabel: "Transaction reference:",
    thanks: "Thank you for selling with NewDealZone!",
    cta: "View earnings",
  };

  const earningsUrl = `${SITE_URL}/${locale}/vendor/earnings`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;width:48px;height:48px;background:#d1fae5;border-radius:50%;line-height:48px;">
            <span style="color:#059669;font-size:24px;">&#128176;</span>
          </div>
          <h1 style="color:#111827;margin:12px 0 4px 0;font-size:22px;">${t.heading}</h1>
        </div>
        <p style="font-size:15px;color:#333;margin:0 0 12px 0;">${t.hi} ${vendorName},</p>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 16px 0;">${t.intro}</p>
        ${reference ? `
          <div style="background:#f9fafb;border-radius:8px;padding:14px;margin:16px 0;">
            <div style="font-weight:700;color:#111827;font-size:13px;margin-bottom:6px;">${t.refLabel}</div>
            <div style="color:#4b5563;font-family:monospace;font-size:14px;">${reference}</div>
          </div>
        ` : ""}
        <p style="color:#4b5563;line-height:1.6;margin:16px 0 0 0;">${t.thanks}</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${earningsUrl}" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;font-size:14px;">${t.cta}</a>
        </div>
      </div>
      ${brandFooter(locale)}
    </div>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Payout email failed:", err);
    return false;
  }
}

// ============================================================
// ADMIN: NEW VENDOR APPLICATION ALERT
// ============================================================
export interface VendorApplicationSummary {
  applicantName: string;
  email: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  country: string;
  city: string;
  categories: string[];
  instagramUrl?: string;
  websiteUrl?: string;
}

export async function sendAdminNewVendorApplicationEmail(
  adminEmail: string,
  app: VendorApplicationSummary
): Promise<boolean> {
  if (!resend) {
    console.warn("[Email] Admin notification skipped - RESEND_API_KEY not configured");
    return false;
  }

  const subject = `New vendor application: ${app.storeName}`;
  const adminUrl = `${SITE_URL}/admin`;

  const catsHtml = app.categories.length > 0
    ? app.categories.map(c => `<span style="display:inline-block;background:#f3f4f6;color:#374151;font-size:12px;padding:3px 8px;border-radius:6px;margin:2px;">${c}</span>`).join("")
    : `<span style="color:#9ca3af;font-size:12px;">None specified</span>`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:20px;background:#f9fafb;">
      ${brandHeader()}
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;width:48px;height:48px;background:#fef3c7;border-radius:50%;line-height:48px;">
            <span style="color:#d97706;font-size:24px;">&#128188;</span>
          </div>
          <h1 style="color:#111827;margin:12px 0 4px 0;font-size:22px;">New Vendor Application</h1>
          <p style="color:#6b7280;font-size:13px;margin:0;">A new vendor wants to join NewDealZone</p>
        </div>

        <div style="background:linear-gradient(135deg,#CA3F2E 0%,#8B2A1E 100%);border-radius:12px;padding:20px;margin:20px 0;color:white;">
          <div style="font-size:11px;font-weight:700;opacity:0.85;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Store</div>
          <div style="font-size:22px;font-weight:900;margin-bottom:6px;">${app.storeName}</div>
          <div style="font-size:13px;opacity:0.95;">by ${app.applicantName}</div>
        </div>

        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;width:120px;">Email</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;word-break:break-all;">${app.email}</td>
          </tr>
          ${app.phone ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Phone</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;">${app.phone}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Location</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;">${app.city}${app.city ? ", " : ""}${app.country}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;vertical-align:top;">Categories</td>
            <td style="padding:8px 0;">${catsHtml}</td>
          </tr>
          ${app.instagramUrl ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Instagram</td>
            <td style="padding:8px 0;"><a href="${app.instagramUrl}" style="color:#CA3F2E;font-size:13px;word-break:break-all;">${app.instagramUrl}</a></td>
          </tr>` : ""}
          ${app.websiteUrl ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Website</td>
            <td style="padding:8px 0;"><a href="${app.websiteUrl}" style="color:#CA3F2E;font-size:13px;word-break:break-all;">${app.websiteUrl}</a></td>
          </tr>` : ""}
        </table>

        ${app.storeDescription ? `
          <div style="background:#f9fafb;border-radius:10px;padding:14px;margin-top:16px;">
            <div style="font-weight:700;color:#374151;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">About</div>
            <div style="color:#4b5563;font-size:13px;line-height:1.6;">${app.storeDescription}</div>
          </div>
        ` : ""}

        <div style="text-align:center;margin:28px 0 12px 0;">
          <a href="${adminUrl}" style="background:#CA3F2E;color:white;padding:14px 32px;text-decoration:none;border-radius:10px;display:inline-block;font-weight:700;font-size:14px;">Review in Admin Panel</a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">Open the Vendor Applications tab to approve or reject.</p>
      </div>
      ${brandFooter("en")}
    </div>
  `;

  try {
    const result = await resend.emails.send({ from: FROM, to: adminEmail, subject, html });
    if (result.error) {
      console.error("[Email] Admin notification Resend error:", result.error);
      return false;
    }
    console.log("[Email] Admin notification sent, id:", result.data?.id);
    return true;
  } catch (err) {
    console.error("[Email] Admin notification exception:", err);
    return false;
  }
}