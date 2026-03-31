import type { Client, Invoice, InvoiceItem, SendLog, Settings } from "./types";
import { buildInvoiceNumber, nextSequence3, renderMonthSuffix } from "./invoiceNumber";
import { toIsoDate } from "./date";

type Db = {
  clients: Client[];
  invoices: Invoice[];
  invoice_items: InvoiceItem[];
  send_logs: SendLog[];
  settings: Settings;
  counters: {
    invoiceSeqByDateCode: Record<string, number>;
  };
  extrasByClientMonth: Record<string, { item_name: string; unit: string; unit_price: number; quantity: number }[]>;
};

function nowIso() {
  return new Date().toISOString();
}

function ensureDb(): Db {
  const g = globalThis as unknown as { __invoiceMockDb?: Db };
  if (g.__invoiceMockDb) return g.__invoiceMockDb;

  const seeded: Db = {
    clients: [],
    invoices: [],
    invoice_items: [],
    send_logs: [],
    settings: {
      company_name: "ウィルダー株式会社",
      company_postal: "〒141-0022",
      company_address: "東京都品川区東五反田1-4-9-606",
      company_tel: "080-3908-4255",
      company_email: "support@willeder.com",
      company_staff: "織方励亥",
      invoice_reg_number: "T3700150117487",
      bank_info:
        "三井住友銀行 トランクNORTH支店 普通 0141153 ウィルダー(カ",
      invoice_note:
        "※ 請求書明細をご確認の上、お支払い期日までにお振込み\n※ 恐れ入りますが、振込手数料は貴社にてご負担願います",
      smtp_host: "smtp.gmail.com",
      smtp_port: 587,
      smtp_user: "your@gmail.com",
      smtp_password_masked: "********",
    },
    counters: { invoiceSeqByDateCode: {} },
    extrasByClientMonth: {},
  };

  const seedClient = (c: Omit<Client, "id" | "created_at" | "updated_at">) => {
    const id = crypto.randomUUID();
    const created_at = nowIso();
    const updated_at = created_at;
    seeded.clients.push({ ...c, id, created_at, updated_at });
    return id;
  };

  const c1 = seedClient({
    client_code: "AB",
    company_name: "株式会社ABC",
    postal_code: "〒444-0701",
    address: "愛知県西尾市東幡豆町田中46-1",
    contact_name: "山田太郎",
    email: "billing+abc@example.com",
    subject: "SSL更新",
    item_name: "SSL更新作業 (4月分)",
    item_unit: "式",
    amount: 100000,
    tax_rate: 0.1,
    billing_day: 1,
    payment_due_day: 28,
    is_active: true,
  });
  seedClient({
    client_code: "DE",
    company_name: "株式会社大弘重機",
    postal_code: "〒444-0701",
    address: "愛知県西尾市東幡豆町田中46-1",
    contact_name: "織方励亥",
    email: "billing+daihiro@example.com",
    subject: "SSL更新",
    item_name: "SSL更新作業 (4月分)",
    item_unit: "式",
    amount: 3000,
    tax_rate: 0.1,
    billing_day: 16,
    payment_due_day: 28,
    is_active: true,
  });
  seedClient({
    client_code: "TS",
    company_name: "テスト株式会社",
    email: "billing+test@example.com",
    subject: "保守費用",
    item_name: "保守費用 (4月分)",
    item_unit: "月",
    amount: 30000,
    tax_rate: 0.1,
    billing_day: 1,
    payment_due_day: 28,
    is_active: true,
  });

  g.__invoiceMockDb = seeded;

  // 起動時に「今月分の請求書っぽいもの」を少し作っておく（モック見栄え用）
  const issuedAt = new Date();
  const due = new Date(issuedAt);
  due.setMonth(due.getMonth() + 1);
  due.setDate(28);

  const client = seeded.clients.find((x) => x.id === c1);
  if (client) {
    const inv = createRecurringInvoice(client.id, issuedAt, due);
    inv.status = "sent";
  }

  return g.__invoiceMockDb;
}

function keyForSeq(issuedAt: Date, code2: string) {
  const d = toIsoDate(issuedAt);
  return `${d}:${code2}`;
}

