"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Item = { item_name: string; quantity: number; unit: string; unit_price: number };

function yyyyMmDd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SpotInvoiceForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const today = useMemo(() => new Date(), []);
  const [form, setForm] = useState(() => ({
    to_company_name: "",
    to_email: "",
    subject: "",
    issued_at: yyyyMmDd(today),
    due_date: yyyyMmDd(new Date(today.getFullYear(), today.getMonth() + 1, 28)),
    tax_rate: 0.1,
  }));
  const [items, setItems] = useState<Item[]>([
    { item_name: "", quantity: 1, unit: "式", unit_price: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + Math.round(it.quantity * it.unit_price), 0),
    [items],
  );
  const tax = useMemo(() => Math.round(subtotal * Number(form.tax_rate)), [subtotal, form.tax_rate]);
  const total = subtotal + tax;

  const canSubmit = useMemo(() => {
    return (
      form.to_company_name.trim().length > 0 &&
      form.to_email.trim().length > 0 &&
      form.subject.trim().length > 0 &&
      items.length > 0 &&
      items.every((it) => it.item_name.trim().length > 0 && it.unit.trim().length > 0) &&
      total > 0
    );
  }, [form, items, total]);

  async function submit() {
    setError(null);
    const res = await fetch("/api/invoices/spot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    if (!res.ok) {
      setError(`作成に失敗しました（HTTP ${res.status}）`);
      return;
    }
    const data = (await res.json()) as { invoice: { id: string } };
    startTransition(() => {
      router.push(`/invoices/${data.invoice.id}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">宛先</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="会社名" required>
            <input
              value={form.to_company_name}
              onChange={(e) => setForm((p) => ({ ...p, to_company_name: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="株式会社◯◯"
            />
          </Field>
          <Field label="メール" required>
            <input
              value={form.to_email}
              onChange={(e) => setForm((p) => ({ ...p, to_email: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="billing@example.com"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">請求情報</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="件名" required>
            <input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="スポット作業"
            />
          </Field>
          <Field label="消費税率" required>
            <input
              value={String(form.tax_rate)}
              onChange={(e) => setForm((p) => ({ ...p, tax_rate: Number(e.target.value) }))}
              type="number"
              step="0.01"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="請求日" required>
            <input
              value={form.issued_at}
              onChange={(e) => setForm((p) => ({ ...p, issued_at: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="2026-04-01"
            />
          </Field>
          <Field label="支払期限" required>
            <input
              value={form.due_date}
              onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="2026-04-28"
            />
          </Field>
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
              <th className="px-5 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const amount = Math.round(it.quantity * it.unit_price);
              return (
                <tr key={idx} className="border-b border-zinc-100">
                  <td className="px-5 py-3">
                    <input
                      value={it.item_name}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) => (i === idx ? { ...x, item_name: e.target.value } : x)),
                        )
                      }
                      className="w-[28rem] max-w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="作業費"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={String(it.quantity)}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) => (i === idx ? { ...x, quantity: Number(e.target.value) } : x)),
                        )
                      }
                      type="number"
                      step="0.1"
                      className="w-24 rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={it.unit}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) => (i === idx ? { ...x, unit: e.target.value } : x)),
                        )
                      }
                      className="w-24 rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={String(it.unit_price)}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) => (i === idx ? { ...x, unit_price: Number(e.target.value) } : x)),
                        )
                      }
                      type="number"
                      className="w-32 rounded-md border border-zinc-200 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-5 py-3">¥{amount.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-4 text-sm text-zinc-700">
          小計: <span className="font-semibold">¥{subtotal.toLocaleString()}</span>{" "}
          / 消費税: <span className="font-semibold">¥{tax.toLocaleString()}</span>{" "}
          / 合計: <span className="font-semibold">¥{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setItems((p) => [...p, { item_name: "", quantity: 1, unit: "式", unit_price: 0 }])}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          行を追加
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          作成
        </button>
      </div>
    </div>
  );
}

function Field(props: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <div className="text-sm font-medium">
        {props.label}
        {props.required ? <span className="ml-1 text-red-600">*</span> : null}
      </div>
      {props.children}
    </label>
  );
}

