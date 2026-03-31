import { NextResponse } from "next/server";
import { createClient, listClients } from "@/lib/mockDb";
import type { Client } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ clients: listClients() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Omit<Client, "id" | "created_at" | "updated_at">;
  const created = createClient(body);
  return NextResponse.json({ client: created }, { status: 201 });
}

