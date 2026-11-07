import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { CURRENCIES, PROJECT_STATUSES, clientLabel, date, money, moneyMap, options, sumByCurrency, today, whatsappLink } from "../lib/format";
import type { Client, Payment, Project, ProjectItem, ProjectStatus } from "../lib/types";
import { Async, Badge, Button, Empty, Modal, PageHeader, RecordForm, SearchInput, Section, Table, confirmDelete, type FieldDef } from "../ui";
import { clientOptions } from "./Clients";

const projectFields = (clients: { value: string; label: string }[]): FieldDef[] => [
  { name: "name", label: "Project name", required: true, full: true },
  { name: "client_id", label: "Client", type: "select", options: clients, required: true },
  { name: "service", label: "Service" },
  { name: "budget", label: "Budget", type: "number" },
  { name: "currency", label: "Currency", type: "select", options: CURRENCIES.map((c) => ({ value: c, label: c })), required: true },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "due_date", label: "Due date", type: "date" },
  { name: "status", label: "Status", type: "select", options: options(PROJECT_STATUSES), required: true },
  { name: "notes", label: "Notes", type: "textarea" },
];

const PAYMENT_FIELDS: FieldDef[] = [
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "currency", label: "Currency", type: "select", options: CURRENCIES.map((c) => ({ value: c, label: c })), required: true },
  { name: "paid_on", label: "Paid on", type: "date", required: true },
  { name: "method", label: "Method", placeholder: "Bank transfer, InstaPay, PayPal…" },
  { name: "note", label: "Note", full: true },
];

/** Paid / outstanding in the project's own currency (other-currency payments are listed separately). */
export function balance(p: Pick<Project, "budget" | "currency">, payments: Pick<Payment, "amount" | "currency">[]) {
  const paid = payments.filter((x) => x.currency === p.currency).reduce((s, x) => s + Number(x.amount), 0);
  const other = payments.filter((x) => x.currency !== p.currency);
  const outstanding = p.budget == null ? null : Math.max(0, Math.round((Number(p.budget) - paid) * 100) / 100);
  return { paid: Math.round(paid * 100) / 100, outstanding, other };
}

/* ════════════════════════════════════════ list */

