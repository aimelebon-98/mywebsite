import { SignJWT, jwtVerify } from "jose";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}

const JWT_SECRET = new TextEncoder().encode(
  jwtSecret || "dev-only-fallback-not-for-production"
);

export async function createToken(payload: { admin: boolean }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { admin: boolean };
  } catch {
    return null;
  }
}