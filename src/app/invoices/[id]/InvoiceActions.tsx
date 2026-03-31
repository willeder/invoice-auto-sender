"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function InvoiceActions(props: { invoiceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    const res = await fetch(`/api/invoices/${props.invoiceId}/send`, {
      method: "POST",
    });
    if (!res.ok) {
      setError(`送信に失敗しました（HTTP ${res.status}）`);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}
      <a
        href={`/api/invoices/${props.invoiceId}/pdf`}
        className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
      >
        PDFダウンロード（モック）
      </a>
      <button
        type="button"
        onClick={send}
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        メール送信（モック）
      </button>
    </div>
  );
}

