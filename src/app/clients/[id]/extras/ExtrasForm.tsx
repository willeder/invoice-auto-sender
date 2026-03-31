"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ExtraItem = {
  item_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
};

function monthKeyFromToday(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function ExtrasForm(props: { clientId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [month, setMonth] = useState(() => monthKeyFromToday());
  const [items, setItems] = useState<ExtraItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch(`/api/clients/${props.clientId}/extras?month=${encodeURIComponent(month)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return (await r.json()) as { items: ExtraItem[] };
      })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [month, props.clientId]);

  const subtotal = useMemo(
    () =>
      items.reduce((s, it) => s + Math.round(it.quantity * it.unit_price), 0),
    [items],
  );

  async function save() {
    setError(null);
    const res = await fetch(`/api/clients/${props.clientId}/extras`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ month, items }),
    });
    if (!res.ok) {
      setError(`保存に失敗しました（HTTP ${res.status}）`);
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

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="flex flex-col gap-1">
            <div className="text-sm font-medium">対象月</div>
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-40 rounded-md border border-zinc-200 px-3 py-2 text-sm"
              placeholder="2026-04"
            />
            <div className="text-xs text-zinc-500">形式: YYYY-MM</div>
          </label>
          <div className="text-sm text-zinc-700">
            追加分合計: <span className="font-semibold">¥{subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-x-auto">
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
                          p.map((x, i) =>
                            i === idx ? { ...x, item_name: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-[28rem] max-w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="追加作業費"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={String(it.quantity)}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) =>
                            i === idx
                              ? { ...x, quantity: Number(e.target.value) }
                              : x,
                          ),
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
                          p.map((x, i) =>
                            i === idx ? { ...x, unit: e.target.value } : x,
                          ),
                        )
                      }
                      className="w-24 rounded-md border border-zinc-200 px-3 py-2 text-sm"
                      placeholder="式"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      value={String(it.unit_price)}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x, i) =>
                            i === idx
                              ? { ...x, unit_price: Number(e.target.value) }
                              : x,
                          ),
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
                      onClick={() =>
                        setItems((p) => p.filter((_, i) => i !== idx))
                      }
                      className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-zinc-600" colSpan={6}>
                  追加品目はありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setItems((p) => [
              ...p,
              { item_name: "", quantity: 1, unit: "式", unit_price: 0 },
            ])
          }
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          行を追加
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          保存
        </button>
      </div>
    </div>
  );
}

