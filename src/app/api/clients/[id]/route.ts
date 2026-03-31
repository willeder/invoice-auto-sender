import { NextResponse } from "next/server";
import { deleteClient, getClient, updateClient } from "@/lib/mockDb";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const client = getClient(id);
  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const patch = (await req.json()) as Record<string, unknown>;
  const client = updateClient(id, patch as never);
  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  deleteClient(id);
  return NextResponse.json({ ok: true });
}

