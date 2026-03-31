import { NextResponse } from "next/server";
import { getExtras, upsertExtras } from "@/lib/mockDb";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? "";
  const items = getExtras({ clientId: id, monthKey: month });
  return NextResponse.json({ month, items });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await req.json()) as {
    month: string;
    items: { item_name: string; unit: string; unit_price: number; quantity: number }[];
  };
  upsertExtras({ clientId: id, monthKey: body.month, items: body.items });
  return NextResponse.json({ ok: true });
}

