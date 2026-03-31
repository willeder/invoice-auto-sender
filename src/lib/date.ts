export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatYyyyMmDdCompact(d: Date) {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

export function formatYyyyMmDd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function toIsoDate(d: Date) {
  return formatYyyyMmDd(d);
}

export function addMonthsKeepingDay(base: Date, months: number, day: number) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  d.setDate(day);
  return d;
}

