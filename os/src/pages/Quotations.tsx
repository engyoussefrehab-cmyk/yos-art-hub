import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { CURRENCIES, QUOTATION_STATUSES, clientLabel, date, money, options, today } from "../lib/format";
import { calcTotals } from "../lib/quote";
import type { Client, Currency, Quotation, QuotationItem, QuotationStatus, Service, Settings } from "../lib/types";
import { Async, Badge, Button, Card, Empty, ErrorBox, Loading, PageHeader, SearchInput, Section, Table, confirmDelete } from "../ui";
import { useSettings } from "../App";
import { clientOptions } from "./Clients";

/* ════════════════════════════════════════ list */

export function Quotations() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const state = useData(
    () =>
      must(
        supabase.from("quotations").select("*, clients(name,brand), quotation_totals").order("created_at", { ascending: false }),
      ) as Promise<Quotation[]>,
  );
  return (
    <>
      <PageHeader title="Quotations" actions={<Link to="/quotations/new"><Button kind="primary">+ New quotation</Button></Link>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search client, ref, title" />
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {options(QUOTATION_STATUSES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <Async state={state}>
        {(all) => {
          const term = q.trim().toLowerCase();
          const rows = all.filter(
            (x) => (!status || x.status === status) && (!term || [x.ref, x.title, x.clients?.name, x.clients?.brand].some((v) => v?.toLowerCase().includes(term))),
          );
          if (!all.length) return <Empty title="No quotations yet" hint="Create one from a lead or start here." />;
          if (!rows.length) return <Empty title="No quotations match" />;
          return (
            <Table head={["Ref", "Client", "Title", "Total", "Issued", "Expires", "Status"]}>
              {rows.map((x) => {
                const lapsed = x.status === "sent" && x.expiry_date && x.expiry_date < today();
                return (
                  <tr key={x.id}>
                    <td>
                      <Link to={`/quotations/${x.id}`} className="font-medium hover:text-accent">
                        {x.ref}
                      </Link>
                    </td>
                    <td>{clientLabel(x.clients)}</td>
                    <td className="text-muted">{x.title ?? "—"}</td>
                    <td>{money(x.quotation_totals?.total, x.currency)}</td>
                    <td className="text-muted">{date(x.issue_date)}</td>
                    <td className={lapsed ? "text-accent" : "text-muted"}>{date(x.expiry_date)}</td>
                    <td>
                      <Badge value={x.status} label={QUOTATION_STATUSES[x.status]} />
                      {lapsed && <div className="mt-1 text-xs text-accent">Past expiry</div>}
                    </td>
                  </tr>
                );
              })}
            </Table>
          );
        }}
      </Async>
    </>
  );
}

/* ════════════════════════════════════════ editor */

type Draft = Omit<Quotation, "id" | "ref" | "created_at" | "sent_at" | "clients" | "quotation_totals"> & { id?: string; ref?: string };

function blankDraft(s: Settings, clientId = "", leadId: string | null = null): Draft {
  return {
    client_id: clientId,
    lead_id: leadId,
    title: "",
    status: "draft",
    currency: s.default_currency,
    discount_type: "amount",
    discount_value: 0,
    tax_rate: 0,
    delivery_time: "",
    payment_terms: s.payment_terms ?? "",
    issue_date: today(),
    expiry_date: today(s.quotation_valid_days),
    notes: s.quotation_terms ?? "",
  };
}

const emptyItem = (sort: number): QuotationItem => ({ description: "", details: null, quantity: 1, unit_price: 0, sort });

export function QuotationEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { settings } = useSettings();
  const isNew = id === "new";

  const [draft, setDraft] = useState<Draft | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const refs = useData(async () => {
    const [clients, services] = await Promise.all([clientOptions(), must(supabase.from("services").select("*").eq("active", true).order("sort"))]);
    return { clients, services: services as Service[] };
  });

  useEffect(() => {
    (async () => {
      try {
        if (isNew) {
          setDraft(blankDraft(settings, params.get("client") ?? "", params.get("lead")));
          setItems([emptyItem(1)]);
          return;
        }
        const [q, its, proj] = await Promise.all([
          must(supabase.from("quotations").select("*").eq("id", id!).single()),
          must(supabase.from("quotation_items").select("*").eq("quotation_id", id!).order("sort")),
          must(supabase.from("projects").select("id").eq("quotation_id", id!).maybeSingle()),
        ]);
        const { created_at: _c, sent_at: _s, decided_at: _d, ...rest } = q as Quotation & { decided_at: string };
        setDraft(rest as Draft);
        setItems(its as QuotationItem[]);
        setProjectId((proj as { id: string } | null)?.id ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leads of the chosen client, for linking.
  const leads = useData(
    async () => (draft?.client_id ? must(supabase.from("leads").select("id,ref,requested_service").eq("client_id", draft.client_id).order("date", { ascending: false })) : []),
    [draft?.client_id],
  );

  const totals = useMemo(
    () => calcTotals(items, draft?.discount_type ?? "amount", draft?.discount_value ?? 0, draft?.tax_rate ?? 0),
    [items, draft?.discount_type, draft?.discount_value, draft?.tax_rate],
  );

  if (error) return <ErrorBox error={error} />;
  if (!draft || !refs.data) return <Loading />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => d && { ...d, [k]: v });
    setDirty(true);
  };
  const setItem = (i: number, patch: Partial<QuotationItem>) => {
    setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));
    setDirty(true);
  };
  const locked = draft.status === "accepted";

  /** Saves the quotation and its items. Returns the quotation id. */
  const save = async (): Promise<string> => {
    if (!draft.client_id) throw new Error("Choose a client.");
    const clean = items.filter((i) => i.description.trim());
    if (!clean.length) throw new Error("Add at least one line item.");
    const row = {
      client_id: draft.client_id,
      lead_id: draft.lead_id || null,
      title: draft.title?.trim() || null,
      currency: draft.currency,
      discount_type: draft.discount_type,
      discount_value: Number(draft.discount_value) || 0,
      tax_rate: Number(draft.tax_rate) || 0,
      delivery_time: draft.delivery_time?.trim() || null,
      payment_terms: draft.payment_terms?.trim() || null,
      issue_date: draft.issue_date,
      expiry_date: draft.expiry_date || null,
      notes: draft.notes?.trim() || null,
    };
    let qid = draft.id;
    if (qid) await must(supabase.from("quotations").update(row).eq("id", qid));
    else qid = (await must(supabase.from("quotations").insert(row).select("id").single())).id as string;
    // Replace items (simple and always consistent).
    await must(supabase.from("quotation_items").delete().eq("quotation_id", qid));
    await must(
      supabase.from("quotation_items").insert(
        clean.map((it, i) => ({
          quotation_id: qid,
          description: it.description.trim(),
          details: it.details?.trim() || null,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          sort: i + 1,
        })),
      ),
    );
    setDirty(false);
    return qid!;
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (s: QuotationStatus) =>
    run(async () => {
      const qid = await save();
      await must(supabase.from("quotations").update({ status: s }).eq("id", qid));
      if (s === "accepted") {
        const p = await must(supabase.from("projects").select("id").eq("quotation_id", qid).single());
        nav(`/projects/${p.id}`);
        return;
      }
      if (isNew) nav(`/quotations/${qid}`, { replace: true });
      else setDraft((d) => d && { ...d, status: s });
    });

  return (
    <>
      <PageHeader
        title={draft.ref ? `Quotation ${draft.ref}` : "New quotation"}
        sub={
          <span className="inline-flex items-center gap-2">
            <Badge value={draft.status} label={QUOTATION_STATUSES[draft.status]} />
            {dirty && <span className="text-warning">Unsaved changes</span>}
          </span>
        }
        actions={
          <>
            {draft.id && !dirty && (
              <Link to={`/quotations/${draft.id}/print`} target="_blank">
                <Button>PDF / Print</Button>
              </Link>
            )}
            {!locked && (
              <Button
                kind="primary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const qid = await save();
                    if (isNew) nav(`/quotations/${qid}`, { replace: true });
                  })
                }
              >
                {busy ? "Saving…" : "Save"}
              </Button>
            )}
          </>
        }
      />

      {locked && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-success/50 p-4 text-sm">
          <span>Accepted — this quotation is locked.</span>
          {projectId && (
            <Link to={`/projects/${projectId}`}>
              <Button small>Open project →</Button>
            </Link>
          )}
        </Card>
      )}

      <fieldset disabled={locked || busy} className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Client">
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Client *">
                <select className="input" value={draft.client_id} onChange={(e) => (set("client_id", e.target.value), set("lead_id", null))}>
                  <option value="">Choose…</option>
                  {refs.data.clients.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Linked lead">
                <select className="input" value={draft.lead_id ?? ""} onChange={(e) => set("lead_id", e.target.value || null)}>
                  <option value="">—</option>
                  {(leads.data ?? []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.ref} · {l.requested_service ?? "Inquiry"}
                    </option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Title (optional)" full>
                <input className="input" value={draft.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Nook Café — Visual identity" />
              </Labeled>
            </div>
          </Section>

          <Section
            title="Line items"
            actions={
              <select
                className="input w-auto py-1 text-xs"
                value=""
                aria-label="Add from service"
                onChange={(e) => {
                  const s = refs.data!.services.find((x) => x.id === e.target.value);
                  if (!s) return;
                  const it: QuotationItem = {
                    ...emptyItem(items.length + 1),
                    description: s.name,
                    details: s.deliverables,
                    unit_price: s.currency === draft.currency ? Number(s.default_price ?? 0) : 0,
                  };
                  setItems((l) => [...l.filter((x) => x.description.trim()), it]);
                  setDirty(true);
                }}
              >
                <option value="">+ Add from service…</option>
                {refs.data.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.default_price != null ? ` (${money(s.default_price, s.currency)})` : ""}
                  </option>
                ))}
              </select>
            }
          >
            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="rounded-xl border border-line/50 p-3">
                  <div className="grid grid-cols-[1fr_5rem_7rem_auto] items-start gap-2">
                    <input className="input" placeholder="Description" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} aria-label="Description" />
                    <input className="input" type="number" min="0.01" step="0.01" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value as unknown as number })} aria-label="Quantity" />
                    <input className="input" type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => setItem(i, { unit_price: e.target.value as unknown as number })} aria-label="Unit price" />
                    <button type="button" aria-label="Remove line" onClick={() => (setItems((l) => l.filter((_, j) => j !== i)), setDirty(true))} className="px-2 py-2 text-muted hover:text-accent">
                      ×
                    </button>
                  </div>
                  <textarea className="input mt-2 text-xs" rows={2} placeholder="Details / deliverables (optional)" value={it.details ?? ""} onChange={(e) => setItem(i, { details: e.target.value })} aria-label="Details" />
                  <p className="mt-1 text-right text-xs text-muted">Line total: {money(calcTotals([it], "amount", 0, 0).subtotal, draft.currency)}</p>
                </div>
              ))}
              <Button small onClick={() => (setItems((l) => [...l, emptyItem(l.length + 1)]), setDirty(true))}>
                + Add line
              </Button>
            </div>
          </Section>

          <Section title="Terms">
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Issue date">
                <input className="input" type="date" value={draft.issue_date} onChange={(e) => set("issue_date", e.target.value)} />
              </Labeled>
              <Labeled label="Valid until">
                <input className="input" type="date" value={draft.expiry_date ?? ""} onChange={(e) => set("expiry_date", e.target.value)} />
              </Labeled>
              <Labeled label="Delivery time">
                <input className="input" value={draft.delivery_time ?? ""} onChange={(e) => set("delivery_time", e.target.value)} placeholder="e.g. 3–4 weeks" />
              </Labeled>
              <Labeled label="Payment terms">
                <input className="input" value={draft.payment_terms ?? ""} onChange={(e) => set("payment_terms", e.target.value)} />
              </Labeled>
              <Labeled label="Notes & terms (shown on the PDF)" full>
                <textarea className="input" rows={4} value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
              </Labeled>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Pricing">
            <div className="space-y-4">
              <Labeled label="Currency">
                <select className="input" value={draft.currency} onChange={(e) => set("currency", e.target.value as Currency)}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Labeled>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Labeled label="Discount">
                  <input className="input" type="number" min="0" step="0.01" value={draft.discount_value} onChange={(e) => set("discount_value", e.target.value as unknown as number)} />
                </Labeled>
                <Labeled label="Type">
                  <select className="input" value={draft.discount_type} onChange={(e) => set("discount_type", e.target.value as "amount" | "percent")}>
                    <option value="amount">{draft.currency}</option>
                    <option value="percent">%</option>
                  </select>
                </Labeled>
              </div>
              <Labeled label="Tax (%)">
                <input className="input" type="number" min="0" max="100" step="0.01" value={draft.tax_rate} onChange={(e) => set("tax_rate", e.target.value as unknown as number)} />
              </Labeled>
            </div>
            <dl className="mt-5 space-y-1.5 border-t border-line/60 pt-4 text-sm">
              <Row k="Subtotal" v={money(totals.subtotal, draft.currency)} />
              {totals.discount > 0 && <Row k="Discount" v={`− ${money(totals.discount, draft.currency)}`} />}
              {totals.tax > 0 && <Row k={`Tax ${Number(draft.tax_rate)}%`} v={money(totals.tax, draft.currency)} />}
              <div className="flex justify-between pt-2 text-lg font-semibold">
                <dt>Total</dt>
                <dd>{money(totals.total, draft.currency)}</dd>
              </div>
            </dl>
          </Section>

          {!locked && (
            <Section title="Status">
              <p className="mb-3 text-xs text-muted">Change the status yourself after you send or hear back — nothing is sent automatically.</p>
              <div className="flex flex-wrap gap-2">
                {draft.status !== "sent" && <Button small onClick={() => setStatus("sent")}>Mark as sent</Button>}
                <Button small kind="primary" onClick={() => setStatus("accepted")}>
                  Accepted → create project
                </Button>
                {draft.status !== "rejected" && <Button small onClick={() => setStatus("rejected")}>Rejected</Button>}
                {draft.status !== "expired" && <Button small onClick={() => setStatus("expired")}>Expired</Button>}
                {draft.status !== "draft" && <Button small kind="ghost" onClick={() => setStatus("draft")}>Back to draft</Button>}
              </div>
            </Section>
          )}

          {draft.id && !locked && (
            <Button
              small
              kind="danger"
              onClick={() =>
                run(async () => {
                  if (!confirmDelete(`quotation ${draft.ref}`)) return;
                  await must(supabase.from("quotations").delete().eq("id", draft.id!));
                  nav("/quotations");
                })
              }
            >
              Delete quotation
            </Button>
          )}
        </div>
      </fieldset>
    </>
  );
}

