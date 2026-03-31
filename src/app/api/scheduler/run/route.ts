import { NextResponse } from "next/server";
import { runSchedulerForDay } from "@/lib/mockDb";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { day?: number; issued_at?: string };
  const issuedAt = body.issued_at ? new Date(`${body.issued_at}T00:00:00`) : new Date();
  const day = body.day ?? issuedAt.getDate();
  const result = runSchedulerForDay(day, issuedAt);
  return NextResponse.json({ ok: true, day, ...result });
}

