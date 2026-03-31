"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  client_code: string;
  company_name: string;
  postal_code?: string;
  address?: string;
  contact_name?: string;
  email: string;
  subject: string;
  item_name: string;
  item_unit: string;
  amount: number;
  tax_rate: number;
  billing_day: number;
  payment_due_day: number;
  is_active: boolean;
};

const defaultClient: Omit<Client, "id"> = {
  client_code: "",
  company_name: "",
  postal_code: "",
  address: "",
  contact_name: "",
  email: "",
  subject: "",
  item_name: "",
  item_unit: "式",
  amount: 0,
  tax_rate: 0.1,
  billing_day: 1,
  payment_due_day: 28,
  is_active: true,
};

export function ClientForm(props: { mode: "create" | "edit"; initial?: Client }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Client, "id">>(() => {
    if (props.initial) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = props.initial;
      return { ...defaultClient, ...rest };
    }
    return defaultClient;
  });

  const canSubmit = useMemo(() => {
    return (
      form.client_code.trim().length === 2 &&
      form.company_name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.subject.trim().length > 0 &&
      form.item_name.trim().length > 0 &&
      form.item_unit.trim().length > 0 &&
      Number.isFinite(form.amount) &&
      form.amount > 0 &&
      form.billing_day >= 1 &&
      form.billing_day <= 28 &&
      form.payment_due_day >= 1 &&
      form.payment_due_day <= 28
    );
  }, [form]);

  async function onSubmit() {
    setError(null);
    const payload = {
      ...form,
      client_code: form.client_code.trim().toUpperCase(),
      amount: Number(form.amount),
      tax_rate: Number(form.tax_rate),
      billing_day: Number(form.billing_day),
      payment_due_day: Number(form.payment_due_day),
    };

    const url =
      props.mode === "create"
        ? "/api/clients"
        : `/api/clients/${props.initial?.id}`;

    const method = props.mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError(`保存に失敗しました（HTTP ${res.status}）`);
      return;
    }

    startTransition(() => {
      router.push("/clients");
      router.refresh();
    });
  }

  async function onToggleActive() {
    if (!props.initial?.id) return;
    setError(null);
    const res = await fetch(`/api/clients/${props.initial.id}/toggle`, {
      method: "PATCH",
    });
    if (!res.ok) {
      setError(`切替に失敗しました（HTTP ${res.status}）`);
      return;
    }
    startTransition(() => {
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="請求No用コード（2文字）" hint="例: DE">
          <input
            value={form.client_code}
            onChange={(e) =>
              setForm((p) => ({ ...p, client_code: e.target.value }))
            }
            maxLength={2}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="DE"
          />
        </Field>
        <Field label="会社名" required>
          <input
            value={form.company_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, company_name: e.target.value }))
            }
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="株式会社◯◯"
          />
        </Field>
        <Field label="郵便番号">
          <input
            value={form.postal_code ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, postal_code: e.target.value }))
            }
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="〒141-0022"
          />
        </Field>
        <Field label="住所">
          <input
            value={form.address ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="東京都..."
          />
        </Field>
        <Field label="担当者名">
          <input
            value={form.contact_name ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, contact_name: e.target.value }))
            }
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="山田太郎"
          />
        </Field>
        <Field label="送付先メール" required>
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            placeholder="billing@example.com"
          />
        </Field>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">請求内容</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="件名" required>
            <input
              value={form.subject}
              onChange={(e) =>
                setForm((p) => ({ ...p, subject: e.target.value }))
              }
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="SSL更新"
            />
          </Field>
          <Field label="品目名" required hint="(○月分) は自動置換（モック）">
            <input
              value={form.item_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, item_name: e.target.value }))
              }
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="SSL更新作業 (4月分)"
            />
          </Field>
          <Field label="単位" required>
            <input
              value={form.item_unit}
              onChange={(e) =>
                setForm((p) => ({ ...p, item_unit: e.target.value }))
              }
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="式"
            />
          </Field>
          <Field label="金額（税抜）" required>
            <input
              value={String(form.amount)}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: Number(e.target.value) }))
              }
              type="number"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="3000"
            />
          </Field>
          <Field label="消費税率" required>
            <input
              value={String(form.tax_rate)}
              onChange={(e) =>
                setForm((p) => ({ ...p, tax_rate: Number(e.target.value) }))
              }
              type="number"
              step="0.01"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">スケジュール</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="毎月の請求実行日（1〜28）" required>
            <input
              value={String(form.billing_day)}
              onChange={(e) =>
                setForm((p) => ({ ...p, billing_day: Number(e.target.value) }))
              }
              type="number"
              min={1}
              max={28}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="支払期限日（1〜28）" required>
            <input
              value={String(form.payment_due_day)}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  payment_due_day: Number(e.target.value),
                }))
              }
              type="number"
              min={1}
              max={28}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          保存
        </button>
        {props.mode === "edit" ? (
          <button
            type="button"
            onClick={onToggleActive}
            disabled={isPending}
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
          >
            有効/無効 切替
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">
          {props.label}
          {props.required ? <span className="ml-1 text-red-600">*</span> : null}
        </div>
      </div>
      {props.hint ? <div className="text-xs text-zinc-500">{props.hint}</div> : null}
      {props.children}
    </label>
  );
}