function Labeled({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-muted">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

/* ════════════════════════════════════════ printable document */

export function QuotationPrint() {
  const { id } = useParams();
  const { settings } = useSettings();
  const state = useData(async () => {
    const [q, items] = await Promise.all([
      must(supabase.from("quotations").select("*, clients(*), quotation_totals").eq("id", id!).single()),
      must(supabase.from("quotation_items").select("*").eq("quotation_id", id!).order("sort")),
    ]);
    return { q: q as Quotation & { clients: Client }, items: items as QuotationItem[] };
  }, [id]);

  useEffect(() => {
    if (state.data) document.title = `${settings.business_name} — Quotation ${state.data.q.ref}`;
  }, [state.data, settings.business_name]);

  return (
    <Async state={state}>
      {({ q, items }) => {
        const t = q.quotation_totals!;
        const c = q.clients;
        return (
          <div className="min-h-screen bg-white text-black print:min-h-0">
            <div className="no-print sticky top-0 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-6 py-3">
              <Link to={`/quotations/${q.id}`} className="text-sm text-neutral-600 hover:text-black">
                ← Back
              </Link>
              <button type="button" onClick={() => window.print()} className="rounded-full bg-[var(--yr-accent)] px-5 py-2 text-sm font-semibold text-black">
                Print / Save as PDF
              </button>
            </div>

            <article className="mx-auto max-w-[800px] px-8 py-12 text-[13px] leading-relaxed print:p-0">
              <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-6">
                <div>
                  <img src={settings.logo_url || "/brand/logo-full.png"} alt={settings.business_name} className="h-10 w-auto [filter:brightness(0)]" />
                  <div className="mt-3 text-[11px] text-neutral-600">
                    {[settings.owner_name, settings.email, settings.phone, settings.website, settings.address].filter(Boolean).map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--yr-accent)]">Quotation</div>
                  <div className="mt-1 text-2xl font-semibold">{q.ref}</div>
                  <div className="mt-2 text-[11px] text-neutral-600">
                    <div>Issued {date(q.issue_date)}</div>
                    {q.expiry_date && <div>Valid until {date(q.expiry_date)}</div>}
                  </div>
                </div>
              </header>

              <section className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Prepared for</div>
                  <div className="mt-1 text-base font-semibold">{c.brand || c.name}</div>
                  {c.brand && <div>{c.name}</div>}
                  <div className="text-neutral-600">{[c.email, c.phone, c.country].filter(Boolean).join(" · ")}</div>
                </div>
                {q.title && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Project</div>
                    <div className="mt-1 text-base font-semibold">{q.title}</div>
                  </div>
                )}
              </section>

              <table className="mt-8 w-full border-collapse">
                <thead>
                  <tr className="border-b border-black text-left text-[10px] uppercase tracking-widest text-neutral-500">
                    <th className="py-2 pr-2 font-semibold">Description</th>
                    <th className="w-16 py-2 text-right font-semibold">Qty</th>
                    <th className="w-28 py-2 text-right font-semibold">Unit price</th>
                    <th className="w-32 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="break-inside-avoid border-b border-neutral-200 align-top">
                      <td className="py-3 pr-2">
                        <div className="font-medium">{it.description}</div>
                        {it.details && <div className="mt-0.5 whitespace-pre-line text-[11px] text-neutral-600">{it.details}</div>}
                      </td>
                      <td className="py-3 text-right">{Number(it.quantity)}</td>
                      <td className="py-3 text-right">{money(it.unit_price, q.currency)}</td>
                      <td className="py-3 text-right">{money(Math.round(it.quantity * it.unit_price * 100) / 100, q.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 ml-auto w-72 break-inside-avoid space-y-1">
                <PRow k="Subtotal" v={money(t.subtotal, q.currency)} />
                {Number(t.discount) > 0 && (
                  <PRow k={`Discount${q.discount_type === "percent" ? ` (${Number(q.discount_value)}%)` : ""}`} v={`− ${money(t.discount, q.currency)}`} />
                )}
                {Number(t.tax) > 0 && <PRow k={`Tax (${Number(q.tax_rate)}%)`} v={money(t.tax, q.currency)} />}
                <div className="flex justify-between border-t-2 border-black pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>{money(t.total, q.currency)}</span>
                </div>
              </div>

              <section className="mt-10 grid break-inside-avoid grid-cols-2 gap-6 border-t border-neutral-200 pt-6">
                {q.delivery_time && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Delivery</div>
                    <div className="mt-1">{q.delivery_time}</div>
                  </div>
                )}
                {q.payment_terms && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Payment terms</div>
                    <div className="mt-1">{q.payment_terms}</div>
                  </div>
                )}
                {q.notes && (
                  <div className="col-span-2">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Notes & terms</div>
                    <div className="mt-1 whitespace-pre-line text-neutral-700">{q.notes}</div>
                  </div>
                )}
              </section>

              <footer className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-4 text-[10px] text-neutral-500">
                <span>{settings.business_name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--yr-accent)]" />
                <span>{settings.website}</span>
              </footer>
            </article>
          </div>
        );
      }}
    </Async>
  );
}

function PRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-neutral-700">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
