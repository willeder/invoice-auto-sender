import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrlFromHeaders } from "@/lib/baseUrl";
import { ExtrasForm } from "./ExtrasForm";

type Client = { id: string; company_name: string };

async function getClient(id: string): Promise<Client | null> {
  const res = await fetch(`${getBaseUrlFromHeaders()}/api/clients/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { client: Client };
  return data.client ?? null;
}

export default async function ClientExtrasPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const client = await getClient(id);
  if (!client) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            今月の追加入力
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{client.company_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${id}/edit`}
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            取引先編集へ
          </Link>
          <Link
            href="/clients"
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            戻る
          </Link>
        </div>
      </div>

      <ExtrasForm clientId={id} />
    </div>
  );
}

