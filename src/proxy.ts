import { NextResponse, type NextRequest } from "next/server";
import { checkBasicAuth, checkCronSecret } from "@/lib/auth";

// Cron から呼ばれるエンドポイント。Basic 認証ではなく CRON_SECRET で保護する。
const CRON_PATHS = ["/api/scheduler/run"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authorization = request.headers.get("authorization");

  if (CRON_PATHS.some((p) => pathname === p || pathname === `${p}/`)) {
    if (!checkCronSecret(authorization)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const result = checkBasicAuth(authorization);
  if (result === "ok") return NextResponse.next();
  if (result === "not-configured") {
    return new NextResponse("Authentication is not configured (set BASIC_AUTH_USER / BASIC_AUTH_PASSWORD).", {
      status: 503,
    });
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="invoice-auto-sender", charset="UTF-8"' },
  });
}

export const config = {
  // 静的アセット以外のすべてのページ・API を保護する
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