export function listClients() {
  const db = ensureDb();
  return [...db.clients].sort((a, b) => a.company_name.localeCompare(b.company_name, "ja"));
}

export function getClient(id: string) {
  const db = ensureDb();
  return db.clients.find((c) => c.id === id) ?? null;
}

export function createClient(input: Omit<Client, "id" | "created_at" | "updated_at">) {
  const db = ensureDb();
  const now = nowIso();
  const c: Client = { ...input, id: crypto.randomUUID(), created_at: now, updated_at: now };
  db.clients.push(c);
  return c;
}

export function updateClient(id: string, patch: Partial<Omit<Client, "id" | "created_at">>) {
  const db = ensureDb();
  const c = db.clients.find((x) => x.id === id);
  if (!c) return null;
  Object.assign(c, patch, { updated_at: nowIso() });
  return c;
}

export function deleteClient(id: string) {
  const db = ensureDb();
  db.clients = db.clients.filter((c) => c.id !== id);
  const invIds = db.invoices.filter((i) => i.client_id === id).map((i) => i.id);
  db.invoices = db.invoices.filter((i) => i.client_id !== id);
  db.invoice_items = db.invoice_items.filter((it) => !invIds.includes(it.invoice_id));
  db.send_logs = db.send_logs.filter((l) => !invIds.includes(l.invoice_id));
  return true;
}

export function toggleClient(id: string) {
  const c = getClient(id);
  if (!c) return null;
  c.is_active = !c.is_active;
  c.updated_at = nowIso();
  return c;
}

export function getSettings() {
  return ensureDb().settings;
}

export function updateSettings(patch: Partial<Settings>) {
  const db = ensureDb();
  db.settings = { ...db.settings, ...patch };
  return db.settings;
}

