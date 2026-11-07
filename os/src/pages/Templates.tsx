import { useEffect, useMemo, useState } from "react";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { clientLabel, date, money, whatsappLink } from "../lib/format";
import { balance } from "./Projects";
import type { Client, Payment, Project, Quotation, Template } from "../lib/types";
import { Async, Button, Card, CopyButton, PageHeader, confirmDelete } from "../ui";
import { useSettings } from "../App";

export const PLACEHOLDERS = [
  "client_name",
  "brand_name",
  "project_name",
  "quotation_number",
  "quotation_amount",
  "expiry_date",
  "start_date",
  "due_date",
  "amount_due",
  "owner_name",
  "business_name",
] as const;

/** Replace {{placeholder}} with values; unknown or empty ones stay visible so you notice. */
export function fill(body: string, values: Record<string, string | null | undefined>) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key: string) => values[key] || m);
}

type Ctx = {
  clients: Client[];
  quotes: (Quotation & { quotation_totals: { total: number } | null })[];
  projects: (Project & { payments: Pick<Payment, "amount" | "currency">[] })[];
};

export function Templates() {
  const { settings } = useSettings();
  const state = useData(async () => {
    const [templates, clients, quotes, projects] = await Promise.all([
      must(supabase.from("templates").select("*").order("sort").order("name")),
      must(supabase.from("clients").select("*").order("created_at", { ascending: false })),
      must(supabase.from("quotations").select("*, quotation_totals").order("created_at", { ascending: false })),
      must(supabase.from("projects").select("*, payments(amount,currency)").order("created_at", { ascending: false })),
    ]);
    return { templates: templates as Template[], ctx: { clients, quotes, projects } as Ctx };
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(true);

  const tpl = state.data?.templates.find((t) => t.id === selected) ?? null;
  useEffect(() => {
    if (!selected && state.data?.templates[0]) setSelected(state.data.templates[0].id);
  }, [state.data, selected]);
  useEffect(() => {
    setBody(tpl?.body ?? "");
    setName(tpl?.name ?? "");
    setSaved(true);
  }, [tpl?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const values = useMemo(() => {
    const ctx = state.data?.ctx;
    const c = ctx?.clients.find((x) => x.id === clientId);
    const q = ctx?.quotes.find((x) => x.id === quoteId);
    const p = ctx?.projects.find((x) => x.id === projectId);
    const due = p ? balance(p, p.payments) : null;
    return {
      client_name: c?.name,
      brand_name: c?.brand,
      quotation_number: q?.ref,
      quotation_amount: q ? money(q.quotation_totals?.total, q.currency) : null,
      expiry_date: q?.expiry_date ? date(q.expiry_date) : null,
      project_name: p?.name,
      start_date: p?.start_date ? date(p.start_date) : null,
      due_date: p?.due_date ? date(p.due_date) : null,
      amount_due: p && due?.outstanding != null ? money(due.outstanding, p.currency) : null,
      owner_name: settings.owner_name,
      business_name: settings.business_name,
    };
  }, [state.data, clientId, quoteId, projectId, settings]);

  const preview = fill(body, values);
  const client = state.data?.ctx.clients.find((x) => x.id === clientId);
  const wa = whatsappLink(client?.phone, preview);

  return (
    <>
      <PageHeader
        title="Message templates"
        sub="Pick a template and a client — placeholders fill in, then copy or open WhatsApp."
        actions={
          <Button
            onClick={async () => {
              const t = await must(supabase.from("templates").insert({ name: "New template", body: "Hi {{client_name}},\n", sort: 99 }).select().single());
              await state.reload();
              setSelected(t.id);
            }}
          >
            + New template
          </Button>
        }
      />
      <Async state={state}>
        {({ templates, ctx }) => (
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm ${t.id === selected ? "bg-surface text-fg" : "text-muted hover:text-fg"}`}
                >
                  {t.name}
                </button>
              ))}
            </nav>
            {tpl && (
              <div className="grid gap-5 xl:grid-cols-2">
                <Card className="p-5">
                  <input className="input mb-3 font-medium" value={name} onChange={(e) => (setName(e.target.value), setSaved(false))} aria-label="Template name" />
                  <textarea className="input min-h-56 font-mono text-[13px]" value={body} onChange={(e) => (setBody(e.target.value), setSaved(false))} aria-label="Template text" />
                  <p className="mt-2 text-xs text-muted">
                    Placeholders: {PLACEHOLDERS.map((p) => `{{${p}}}`).join("  ")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      kind="primary"
                      small
                      disabled={saved}
                      onClick={async () => {
                        await must(supabase.from("templates").update({ name: name.trim() || "Untitled", body }).eq("id", tpl.id));
                        setSaved(true);
                        state.reload();
                      }}
                    >
                      {saved ? "Saved" : "Save template"}
                    </Button>
                    <Button
                      small
                      kind="danger"
                      onClick={async () => {
                        if (!confirmDelete(`template "${tpl.name}"`)) return;
                        await must(supabase.from("templates").delete().eq("id", tpl.id));
                        setSelected(null);
                        state.reload();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select className="input" value={clientId} onChange={(e) => (setClientId(e.target.value), setQuoteId(""), setProjectId(""))} aria-label="Client">
                      <option value="">Client…</option>
                      {ctx.clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {clientLabel(c)}
                        </option>
                      ))}
                    </select>
                    <select className="input" value={quoteId} onChange={(e) => setQuoteId(e.target.value)} aria-label="Quotation" disabled={!clientId}>
                      <option value="">Quotation…</option>
                      {ctx.quotes.filter((q) => q.client_id === clientId).map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.ref}
                        </option>
                      ))}
                    </select>
                    <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label="Project" disabled={!clientId}>
                      <option value="">Project…</option>
                      {ctx.projects.filter((p) => p.client_id === clientId).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4 min-h-40 whitespace-pre-wrap rounded-xl border border-line/50 bg-bg p-4 text-sm">{preview}</div>
                  {/\{\{\w+\}\}/.test(preview) && <p className="mt-2 text-xs text-warning">Some placeholders are still empty — pick a client, quotation or project.</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyButton text={preview} label="Copy message" />
                    {wa && (
                      <a href={wa} target="_blank" rel="noreferrer">
                        <Button small>Open in WhatsApp</Button>
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </Async>
    </>
  );
}
