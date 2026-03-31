import { getBaseUrlFromHeaders } from "@/lib/baseUrl";
import { SettingsForm } from "./settingsForm";

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

async function getSettings(): Promise<Settings | null> {
  const res = await fetch(`${await getBaseUrlFromHeaders()}/api/settings`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { settings: Settings };
  return data.settings ?? null;
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">設定</h1>
        <p className="mt-2 text-sm text-zinc-600">自社情報・振込先・SMTP（モック）</p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}

