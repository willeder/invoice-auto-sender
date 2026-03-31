export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          ダッシュボード
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          当月の送信状況サマリーと直近ログ（モック）
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">今月の送信</div>
          <div className="mt-2 text-3xl font-semibold">12 件</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">未送信</div>
          <div className="mt-2 text-3xl font-semibold">3 件</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">エラー</div>
          <div className="mt-2 text-3xl font-semibold text-red-600">1 件</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <div className="text-sm font-medium">直近の送信履歴</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-600">
              <tr className="border-b border-zinc-200">
                <th className="px-5 py-3 font-medium">ステータス</th>
                <th className="px-5 py-3 font-medium">取引先</th>
                <th className="px-5 py-3 font-medium">金額</th>
                <th className="px-5 py-3 font-medium">日時</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100">
                <td className="px-5 py-3">✅ sent</td>
                <td className="px-5 py-3">株式会社ABC</td>
                <td className="px-5 py-3">¥110,000</td>
                <td className="px-5 py-3">2026-04-01 00:00</td>
                <td className="px-5 py-3 text-zinc-500">—</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-5 py-3">✅ sent</td>
                <td className="px-5 py-3">山田商事</td>
                <td className="px-5 py-3">¥55,000</td>
                <td className="px-5 py-3">2026-04-01 00:00</td>
                <td className="px-5 py-3 text-zinc-500">—</td>
              </tr>
              <tr>
                <td className="px-5 py-3">❌ failed</td>
                <td className="px-5 py-3">テスト株式会社</td>
                <td className="px-5 py-3">¥33,000</td>
                <td className="px-5 py-3">2026-04-01 00:00</td>
                <td className="px-5 py-3">
                  <a
                    href="/invoices"
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                  >
                    再送（モック）
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
