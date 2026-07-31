// Server-side Cloudflare Turnstile verification
// Uses your TURNSTILE_SECRET_KEY env var

export async function verifyTurnstile(token: string, clientIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[Turnstile] Missing TURNSTILE_SECRET_KEY - skipping verification");
    return true; // Fail-open in dev if secret is missing
  }

  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (clientIp) formData.append("remoteip", clientIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) return true;

    console.warn("[Turnstile] Verification failed:", data["error-codes"]);
    return false;
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return false;
  }
}
