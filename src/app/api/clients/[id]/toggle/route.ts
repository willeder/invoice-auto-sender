import { NextResponse } from "next/server";
import { toggleClient } from "@/lib/mockDb";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const client = toggleClient(id);
  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ client });
}

