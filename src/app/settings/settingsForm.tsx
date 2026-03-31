"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  company_name: string;
  company_postal: string;
  company_address: string;
  company_tel: string;
  company_email: string;
  company_staff: string;
  invoice_reg_number: string;
  bank_info: string;
  invoice_note: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password_masked: string;
};

const defaultSettings: Settings = {
  company_name: "",
  company_postal: "",
  company_address: "",
  company_tel: "",
  company_email: "",
  company_staff: "",
  invoice_reg_number: "",
  bank_info: "",
  invoice_note: "",
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_user: "",
  smtp_password_masked: "********",
};

export function SettingsForm(props: { initial: Settings | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Settings>(() => ({
    ...defaultSettings,
    ...(props.initial ?? {}),
  }));

  const canSubmit = useMemo(() => {
    return (
      form.company_name.trim().length > 0 &&
      form.company_email.trim().length > 0 &&
      form.bank_info.trim().length > 0 &&
      form.smtp_host.trim().length > 0 &&
      Number.isFinite(form.smtp_port) &&
      form.smtp_port > 0
    );
  }, [form]);

  async function save() {
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError(`保存に失敗しました（HTTP ${res.status}）`);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">自社情報</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="会社名" required>
            <input
              value={form.company_name}
              onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="郵便番号">
            <input
              value={form.company_postal}
              onChange={(e) => setForm((p) => ({ ...p, company_postal: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="住所">
            <input
              value={form.company_address}
              onChange={(e) => setForm((p) => ({ ...p, company_address: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="TEL">
            <input
              value={form.company_tel}
              onChange={(e) => setForm((p) => ({ ...p, company_tel: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="E-Mail" required>
            <input
              value={form.company_email}
              onChange={(e) => setForm((p) => ({ ...p, company_email: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="担当者名">
            <input
              value={form.company_staff}
              onChange={(e) => setForm((p) => ({ ...p, company_staff: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="インボイス登録番号">
            <input
              value={form.invoice_reg_number}
              onChange={(e) => setForm((p) => ({ ...p, invoice_reg_number: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">振込先・備考</div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="振込先銀行情報" required>
            <textarea
              value={form.bank_info}
              onChange={(e) => setForm((p) => ({ ...p, bank_info: e.target.value }))}
              className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="請求書 備考">
            <textarea
              value={form.invoice_note}
              onChange={(e) => setForm((p) => ({ ...p, invoice_note: e.target.value }))}
              className="min-h-24 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-sm font-medium">SMTP（モック）</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="SMTP Host" required>
            <input
              value={form.smtp_host}
              onChange={(e) => setForm((p) => ({ ...p, smtp_host: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="SMTP Port" required>
            <input
              value={String(form.smtp_port)}
              onChange={(e) => setForm((p) => ({ ...p, smtp_port: Number(e.target.value) }))}
              type="number"
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="SMTP User">
            <input
              value={form.smtp_user}
              onChange={(e) => setForm((p) => ({ ...p, smtp_user: e.target.value }))}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="SMTP Password（表示はマスク）">
            <input
              value={form.smtp_password_masked}
              readOnly
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600"
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!canSubmit || isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          保存
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

