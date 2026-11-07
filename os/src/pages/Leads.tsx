import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { CURRENCIES, LEAD_STATUSES, PRIORITIES, SOURCES, clientLabel, date, money, options, today, whatsappLink } from "../lib/format";
import type { Lead, LeadStatus } from "../lib/types";
import { Async, Badge, Button, Card, Empty, Modal, PageHeader, RecordForm, SearchInput, Table, confirmDelete, type FieldDef } from "../ui";
import { clientOptions } from "./Clients";

const leadFields = (clients: { value: string; label: string }[], services: { value: string; label: string }[]): FieldDef[] => [
  { name: "client_id", label: "Client", type: "select", options: clients, required: true, full: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "source", label: "Source", type: "select", options: options(SOURCES), required: true },
  { name: "service_id", label: "Requested service", type: "select", options: services },
  { name: "status", label: "Status", type: "select", options: options(LEAD_STATUSES), required: true },
  { name: "budget", label: "Budget", type: "number" },
  { name: "currency", label: "Currency", type: "select", options: CURRENCIES.map((c) => ({ value: c, label: c })) },
  { name: "desired_start", label: "Desired start", type: "date" },
  { name: "priority", label: "Priority", type: "select", options: options(PRIORITIES), required: true },
  { name: "next_follow_up", label: "Next follow-up", type: "date" },
  { name: "brief", label: "Brief", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

// Fast entry for inquiries that arrive in DMs: creates the client and the lead together.
const quickFields = (services: { value: string; label: string }[]): FieldDef[] => [
  { name: "name", label: "Client name", required: true },
  { name: "phone", label: "Phone / WhatsApp", type: "tel" },
  { name: "brand", label: "Brand" },
  { name: "source", label: "Came from", type: "select", options: options(SOURCES), required: true },
  { name: "service_id", label: "Service", type: "select", options: services },
  { name: "next_follow_up", label: "Follow up on", type: "date" },
  { name: "brief", label: "What they asked for", type: "textarea" },
];

const SELECT = "*, clients(name,brand,phone,email), services(name)";

export function Leads() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("open");
  const [source, setSource] = useState<string>("");
  const [view, setView] = useState<"table" | "board">(() => (localStorage.getItem("leads-view") as "board") || "table");
  const [form, setForm] = useState<{ mode: "quick" | "full"; lead?: Partial<Lead> } | null>(null);

  const state = useData(async () => {
    const [leads, clients, services] = await Promise.all([
      must(supabase.from("leads").select(SELECT).order("date", { ascending: false }).order("created_at", { ascending: false })),
      clientOptions(),
      must(supabase.from("services").select("id,name").order("sort")),
    ]);
    return { leads: leads as Lead[], clients, services: services.map((s) => ({ value: s.id, label: s.name })) };
  });

  // Deep links: ?new=<clientId> and ?open=<leadId>
  useEffect(() => {
    if (!state.data) return;
    const newFor = params.get("new");
    const open = params.get("open");
    if (newFor) setForm({ mode: "full", lead: { client_id: newFor } });
    if (open) {
      const l = state.data.leads.find((x) => x.id === open);
      if (l) setForm({ mode: "full", lead: l });
    }
    if (newFor || open) setParams({}, { replace: true });
  }, [state.data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      localStorage.setItem("leads-view", view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const close = () => setForm(null);
  const save = async (v: Record<string, unknown>) => {
    const row = { ...v, requested_service: state.data?.services.find((s) => s.value === v.service_id)?.label ?? null };
    if (form?.lead?.id) await must(supabase.from("leads").update(row).eq("id", form.lead.id));
    else await must(supabase.from("leads").insert(row));
    close();
    state.reload();
  };
  const setLeadStatus = async (id: string, s: LeadStatus) => {
    state.setData((d) => d && { ...d, leads: d.leads.map((l) => (l.id === id ? { ...l, status: s } : l)) });
    await must(supabase.from("leads").update({ status: s }).eq("id", id));
  };

  return (
    <>
      <PageHeader
        title="Leads"
        actions={
          <>
            <Button onClick={() => setForm({ mode: "quick" })}>+ Quick add (DM)</Button>
            <Button kind="primary" onClick={() => setForm({ mode: "full", lead: {} })}>
              + New lead
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search client, brief, ref" />
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="open">Open (not won/lost)</option>
          <option value="">All statuses</option>
          {options(LEAD_STATUSES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source">
          <option value="">All sources</option>
          {options(SOURCES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex rounded-full border border-line p-0.5 text-xs">
          {(["table", "board"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full px-3 py-1 capitalize ${view === v ? "bg-surface-2 text-fg" : "text-muted"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <Async state={state}>
        {({ leads }) => {
          const term = q.trim().toLowerCase();
          const rows = leads.filter(
            (l) =>
              (status === "open" ? !["won", "lost"].includes(l.status) : !status || l.status === status) &&
              (!source || l.source === source) &&
              (!term || [l.ref, l.brief, l.requested_service, l.clients?.name, l.clients?.brand, l.clients?.phone].some((v) => v?.toLowerCase().includes(term))),
          );
          if (!leads.length)
            return <Empty title="No leads yet" hint="Add one from a DM with Quick add, or share the public inquiry form link." action={<Button kind="primary" onClick={() => setForm({ mode: "quick" })}>+ Quick add</Button>} />;
          if (!rows.length) return <Empty title="No leads match these filters" />;

          if (view === "board") {
            const cols = (Object.keys(LEAD_STATUSES) as LeadStatus[]).filter((s) => status !== "open" || !["won", "lost"].includes(s));
            return (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {cols.map((s) => {
                  const items = rows.filter((l) => l.status === s);
                  return (
                    <div key={s} className="w-64 shrink-0">
                      <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
                        <span className="font-medium uppercase tracking-wide">{LEAD_STATUSES[s]}</span>
                        <span>{items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map((l) => (
                          <Card key={l.id} className="p-3 text-sm">
                            <button type="button" className="w-full text-left" onClick={() => setForm({ mode: "full", lead: l })}>
                              <p className="font-medium">{clientLabel(l.clients)}</p>
                              <p className="mt-0.5 text-xs text-muted">
                                {l.ref} · {l.services?.name ?? l.requested_service ?? "—"}
                              </p>
                              {l.next_follow_up && <p className={`mt-1 text-xs ${l.next_follow_up < today() ? "text-accent" : "text-muted"}`}>Follow up {date(l.next_follow_up)}</p>}
                            </button>
                            <select className="input mt-2 py-1 text-xs" value={l.status} onChange={(e) => setLeadStatus(l.id, e.target.value as LeadStatus)} aria-label="Move to">
                              {options(LEAD_STATUSES).map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <Table head={["Ref", "Client", "Service", "Source", "Budget", "Status", "Follow-up", ""]}>
              {rows.map((l) => {
                const wa = whatsappLink(l.clients?.phone);
                return (
                  <tr key={l.id}>
                    <td className="text-muted">
                      {l.ref}
                      <div className="text-xs">{date(l.date)}</div>
                    </td>
                    <td>
                      <Link to={`/clients/${l.client_id}`} className="font-medium hover:text-accent">
                        {l.clients?.name}
                      </Link>
                      {l.clients?.brand && <div className="text-xs text-muted">{l.clients.brand}</div>}
                    </td>
                    <td className="text-muted">{l.services?.name ?? l.requested_service ?? "—"}</td>
                    <td className="text-muted">{SOURCES[l.source]}</td>
                    <td className="text-muted">{money(l.budget, l.currency)}</td>
                    <td>
                      <select className="input w-auto py-1 text-xs" value={l.status} onChange={(e) => setLeadStatus(l.id, e.target.value as LeadStatus)} aria-label={`Status of ${l.ref}`}>
                        {options(LEAD_STATUSES).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      {l.priority === "high" && <div className="mt-1"><Badge value="high" label="High priority" /></div>}
                    </td>
                    <td className={l.next_follow_up && l.next_follow_up < today() ? "text-accent" : "text-muted"}>{date(l.next_follow_up)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {wa && (
                          <a href={wa} target="_blank" rel="noreferrer">
                            <Button small kind="ghost">WhatsApp</Button>
                          </a>
                        )}
                        <Button small kind="ghost" onClick={() => nav(`/quotations/new?client=${l.client_id}&lead=${l.id}`)}>
                          Quote
                        </Button>
                        <Button small onClick={() => setForm({ mode: "full", lead: l })}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          );
        }}
      </Async>

      <Modal open={!!form} onClose={close} title={form?.mode === "quick" ? "Quick add from a DM" : form?.lead?.id ? `Edit ${form.lead.ref}` : "New lead"} wide>
        {form && state.data && form.mode === "quick" && (
          <RecordForm
            fields={quickFields(state.data.services)}
            initial={{ source: "instagram", next_follow_up: today(1) }}
            submitLabel="Save lead"
            onCancel={close}
            onSubmit={async (v) => {
              const client = await must(
                supabase.from("clients").insert({ name: v.name, phone: v.phone, brand: v.brand, source: v.source }).select("id").single(),
              );
              await must(
                supabase.from("leads").insert({
                  client_id: client.id,
                  source: v.source,
                  service_id: v.service_id,
                  requested_service: state.data!.services.find((s) => s.value === v.service_id)?.label ?? null,
                  brief: v.brief,
                  next_follow_up: v.next_follow_up,
                }),
              );
              close();
              state.reload();
            }}
          />
        )}
        {form && state.data && form.mode === "full" && (
          <>
            {state.data.clients.length === 0 ? (
              <Empty title="Add a client first" action={<Button onClick={() => setForm({ mode: "quick" })}>Use quick add instead</Button>} />
            ) : (
              <RecordForm
                fields={leadFields(state.data.clients, state.data.services)}
                initial={{ date: today(), source: "instagram", status: "new_inquiry", priority: "normal", ...(form.lead as Record<string, unknown>) }}
                onCancel={close}
                onSubmit={save}
              />
            )}
            {form.lead?.id && (
              <div className="mt-4 border-t border-line/60 pt-4">
                <Button
                  small
                  kind="danger"
                  onClick={async () => {
                    if (!confirmDelete(`lead ${form.lead!.ref}`)) return;
                    await must(supabase.from("leads").delete().eq("id", form.lead!.id!));
                    close();
                    state.reload();
                  }}
                >
                  Delete lead
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
