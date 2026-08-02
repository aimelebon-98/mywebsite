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
    ? `Bienvenue chez NewDealZone, ${name} !`
    : `Welcome to NewDealZone, ${name}!`;

  const heading = locale === "fr" ? "Bienvenue !" : "Welcome!";
  const message = locale === "fr"
    ? `Merci d'avoir cree un compte chez NewDealZone. Vous pouvez maintenant suivre vos commandes, gerer votre liste de souhaits et bien plus.`
    : `Thanks for creating an account at NewDealZone. You can now track orders, manage your wishlist, and more.`;
  const cta = locale === "fr" ? "Decouvrir la boutique" : "Explore the shop";

  // Build coupon block (if any)
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
      <div style="background: linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="color: rgba(255,255,255,0.85); font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
          ${couponTitle}
        </div>
        <div style="color: white; font-size: 22px; font-weight: 900; margin-bottom: 16px;">
          ${couponSubtitle}
        </div>
        <div style="background: white; border-radius: 8px; padding: 16px; display: inline-block; min-width: 200px;">
          <div style="color: #666; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">${codeLabel}</div>
          <div style="color: #CA3F2E; font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 3px;">${coupon.code}</div>
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 13px; margin-top: 12px;">
          ${useLabel}
        </div>
        ${desc ? `<div style="color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 8px; font-style: italic;">${desc}</div>` : ""}
      </div>
    `;
  }

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">${heading}</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #333;">${locale === "fr" ? "Bonjour" : "Hi"} ${name},</p>
        <p style="color: #555; line-height: 1.6;">${message}</p>
        ${couponBlock}
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
    ? "Commande recue " + order.orderNumber + " - NewDealZone"
    : "Order received " + order.orderNumber + " - NewDealZone";

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
      <div style="background:linear-gradient(135deg,#CA3F2E 0%,#8B2A1E 100%);padding:40px 30px;text-align:center;border-radius:16px 16px 0 0;">
        <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;margin-bottom:12px;line-height:56px;">
          <span style="color:white;font-size:28px;">&#10003;</span>
        </div>
        <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">${t.heading}</h1>
        <div style="color:rgba(255,255,255,0.85);margin-top:8px;font-size:13px;">${t.orderLabel}: <strong style="color:white;font-family:monospace;">${order.orderNumber}</strong></div>
      </div>
      <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none;">
        <p style="font-size:16px;color:#111827;margin:0 0 12px 0;">${t.hi} ${name},</p>
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
      <div style="background:#111827;padding:20px;text-align:center;border-radius:0 0 16px 16px;">
        <div style="color:white;font-weight:800;font-size:14px;">NewDealZone</div>
        <div style="color:#9ca3af;font-size:11px;margin-top:4px;">
          <a href="${SITE_URL}/${locale}" style="color:#9ca3af;text-decoration:none;">${SITE_URL.replace("https://","").replace("http://","")}</a>
        </div>
      </div>
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
