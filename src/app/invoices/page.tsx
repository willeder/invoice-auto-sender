import Link from "next/link";
import { getBaseUrlFromHeaders } from "@/lib/baseUrl";

type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string | null;
  invoice_type: "recurring" | "spot";
  subject: string;
  issued_at: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "failed";
  created_at: string;
};

async function getInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${await getBaseUrlFromHeaders()}/api/invoices`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { invoices: Invoice[] };
  return data.invoices ?? [];
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">請求書一覧</h1>
          <p className="mt-2 text-sm text-zinc-600">
            定期・単発すべての請求書（モック）
          </p>
        </div>
        <Link
          href="/invoices/new/spot"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          単発請求書を作成
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-600">
            <tr className="border-b border-zinc-200">
              <th className="px-5 py-3 font-medium">ステータス</th>
              <th className="px-5 py-3 font-medium">請求No</th>
              <th className="px-5 py-3 font-medium">種別</th>
              <th className="px-5 py-3 font-medium">件名</th>
              <th className="px-5 py-3 font-medium">発行日</th>
              <th className="px-5 py-3 font-medium">支払期限</th>
              <th className="px-5 py-3 font-medium">合計</th>
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-zinc-100">
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      inv.status === "sent"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : inv.status === "failed"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono">{inv.invoice_number}</td>
                <td className="px-5 py-3">
                  {inv.invoice_type === "spot" ? "単発" : "定期"}
                </td>
                <td className="px-5 py-3">{inv.subject}</td>
                <td className="px-5 py-3">{inv.issued_at}</td>
                <td className="px-5 py-3">{inv.due_date}</td>
                <td className="px-5 py-3">¥{inv.total_amount.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-zinc-600" colSpan={8}>
                  請求書がありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">テスト用（モック）</div>
        <p className="mt-2 text-sm text-zinc-600">
          スケジューラー手動実行は <code className="font-mono">/api/scheduler/run</code>{" "}
          を叩く想定です。
        </p>
      </div>
    </div>
  );
}

