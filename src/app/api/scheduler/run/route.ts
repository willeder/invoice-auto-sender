import { NextResponse } from "next/server";
import { runSchedulerForDay } from "@/lib/mockDb";
import { checkCronSecret } from "@/lib/auth";

export async function POST(req: Request) {
  // proxy.ts でも検証しているが、多層防御としてルート側でも CRON_SECRET を必須にする
  if (!checkCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { day?: number; issued_at?: string };
  const issuedAt = body.issued_at ? new Date(`${body.issued_at}T00:00:00`) : new Date();
  const day = body.day ?? issuedAt.getDate();
  const result = runSchedulerForDay(day, issuedAt);
  return NextResponse.json({ ok: true, day, ...result });
}

