import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error(
      "ENCRYPTION_KEY env var must be set to a 32+ character string. " +
      "Generate one with: node -e \"console.log(crypto.randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(key.slice(0, 32), "utf-8");
}

/**
 * Encrypt a plaintext string.
 * Returns: iv:tag:encrypted (all hex-encoded).
 *
 * Usage:
 *   const encrypted = encrypt(vendor.bankAccount);
 *   // Store `encrypted` in DB
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string.
 * Input format: iv:tag:encrypted (hex-encoded).
 *
 * Usage:
 *   const bankAccount = decrypt(vendor.bankAccount);
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  // If it doesn't look encrypted (no colons), return as-is (migration safety)
  if (!encryptedText.includes(":")) return encryptedText;

  const parts = encryptedText.split(":");
  if (parts.length !== 3) return encryptedText;

  const [ivHex, tagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Check if a string appears to be encrypted.
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 3 && parts[0].length === 32 && parts[1].length === 32;
}