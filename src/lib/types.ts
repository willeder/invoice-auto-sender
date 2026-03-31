export type InvoiceType = "recurring" | "spot";
export type InvoiceStatus = "draft" | "sent" | "failed";

export type Client = {
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
  amount: number; // 税抜（単価）
  tax_rate: number; // 例: 0.10
  billing_day: number; // 1-28
  payment_due_day: number; // 1-28
  is_active: boolean;
  created_at: string; // ISO
  updated_at: string; // ISO
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  sort_order: number;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string | null;
  invoice_type: InvoiceType;
  subject: string;
  issued_at: string; // ISO date
  due_date: string; // ISO date
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  note?: string;
  created_at: string; // ISO datetime
};

export type SendLog = {
  id: string;
  invoice_id: string;
  sent_at: string; // ISO datetime
  status: "success" | "failed";
  error_msg?: string;
  retry_count: number;
};

export type Settings = {
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
