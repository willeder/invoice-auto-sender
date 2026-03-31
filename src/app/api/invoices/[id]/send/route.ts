import { NextResponse } from "next/server";
import { sendInvoice } from "@/lib/mockDb";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const invoice = sendInvoice(id);
  if (!invoice) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ invoice });
}

