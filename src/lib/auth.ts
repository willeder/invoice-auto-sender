import { createHash, timingSafeEqual } from "node:crypto";

/**
 * 文字列をタイミング攻撃に耐性のある方法で比較する。
 * 長さの違いで早期 return しないよう、両方を SHA-256 にしてから比較する。
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

export type BasicAuthResult = "ok" | "unauthorized" | "not-configured";

/**
 * Basic 認証ヘッダを BASIC_AUTH_USER / BASIC_AUTH_PASSWORD と照合する。
 * 未設定時は本番では fail-closed（not-configured）、開発環境のみ素通しする。
 */
export function checkBasicAuth(authorization: string | null): BasicAuthResult {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) {
    return process.env.NODE_ENV === "development" ? "ok" : "not-configured";
  }
  if (!authorization || !authorization.startsWith("Basic ")) return "unauthorized";
  let decoded = "";
  try {
    decoded = Buffer.from(authorization.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return "unauthorized";
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return "unauthorized";
  const okUser = safeEqual(decoded.slice(0, idx), user);
  const okPass = safeEqual(decoded.slice(idx + 1), pass);
  return okUser && okPass ? "ok" : "unauthorized";
}

/**
 * Cron 用エンドポイントの `Authorization: Bearer <CRON_SECRET>` を検証する。
 * CRON_SECRET 未設定時は常に拒否（fail-closed）。
 */
export function checkCronSecret(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (!authorization || !authorization.startsWith("Bearer ")) return false;
  return safeEqual(authorization.slice(7).trim(), secret);
}
