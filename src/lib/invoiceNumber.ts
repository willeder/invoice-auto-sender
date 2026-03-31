import { formatYyyyMmDdCompact, pad2 } from "./date";

export function nextSequence3(currentMax: number) {
  const next = currentMax + 1;
  if (next > 999) return 999;
  return next;
}

export function formatSequence3(n: number) {
  return String(n).padStart(3, "0");
}

export function buildInvoiceNumber(params: {
  issuedAt: Date;
  clientCode?: string;
  kind: "recurring_or_extra" | "spot";
  sequence3: number;
}) {
  const yyyymmdd = formatYyyyMmDdCompact(params.issuedAt);
  const code =
    params.kind === "spot" ? "SP" : (params.clientCode ?? "??").slice(0, 2);
  return `${yyyymmdd}${code}${formatSequence3(params.sequence3)}`;
}

export function renderMonthSuffix(itemName: string, forDate: Date) {
  const m = pad2(forDate.getMonth() + 1);
  return itemName.replace(/\(\s*\d{1,2}\s*月分\s*\)/g, `(${Number(m)}月分)`);
}

