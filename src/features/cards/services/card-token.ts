import { randomBytes, createHash } from "crypto";

const TOKEN_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateSecureToken(length = 8): string {
  const bytes = randomBytes(length);
  let token = "";
  for (let i = 0; i < length; i++) {
    token += TOKEN_CHARS[bytes[i] % TOKEN_CHARS.length];
  }
  return token;
}

export function generateSecretKey(): string {
  return randomBytes(32).toString("hex");
}

export function generatePrintCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function buildScanUrl(baseUrl: string, token: string): string {
  const normalized = baseUrl.replace(/\/$/, "");
  return `${normalized}/s/${token}`;
}
