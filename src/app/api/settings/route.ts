import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/mockDb";
import type { Settings } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Partial<Settings>;
  const settings = updateSettings(body);
  return NextResponse.json({ settings });
}

