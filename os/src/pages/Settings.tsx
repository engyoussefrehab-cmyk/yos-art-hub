import { useState } from "react";
import { must, supabase } from "../lib/supabase";
import { CURRENCIES, LEAD_STATUSES, PROJECT_STATUSES, QUOTATION_STATUSES, SOURCES } from "../lib/format";
import { calcTotals } from "../lib/quote";
import type { Client, Lead, Project, Quotation, QuotationItem } from "../lib/types";
import { Button, PageHeader, RecordForm, Section, type FieldDef } from "../ui";
import { useSettings } from "../App";

const FIELDS: FieldDef[] = [
  { name: "business_name", label: "Business name", required: true },
  { name: "owner_name", label: "Your name", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone / WhatsApp", type: "tel" },
  { name: "website", label: "Website" },
  { name: "address", label: "Address / city" },
  { name: "logo_url", label: "Logo URL (leave empty for the YR Studio logo)", full: true },
  { name: "default_currency", label: "Default currency", type: "select", options: CURRENCIES.map((c) => ({ value: c, label: c })), required: true },
  { name: "quotation_valid_days", label: "Quotations valid for (days)", type: "number", step: "1", required: true },
  { name: "payment_terms", label: "Default payment terms", full: true },
  { name: "quotation_terms", label: "Default quotation notes & terms", type: "textarea" },
  { name: "accent", label: "Brand accent colour (hex, default #ff4848)", placeholder: "#ff4848" },
];

export function SettingsPage() {
  const { settings, refresh } = useSettings();
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <>
      <PageHeader title="Settings" sub={msg ? <span className="text-success">{msg}</span> : undefined} />
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Section title="Business & quotations">
          <RecordForm
            fields={FIELDS}
            initial={{ ...settings, accent: settings.brand?.accent ?? "" } as never}
            onSubmit={async (v) => {
              const { accent, ...rest } = v as Record<string, unknown> & { accent: string | null };
              if (accent && !/^#[0-9a-f]{6}$/i.test(accent)) throw new Error("Accent must look like #ff4848.");
              await must(supabase.from("settings").update({ ...rest, brand: { ...settings.brand, accent: accent || undefined }, updated_at: new Date().toISOString() }).eq("id", 1));
              await refresh();
              flash("Settings saved.");
            }}
          />
        </Section>
        <div className="space-y-5">
          <Backup flash={flash} />
          <InquiryLink />
          <Password flash={flash} />
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────── backup / restore / CSV */

type BackupFile = { app: string; exported_at: string; tables: Record<string, Record<string, unknown>[]> };

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM so Excel opens Arabic text correctly.
  return "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
}

function Backup({ flash }: { flash: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const stamp = new Date().toISOString().slice(0, 10);
  const getBackup = async () => (await must(supabase.rpc("export_backup"))) as BackupFile;

  const exportCsv = async (which: "clients" | "leads" | "quotations" | "projects") => {
    const { tables } = await getBackup();
    const clients = new Map((tables.clients as unknown as Client[]).map((c) => [c.id, c]));
    const cname = (id: string) => clients.get(id)?.name ?? "";
    let rows: Record<string, unknown>[] = [];
    if (which === "clients") rows = (tables.clients as unknown as Client[]).map((c) => ({ ...c, source: c.source ? SOURCES[c.source] : "" }));
    if (which === "leads")
      rows = (tables.leads as unknown as Lead[]).map((l) => ({
        ref: l.ref, date: l.date, client: cname(l.client_id), source: SOURCES[l.source], service: l.requested_service, status: LEAD_STATUSES[l.status],
        priority: l.priority, budget: l.budget, currency: l.currency, desired_start: l.desired_start, next_follow_up: l.next_follow_up, brief: l.brief, notes: l.notes,
      }));
    if (which === "quotations") {
      const items = tables.quotation_items as unknown as QuotationItem[];
      rows = (tables.quotations as unknown as Quotation[]).map((q) => {
        const t = calcTotals(items.filter((i) => i.quotation_id === q.id), q.discount_type, q.discount_value, q.tax_rate);
        return { ref: q.ref, client: cname(q.client_id), title: q.title, status: QUOTATION_STATUSES[q.status], currency: q.currency, subtotal: t.subtotal, discount: t.discount, tax: t.tax, total: t.total, issue_date: q.issue_date, expiry_date: q.expiry_date };
      });
    }
    if (which === "projects") {
      const pays = tables.payments as unknown as { project_id: string; amount: number; currency: string }[];
      rows = (tables.projects as unknown as Project[]).map((p) => {
        const paid = pays.filter((x) => x.project_id === p.id && x.currency === p.currency).reduce((s, x) => s + Number(x.amount), 0);
        return { ref: p.ref, name: p.name, client: cname(p.client_id), status: PROJECT_STATUSES[p.status], budget: p.budget, currency: p.currency, paid, outstanding: p.budget == null ? "" : Math.max(0, Number(p.budget) - paid), start_date: p.start_date, due_date: p.due_date };
      });
    }
    if (!rows.length) return flash(`No ${which} to export.`);
    download(`yr-studio-${which}-${stamp}.csv`, csv(rows), "text/csv;charset=utf-8");
  };

  const run = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Backup & export">
      <p className="mb-4 text-sm text-muted">The free database plan has no automatic backups — download a backup every week or so and keep it in Google Drive.</p>
      <div className="flex flex-wrap gap-2">
        <Button kind="primary" disabled={busy} onClick={run(async () => download(`yr-studio-backup-${stamp}.json`, JSON.stringify(await getBackup(), null, 1), "application/json"))}>
          Download full backup (JSON)
        </Button>
        <label className={`inline-flex cursor-pointer items-center rounded-full border border-line bg-surface-2 px-4 py-2 text-sm hover:border-fg/60 ${busy ? "pointer-events-none opacity-50" : ""}`}>
          Restore from backup…
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              await run(async () => {
                let data: BackupFile;
                try {
                  data = JSON.parse(await file.text());
                } catch {
                  throw new Error("This file is not valid JSON.");
                }
                if (data.app !== "yr-studio-os") throw new Error("This file is not a YR Studio OS backup.");
                const n = Object.values(data.tables ?? {}).reduce((s, r) => s + (Array.isArray(r) ? r.length : 0), 0);
                if (!window.confirm(`Replace ALL current data with this backup from ${new Date(data.exported_at).toLocaleString()} (${n} records)?\n\nTip: download a backup of the current data first.`)) return;
                await must(supabase.rpc("restore_backup", { backup: data }));
                flash("Backup restored.");
                setTimeout(() => location.reload(), 800);
              })();
            }}
          />
        </label>
      </div>
      <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-muted">CSV (opens in Excel / Google Sheets)</p>
      <div className="flex flex-wrap gap-2">
        {(["clients", "leads", "quotations", "projects"] as const).map((w) => (
          <Button key={w} small disabled={busy} onClick={run(() => exportCsv(w))} className="capitalize">
            {w}
          </Button>
        ))}
      </div>
    </Section>
  );
}

function InquiryLink() {
  const url = `${location.origin}/inquiry`;
  return (
    <Section title="Public inquiry form">
      <p className="mb-3 text-sm text-muted">Put this link in your Instagram and TikTok bio, or send it on WhatsApp. Every submission becomes a lead.</p>
      <div className="flex gap-2">
        <input className="input" readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Inquiry form link" />
        <Button small onClick={() => navigator.clipboard.writeText(url)}>
          Copy
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Add <code>?source=instagram</code>, <code>?source=tiktok</code> or <code>?source=whatsapp</code> to see where leads came from.
      </p>
    </Section>
  );
}

function Password({ flash }: { flash: (m: string) => void }) {
  return (
    <Section title="Change password">
      <RecordForm
        fields={[{ name: "password", label: "New password (min 10 characters)", type: "text", required: true, full: true }]}
        submitLabel="Update password"
        onSubmit={async (v) => {
          const p = String(v.password ?? "");
          if (p.length < 10) throw new Error("Use at least 10 characters.");
          const { error } = await supabase.auth.updateUser({ password: p });
          if (error) throw new Error(error.message);
          flash("Password updated.");
        }}
      />
    </Section>
  );
}
