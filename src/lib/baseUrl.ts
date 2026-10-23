import { headers } from "next/headers";
import { connection } from "next/server";

/**
 * サーバ側から自アプリの API を呼ぶためのベース URL。
 * リクエストヘッダ（Host / X-Forwarded-Host）は攻撃者が操作できるため使わず、
 * 環境変数 APP_URL で固定する（SSRF / 応答偽装対策）。
 */
export async function getAppBaseUrl(): Promise<string> {
  // リクエスト時に評価する（ビルド時のプリレンダリングで内部 API を呼ばない）
  await connection();
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    const u = new URL(appUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error("APP_URL must be an http(s) URL");
    }
    return u.origin;
  }
  if (process.env.NODE_ENV !== "production") {
    return `http://localhost:${process.env.PORT ?? "3000"}`;
  }
  throw new Error("APP_URL is not set");
}

/**
 * サーバ側の内部 fetch 用ヘッダ。認証付き API を呼べるよう、
 * 受信リクエストの Authorization ヘッダのみを固定ホスト（APP_URL）へ転送する。
 */
export async function getInternalFetchHeaders(): Promise<HeadersInit> {
  const h = await headers();
  const authorization = h.get("authorization");
  return authorization ? { authorization } : {};
}
