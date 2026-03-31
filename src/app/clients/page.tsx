import Link from "next/link";
import { getBaseUrlFromHeaders } from "@/lib/baseUrl";

type Client = {
  id: string;
  client_code: string;
  company_name: string;
  email: string;
  amount: number;
  tax_rate: number;
  billing_day: number;
  is_active: boolean;
};

async function getClients(): Promise<Client[]> {
  const res = await fetch(`${await getBaseUrlFromHeaders()}/api/clients`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { clients: Client[] };
  return data.clients ?? [];
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">取引先一覧</h1>
          <p className="mt-2 text-sm text-zinc-600">登録・編集・有効/無効（モック）</p>
        </div>
        <Link
          href="/clients/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          新規登録
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-600">
            <tr className="border-b border-zinc-200">
              <th className="px-5 py-3 font-medium">有効</th>
              <th className="px-5 py-3 font-medium">コード</th>
              <th className="px-5 py-3 font-medium">会社名</th>
              <th className="px-5 py-3 font-medium">メール</th>
              <th className="px-5 py-3 font-medium">金額(税抜)</th>
              <th className="px-5 py-3 font-medium">請求日</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100">
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      c.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    {c.is_active ? "ON" : "OFF"}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono">{c.client_code}</td>
                <td className="px-5 py-3">{c.company_name}</td>
                <td className="px-5 py-3">{c.email}</td>
                <td className="px-5 py-3">¥{c.amount.toLocaleString()}</td>
                <td className="px-5 py-3">{c.billing_day}日</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/clients/${c.id}/edit`}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/clients/${c.id}/extras`}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                    >
                      今月の追加
                    </Link>
                    <Link
                      href={`/invoices?client=${c.id}`}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                    >
                      請求書
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-zinc-600" colSpan={7}>
                  取引先がありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

