import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    cron: "0 0 * * *",
    timezone: "local",
    note: "モックでは実際のcron常駐はしません。/api/scheduler/run を叩くと実行された体で処理します。",
  });
}