export function Projects() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("active");
  const [creating, setCreating] = useState(false);
  const state = useData(async () => {
    const [projects, clients] = await Promise.all([
      must(supabase.from("projects").select("*, clients(name,brand), payments(amount,currency)").order("created_at", { ascending: false })),
      clientOptions(),
    ]);
    return { projects: projects as Project[], clients };
  });

  return (
    <>
      <PageHeader title="Projects" actions={<Button kind="primary" onClick={() => setCreating(true)}>+ New project</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search project or client" />
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="active">Active</option>
          <option value="">All</option>
          {options(PROJECT_STATUSES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <Async state={state}>
        {({ projects }) => {
          const term = q.trim().toLowerCase();
          const rows = projects.filter(
            (p) =>
              (status === "active" ? !["completed", "cancelled"].includes(p.status) : !status || p.status === status) &&
              (!term || [p.ref, p.name, p.clients?.name, p.clients?.brand].some((v) => v?.toLowerCase().includes(term))),
          );
          if (!projects.length) return <Empty title="No projects yet" hint="Mark a quotation as Accepted and its project is created for you." />;
          if (!rows.length) return <Empty title="No projects match" />;
          return (
            <Table head={["Project", "Client", "Due", "Budget", "Outstanding", "Status"]}>
              {rows.map((p) => {
                const b = balance(p, p.payments ?? []);
                const late = p.due_date && p.due_date < today() && !["completed", "cancelled"].includes(p.status);
                return (
                  <tr key={p.id} className="cursor-pointer" onClick={() => nav(`/projects/${p.id}`)}>
                    <td>
                      <Link to={`/projects/${p.id}`} className="font-medium hover:text-accent" onClick={(e) => e.stopPropagation()}>
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted">{p.ref}</div>
                    </td>
                    <td className="text-muted">{clientLabel(p.clients)}</td>
                    <td className={late ? "text-accent" : "text-muted"}>{date(p.due_date)}</td>
                    <td>{money(p.budget, p.currency)}</td>
                    <td className={b.outstanding ? "text-warning" : "text-muted"}>{b.outstanding == null ? "—" : money(b.outstanding, p.currency)}</td>
                    <td>
                      <Badge value={p.status} label={PROJECT_STATUSES[p.status]} />
                    </td>
                  </tr>
                );
              })}
            </Table>
          );
        }}
      </Async>
      <Modal open={creating} onClose={() => setCreating(false)} title="New project">
        {creating && state.data && (
          <RecordForm
            fields={projectFields(state.data.clients)}
            initial={{ currency: "USD", status: "not_started", start_date: today() }}
            onCancel={() => setCreating(false)}
            onSubmit={async (v) => {
              const p = await must(supabase.from("projects").insert(v).select("id").single());
              nav(`/projects/${p.id}`);
            }}
          />
        )}
      </Modal>
    </>
  );
}

/* ════════════════════════════════════════ detail */

export function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [payment, setPayment] = useState<Partial<Payment> | null>(null);

  const state = useData(async () => {
    const [project, items, payments, clients] = await Promise.all([
      must(supabase.from("projects").select("*, clients(*), quotations(ref)").eq("id", id!).single()),
      must(supabase.from("project_items").select("*").eq("project_id", id!).order("sort").order("created_at")),
      must(supabase.from("payments").select("*").eq("project_id", id!).order("paid_on", { ascending: false })),
      clientOptions(),
    ]);
    return {
      project: project as Project & { clients: Client; quotations: { ref: string } | null },
      items: items as ProjectItem[],
      payments: payments as Payment[],
      clients,
    };
  }, [id]);

  return (
    <Async state={state}>
      {({ project: p, items, payments, clients }) => {
        const b = balance(p, payments);
        const wa = whatsappLink(p.clients.phone);
        const setStatus = async (s: ProjectStatus) => {
          await must(supabase.from("projects").update({ status: s }).eq("id", p.id));
          state.reload();
        };
        return (
          <>
            <PageHeader
              title={p.name}
              sub={
                <>
                  {p.ref} ·{" "}
                  <Link to={`/clients/${p.client_id}`} className="hover:text-fg">
                    {clientLabel(p.clients)}
                  </Link>
                  {p.quotations && p.quotation_id && (
                    <>
                      {" "}· from{" "}
                      <Link to={`/quotations/${p.quotation_id}`} className="hover:text-fg">
                        {p.quotations.ref}
                      </Link>
                    </>
                  )}
                </>
              }
              actions={
                <>
                  <select className="input w-auto" value={p.status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} aria-label="Project status">
                    {options(PROJECT_STATUSES).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer">
                      <Button>WhatsApp</Button>
                    </a>
                  )}
                  <Button onClick={() => setEdit(true)}>Edit</Button>
                </>
              }
            />

            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Budget" value={money(p.budget, p.currency)} />
              <Stat label="Paid" value={money(b.paid, p.currency)} />
              <Stat label="Outstanding" value={b.outstanding == null ? "—" : money(b.outstanding, p.currency)} accent={!!b.outstanding} />
              <Stat label="Due" value={date(p.due_date)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Checklist title="Tasks" kind="task" projectId={p.id} items={items.filter((i) => i.kind === "task")} reload={state.reload} />
              <Checklist title="Deliverables" kind="deliverable" projectId={p.id} items={items.filter((i) => i.kind === "deliverable")} reload={state.reload} />

              <Section title="Payments" actions={<Button small onClick={() => setPayment({ currency: p.currency, paid_on: today() })}>+ Record payment</Button>}>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted">No payments yet.</p>
                ) : (
                  <ul className="divide-y divide-line/40 text-sm">
                    {payments.map((x) => (
                      <li key={x.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div>
                          <div className="font-medium">{money(x.amount, x.currency)}</div>
                          <div className="text-xs text-muted">{[date(x.paid_on), x.method, x.note].filter(Boolean).join(" · ")}</div>
                        </div>
                        <Button small kind="ghost" onClick={() => setPayment(x)}>
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {b.other.length > 0 && (
                  <p className="mt-3 text-xs text-warning">
                    Also received in other currencies: {moneyMap(sumByCurrency(b.other))} — not counted against the {p.currency} budget.
                  </p>
                )}
              </Section>

              <Section title="Details">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Service</dt>
                    <dd>{p.service || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Start</dt>
                    <dd>{date(p.start_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Notes</dt>
                    <dd className="whitespace-pre-wrap">{p.notes || "—"}</dd>
                  </div>
                </dl>
                <Button
                  small
                  kind="danger"
                  className="mt-5"
                  onClick={async () => {
                    if (!confirmDelete(`project ${p.ref} with its tasks and payments`)) return;
                    await must(supabase.from("projects").delete().eq("id", p.id));
                    nav("/projects");
                  }}
                >
                  Delete project
                </Button>
              </Section>
            </div>

            <Modal open={edit} onClose={() => setEdit(false)} title="Edit project">
              <RecordForm
                fields={projectFields(clients)}
                initial={p as never}
                onCancel={() => setEdit(false)}
                onSubmit={async (v) => {
                  await must(supabase.from("projects").update(v).eq("id", p.id));
                  setEdit(false);
                  state.reload();
                }}
              />
            </Modal>
            <Modal open={!!payment} onClose={() => setPayment(null)} title={payment?.id ? "Edit payment" : "Record payment"}>
              {payment && (
                <>
                  <RecordForm
                    fields={PAYMENT_FIELDS}
                    initial={payment as Record<string, unknown>}
                    onCancel={() => setPayment(null)}
                    onSubmit={async (v) => {
                      if (payment.id) await must(supabase.from("payments").update(v).eq("id", payment.id));
                      else await must(supabase.from("payments").insert({ ...v, project_id: p.id }));
                      setPayment(null);
                      state.reload();
                    }}
                  />
                  {payment.id && (
                    <Button
                      small
                      kind="danger"
                      className="mt-2"
                      onClick={async () => {
                        if (!confirmDelete("this payment")) return;
                        await must(supabase.from("payments").delete().eq("id", payment.id!));
                        setPayment(null);
                        state.reload();
                      }}
                    >
                      Delete payment
                    </Button>
                  )}
                </>
              )}
            </Modal>
          </>
        );
      }}
    </Async>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-card border border-line/60 bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${accent ? "text-warning" : ""}`}>{value}</div>
    </div>
  );
}

function Checklist({ title, kind, projectId, items, reload }: { title: string; kind: "task" | "deliverable"; projectId: string; items: ProjectItem[]; reload: () => void }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const done = items.filter((i) => i.done).length;
  return (
    <Section title={`${title}${items.length ? ` (${done}/${items.length})` : ""}`}>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.id} className="group flex items-start gap-3 rounded-lg px-1 py-1.5 hover:bg-surface-2">
            <input
              type="checkbox"
              checked={it.done}
              aria-label={it.title}
              className="mt-1 h-4 w-4 accent-[var(--yr-accent)]"
              onChange={async (e) => {
                await must(supabase.from("project_items").update({ done: e.target.checked }).eq("id", it.id));
                reload();
              }}
            />
            <div className="min-w-0 flex-1 text-sm">
              <span className={it.done ? "text-muted line-through" : ""}>{it.title}</span>
              {it.due_date && <span className={`ml-2 text-xs ${!it.done && it.due_date < today() ? "text-accent" : "text-muted"}`}>{date(it.due_date)}</span>}
            </div>
            <button
              type="button"
              aria-label={`Delete ${it.title}`}
              className="px-1 text-muted opacity-0 hover:text-accent group-hover:opacity-100 focus:opacity-100"
              onClick={async () => {
                await must(supabase.from("project_items").delete().eq("id", it.id));
                reload();
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await must(supabase.from("project_items").insert({ project_id: projectId, kind, title: text.trim(), due_date: due || null, sort: items.length + 1 }));
          setText("");
          setDue("");
          reload();
        }}
      >
        <input className="input" placeholder={`Add ${kind}…`} value={text} onChange={(e) => setText(e.target.value)} aria-label={`New ${kind}`} />
        <input className="input w-36" type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
        <Button type="submit">Add</Button>
      </form>
    </Section>
  );
}
