export type Currency = "USD" | "EGP" | "SAR" | "AED";
export type LeadSource = "instagram" | "tiktok" | "whatsapp" | "website" | "referral" | "other";
export type LeadStatus =
  | "new_inquiry"
  | "brief_requested"
  | "brief_received"
  | "qualified"
  | "quotation_sent"
  | "negotiation"
  | "won"
  | "lost";
export type Priority = "low" | "normal" | "high";
export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type ProjectStatus =
  | "not_started"
  | "in_progress"
  | "waiting_for_client"
  | "in_review"
  | "revision"
  | "completed"
  | "cancelled";

export interface Settings {
  id: 1;
  business_name: string;
  owner_name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logo_url: string | null;
  default_currency: Currency;
  quotation_terms: string | null;
  payment_terms: string | null;
  quotation_valid_days: number;
  language: "en" | "ar";
  brand: { accent?: string };
}

export interface Client {
  id: string;
  name: string;
  brand: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  language: "en" | "ar" | null;
  source: LeadSource | null;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  default_price: number | null;
  currency: Currency;
  delivery_days: number | null;
  deliverables: string | null;
  active: boolean;
  sort: number;
}

export interface Lead {
  id: string;
  ref: string;
  client_id: string;
  date: string;
  source: LeadSource;
  service_id: string | null;
  requested_service: string | null;
  brief: string | null;
  budget: number | null;
  currency: Currency | null;
  desired_start: string | null;
  priority: Priority;
  status: LeadStatus;
  next_follow_up: string | null;
  notes: string | null;
  created_at: string;
  clients?: Pick<Client, "name" | "brand" | "phone" | "email"> | null;
  services?: Pick<Service, "name"> | null;
}

export interface Quotation {
  id: string;
  ref: string;
  client_id: string;
  lead_id: string | null;
  title: string | null;
  status: QuotationStatus;
  currency: Currency;
  discount_type: "amount" | "percent";
  discount_value: number;
  tax_rate: number;
  delivery_time: string | null;
  payment_terms: string | null;
  issue_date: string;
  expiry_date: string | null;
  notes: string | null;
  sent_at: string | null;
  created_at: string;
  clients?: Pick<Client, "name" | "brand" | "email" | "phone" | "country"> | null;
  quotation_totals?: QuotationTotals | null;
}

export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  description: string;
  details: string | null;
  quantity: number;
  unit_price: number;
  sort: number;
}

export interface QuotationTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Project {
  id: string;
  ref: string;
  name: string;
  client_id: string;
  quotation_id: string | null;
  service: string | null;
  budget: number | null;
  currency: Currency;
  start_date: string | null;
  due_date: string | null;
  status: ProjectStatus;
  notes: string | null;
  created_at: string;
  clients?: Pick<Client, "name" | "brand"> | null;
  payments?: Pick<Payment, "amount" | "currency">[];
}

export interface ProjectItem {
  id: string;
  project_id: string;
  kind: "task" | "deliverable";
  title: string;
  done: boolean;
  due_date: string | null;
  link: string | null;
  sort: number;
}

export interface Payment {
  id: string;
  project_id: string;
  amount: number;
  currency: Currency;
  paid_on: string;
  method: string | null;
  note: string | null;
}

export interface FollowUp {
  id: string;
  title: string;
  due_date: string;
  note: string | null;
  client_id: string | null;
  lead_id: string | null;
  quotation_id: string | null;
  done_at: string | null;
  clients?: Pick<Client, "name" | "phone"> | null;
  leads?: Pick<Lead, "ref"> | null;
  quotations?: Pick<Quotation, "ref"> | null;
}

export interface Template {
  id: string;
  name: string;
  body: string;
  sort: number;
}
