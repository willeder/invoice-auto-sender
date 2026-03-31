import Link from "next/link";
import { ClientForm } from "../ClientForm";

export default function NewClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">取引先登録</h1>
          <p className="mt-2 text-sm text-zinc-600">設計書: `/clients/new`（モック）</p>
        </div>
        <Link
          href="/clients"
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          戻る
        </Link>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}