export function listInvoices() {
  const db = ensureDb();
  return [...db.invoices].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getInvoice(id: string) {
  const db = ensureDb();
  const inv = db.invoices.find((x) => x.id === id) ?? null;
  if (!inv) return null;
  const items = db.invoice_items
    .filter((it) => it.invoice_id === inv.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const logs = db.send_logs
    .filter((l) => l.invoice_id === inv.id)
    .sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  return { invoice: inv, items, logs };
}

export function upsertExtras(params: { clientId: string; monthKey: string; items: { item_name: string; unit: string; unit_price: number; quantity: number }[] }) {
  const db = ensureDb();
  db.extrasByClientMonth[`${params.clientId}:${params.monthKey}`] = params.items;
  return true;
}

export function getExtras(params: { clientId: string; monthKey: string }) {
  const db = ensureDb();
  return db.extrasByClientMonth[`${params.clientId}:${params.monthKey}`] ?? [];
}

export function createRecurringInvoice(clientId: string, issuedAt: Date, dueAt: Date) {
  const db = ensureDb();
  const client = getClient(clientId);
  if (!client) throw new Error("client not found");

  const code2 = client.client_code.slice(0, 2);
  const seqKey = keyForSeq(issuedAt, code2);
  const current = db.counters.invoiceSeqByDateCode[seqKey] ?? 0;
  const seq = nextSequence3(current);
  db.counters.invoiceSeqByDateCode[seqKey] = seq;

  const invoice_number = buildInvoiceNumber({
    issuedAt,
    clientCode: code2,
    kind: "recurring_or_extra",
    sequence3: seq,
  });

  const id = crypto.randomUUID();
  const issued_at = toIsoDate(issuedAt);
  const due_date = toIsoDate(dueAt);
  const created_at = nowIso();

  const baseItemName = renderMonthSuffix(client.item_name, issuedAt);
  const base: InvoiceItem = {
    id: crypto.randomUUID(),
    invoice_id: id,
    item_name: baseItemName,
    quantity: 1,
    unit: client.item_unit,
    unit_price: client.amount,
    amount: client.amount,
    sort_order: 0,
  };

  const monthKey = `${issuedAt.getFullYear()}-${String(issuedAt.getMonth() + 1).padStart(2, "0")}`;
  const extras = getExtras({ clientId, monthKey }).map((x, idx) => {
    const amount = Math.round(x.quantity * x.unit_price);
    const it: InvoiceItem = {
      id: crypto.randomUUID(),
      invoice_id: id,
      item_name: x.item_name,
      quantity: x.quantity,
      unit: x.unit,
      unit_price: x.unit_price,
      amount,
      sort_order: 1 + idx,
    };
    return it;
  });

  const items = [base, ...extras];
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const tax_amount = Math.round(subtotal * client.tax_rate);
  const total_amount = subtotal + tax_amount;

  const invoice: Invoice = {
    id,
    invoice_number,
    client_id: clientId,
    invoice_type: "recurring",
    subject: client.subject,
    issued_at,
    due_date,
    subtotal,
    tax_amount,
    total_amount,
    status: "draft",
    created_at,
  };

  db.invoices.push(invoice);
  db.invoice_items.push(...items);
  return invoice;
}

export function createSpotInvoice(input: {
  to_company_name: string;
  to_email: string;
  subject: string;
  issuedAt: Date;
  dueAt: Date;
  items: { item_name: string; quantity: number; unit: string; unit_price: number }[];
  tax_rate: number;
}) {
  const db = ensureDb();
  const seqKey = keyForSeq(input.issuedAt, "SP");
  const current = db.counters.invoiceSeqByDateCode[seqKey] ?? 0;
  const seq = nextSequence3(current);
  db.counters.invoiceSeqByDateCode[seqKey] = seq;

  const invoice_number = buildInvoiceNumber({
    issuedAt: input.issuedAt,
    kind: "spot",
    sequence3: seq,
  });

  const id = crypto.randomUUID();
  const issued_at = toIsoDate(input.issuedAt);
  const due_date = toIsoDate(input.dueAt);
  const created_at = nowIso();

  const invoiceItems: InvoiceItem[] = input.items.map((it, idx) => {
    const amount = Math.round(it.quantity * it.unit_price);
    return {
      id: crypto.randomUUID(),
      invoice_id: id,
      item_name: it.item_name,
      quantity: it.quantity,
      unit: it.unit,
      unit_price: it.unit_price,
      amount,
      sort_order: idx,
    };
  });

  const subtotal = invoiceItems.reduce((s, it) => s + it.amount, 0);
  const tax_amount = Math.round(subtotal * input.tax_rate);
  const total_amount = subtotal + tax_amount;

  const invoice: Invoice = {
    id,
    invoice_number,
    client_id: null,
    invoice_type: "spot",
    subject: input.subject,
    issued_at,
    due_date,
    subtotal,
    tax_amount,
    total_amount,
    status: "draft",
    note: `宛先: ${input.to_company_name} <${input.to_email}>`,
    created_at,
  };

  db.invoices.push(invoice);
  db.invoice_items.push(...invoiceItems);
  return invoice;
}

export function sendInvoice(id: string) {
  const db = ensureDb();
  const inv = db.invoices.find((x) => x.id === id);
  if (!inv) return null;

  // モック: 一定確率で失敗させる
  const ok = Math.random() > 0.2;
  const sent_at = nowIso();
  if (ok) {
    inv.status = "sent";
    db.send_logs.push({
      id: crypto.randomUUID(),
      invoice_id: inv.id,
      sent_at,
      status: "success",
      retry_count: 0,
    });
  } else {
    inv.status = "failed";
    db.send_logs.push({
      id: crypto.randomUUID(),
      invoice_id: inv.id,
      sent_at,
      status: "failed",
      error_msg: "SMTP認証に失敗しました（モック）",
      retry_count: 0,
    });
  }
  return inv;
}

export function runSchedulerForDay(day: number, issuedAt: Date) {
  const db = ensureDb();
  const targets = db.clients.filter((c) => c.is_active && c.billing_day === day);
  const due = new Date(issuedAt);
  due.setMonth(due.getMonth() + 1);
  due.setDate(28);
  const created: Invoice[] = [];
  for (const t of targets) {
    const inv = createRecurringInvoice(t.id, issuedAt, due);
    // モック: 自動実行は即送信まで進める想定にする
    sendInvoice(inv.id);
    created.push(inv);
  }
  return { targets: targets.length, created: created.length };
}

