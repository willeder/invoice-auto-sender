import { NextResponse } from "next/server";
import { createSpotInvoice } from "@/lib/mockDb";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    to_company_name: string;
    to_email: string;
    subject: string;
    issued_at: string; // YYYY-MM-DD
    due_date: string; // YYYY-MM-DD
    tax_rate: number;
    items: { item_name: string; quantity: number; unit: string; unit_price: number }[];
  };

  const issuedAt = new Date(`${body.issued_at}T00:00:00`);
  const dueAt = new Date(`${body.due_date}T00:00:00`);

  const invoice = createSpotInvoice({
    to_company_name: body.to_company_name,
    to_email: body.to_email,
    subject: body.subject,
    issuedAt,
    dueAt,
    items: body.items,
    tax_rate: body.tax_rate,
  });

  return NextResponse.json({ invoice }, { status: 201 });
}

