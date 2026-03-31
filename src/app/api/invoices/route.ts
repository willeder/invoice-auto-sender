import { NextResponse } from "next/server";
import { listInvoices } from "@/lib/mockDb";

export async function GET() {
  return NextResponse.json({ invoices: listInvoices() });
}

