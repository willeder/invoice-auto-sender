import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrlFromHeaders } from "@/lib/baseUrl";
import { InvoiceActions } from "./InvoiceActions";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_type: "recurring" | "spot";
  client_id: string | null;
  subject: string;
  issued_at: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "failed";
  note?: string;
};

type Item = {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
};

type Log = {
  id: string;
  sent_at: string;
  status: "success" | "failed";
  error_msg?: string;
  retry_count: number;
};

async function getInvoice(id: string): Promise<{
  invoice: Invoice;
  items: Item[];
  logs: Log[];
} | null> {
  const res = await fetch(`${getBaseUrlFromHeaders()}/api/invoices/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as { invoice: Invoice; items: Item[]; logs: Log[] };
}

export default async function InvoiceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const data = await getInvoice(id);
  if (!data) return notFound();

  const { invoice, items, logs } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">請求書詳細</h1>
          <p className="mt-2 text-sm text-zinc-600">
            請求No: <span className="font-mono">{invoice.invoice_number}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            戻る
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium">請求情報</div>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                invoice.status === "sent"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : invoice.status === "failed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600"
              }`}
            >
              {invoice.status}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <KV label="種別" value={invoice.invoice_type === "spot" ? "単発" : "定期"} />
            <KV label="件名" value={invoice.subject} />
            <KV label="発行日" value={invoice.issued_at} />
            <KV label="支払期限" value={invoice.due_date} />
            <KV label="小計(税抜)" value={`¥${invoice.subtotal.toLocaleString()}`} />
            <KV label="消費税" value={`¥${invoice.tax_amount.toLocaleString()}`} />
            <KV label="合計(税込)" value={`¥${invoice.total_amount.toLocaleString()}`} />
            <KV label="備考" value={invoice.note ?? "—"} />
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">操作（モック）</div>
          <div className="mt-4">
            <InvoiceActions invoiceId={invoice.id} />
          </div>
          <div className="mt-4 text-xs text-zinc-500">
            ※ PDFは簡易PDFで内容は最小（動線確認用）
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto">
        <div className="border-b border-zinc-200 px-5 py-4">
          <div className="text-sm font-medium">明細</div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-600">
            <tr className="border-b border-zinc-200">
              <th className="px-5 py-3 font-medium">摘要</th>
              <th className="px-5 py-3 font-medium">数量</th>
              <th className="px-5 py-3 font-medium">単位</th>
              <th className="px-5 py-3 font-medium">単価</th>
              <th className="px-5 py-3 font-medium">金額</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-zinc-100">
                <td className="px-5 py-3">{it.item_name}</td>
                <td className="px-5 py-3">{it.quantity}</td>
                <td className="px-5 py-3">{it.unit}</td>
                <td className="px-5 py-3">¥{it.unit_price.toLocaleString()}</td>
                <td className="px-5 py-3">¥{it.amount.toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-zinc-600" colSpan={5}>
                  明細がありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto">
        <div className="border-b border-zinc-200 px-5 py-4">
          <div className="text-sm font-medium">送信ログ</div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-600">
            <tr className="border-b border-zinc-200">
              <th className="px-5 py-3 font-medium">日時</th>
              <th className="px-5 py-3 font-medium">結果</th>
              <th className="px-5 py-3 font-medium">リトライ</th>
              <th className="px-5 py-3 font-medium">エラー</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-zinc-100">
                <td className="px-5 py-3">{l.sent_at}</td>
                <td className="px-5 py-3">{l.status}</td>
                <td className="px-5 py-3">{l.retry_count}</td>
                <td className="px-5 py-3 text-zinc-600">{l.error_msg ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-zinc-600" colSpan={4}>
                  ログがありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KV(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-zinc-500">{props.label}</dt>
      <dd className="text-sm">{props.value}</dd>
    </div>
  );
}

