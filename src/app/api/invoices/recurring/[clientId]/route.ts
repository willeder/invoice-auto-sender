import { NextResponse } from "next/server";
import { createRecurringInvoice } from "@/lib/mockDb";

export async function POST(
  req: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await context.params;
  const body = (await req.json().catch(() => ({}))) as {
    issued_at?: string; // YYYY-MM-DD
    due_date?: string; // YYYY-MM-DD
  };

  const issuedAt = body.issued_at
    ? new Date(`${body.issued_at}T00:00:00`)
    : new Date();
  const dueAt = body.due_date
    ? new Date(`${body.due_date}T00:00:00`)
    : (() => {
        const d = new Date(issuedAt);
        d.setMonth(d.getMonth() + 1);
        d.setDate(28);
        return d;
      })();

  const invoice = createRecurringInvoice(clientId, issuedAt, dueAt);
  return NextResponse.json({ invoice }, { status: 201 });
}

