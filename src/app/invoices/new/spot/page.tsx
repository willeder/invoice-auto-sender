import Link from "next/link";
import { SpotInvoiceForm } from "./spotForm";

export default function NewSpotInvoicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">単発請求書作成</h1>
          <p className="mt-2 text-sm text-zinc-600">
            設計書: <code className="font-mono">/invoices/new/spot</code>（モック）
          </p>
        </div>
        <Link
          href="/invoices"
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          戻る
        </Link>
      </div>

      <SpotInvoiceForm />
    </div>
  );
}

