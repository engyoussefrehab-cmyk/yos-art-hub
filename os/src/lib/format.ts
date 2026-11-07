import type { Currency, LeadSource, LeadStatus, Priority, ProjectStatus, QuotationStatus } from "./types";

export const CURRENCIES: Currency[] = ["USD", "EGP", "SAR", "AED"];

export const SOURCES: Record<LeadSource, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website form",
  referral: "Referral",
  other: "Other",
};

export const LEAD_STATUSES: Record<LeadStatus, string> = {
  new_inquiry: "New Inquiry",
  brief_requested: "Brief Requested",
  brief_received: "Brief Received",
  qualified: "Qualified",
  quotation_sent: "Quotation Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const PRIORITIES: Record<Priority, string> = { low: "Low", normal: "Normal", high: "High" };

export const QUOTATION_STATUSES: Record<QuotationStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

export const PROJECT_STATUSES: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  waiting_for_client: "Waiting for Client",
  in_review: "In Review",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const options = (rec: Record<string, string>) => Object.entries(rec).map(([value, label]) => ({ value, label }));

export function money(amount: number | null | undefined, currency: Currency | null | undefined) {
  if (amount == null) return "—";
  const n = Number(amount);
  return `${currency ?? ""} ${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`.trim();
}

/** Sum amounts per currency → "USD 1,200 · SAR 800". Currencies are never mixed. */
export function sumByCurrency(rows: { amount: number | null; currency: Currency | null }[]) {
  const totals = new Map<Currency, number>();
  for (const r of rows) {
    if (r.amount == null || !r.currency) continue;
    totals.set(r.currency, (totals.get(r.currency) ?? 0) + Number(r.amount));
  }
  return totals;
}
export function moneyMap(totals: Map<Currency, number>) {
  if (!totals.size) return "0";
  return [...totals].map(([c, n]) => money(Math.round(n * 100) / 100, c)).join(" · ");
}

export function date(d: string | null | undefined) {
  if (!d) return "—";
  const v = new Date(d.length === 10 ? d + "T00:00:00" : d);
  return v.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Today as YYYY-MM-DD in the owner's local time zone. */
export function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const clientLabel = (c?: { name: string; brand?: string | null } | null) =>
  c ? (c.brand ? `${c.name} · ${c.brand}` : c.name) : "—";

/** wa.me link for a phone number (digits only), or null. */
export function whatsappLink(phone: string | null | undefined, text?: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
