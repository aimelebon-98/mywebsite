const API_BASE = "https://api.nowpayments.io/v1";

function getApiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY || "";
  if (!key) throw new Error("NOWPAYMENTS_API_KEY is not configured");
  return key;
}

export function isNowPaymentsConfigured(): boolean {
  return Boolean(process.env.NOWPAYMENTS_API_KEY);
}

export async function createNowPayment(input: {
  priceAmount: number; priceCurrency?: string; payCurrency: string;
  orderId: string; orderDescription: string; ipnCallbackUrl: string;
  successUrl?: string; cancelUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": getApiKey() },
    body: JSON.stringify({
      price_amount: input.priceAmount,
      price_currency: (input.priceCurrency || "usd").toLowerCase(),
      pay_currency: input.payCurrency.toLowerCase(),
      order_id: input.orderId,
      order_description: input.orderDescription,
      ipn_callback_url: input.ipnCallbackUrl,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || data?.error || "Failed to create crypto payment");
  return data as {
    payment_id: string | number; payment_status: string; pay_address: string;
    pay_amount: number; pay_currency: string; price_amount: number;
    price_currency: string; order_id: string; expiration_estimate_date?: string;
  };
}

export async function getNowPaymentStatus(paymentId: string) {
  const res = await fetch(`${API_BASE}/payment/${paymentId}`, {
    headers: { "x-api-key": getApiKey() }, cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch payment status");
  return data as {
    payment_id: string | number; payment_status: string; pay_address: string;
    pay_amount: number; pay_currency: string; price_amount: number;
    price_currency: string; actually_paid?: number; outcome_amount?: number; order_id?: string;
  };
}

export function mapNowStatusToLocal(status: string): string {
  const s = (status || "").toLowerCase();
  if (["finished", "confirmed"].includes(s)) return "confirmed";
  if (["partially_paid"].includes(s)) return "partially_paid";
  if (["failed", "expired", "refunded"].includes(s)) return s;
  if (["sending", "confirming"].includes(s)) return "confirming";
  return "waiting";
}

export function isPaidStatus(status: string): boolean {
  return ["finished", "confirmed"].includes((status || "").toLowerCase());
}