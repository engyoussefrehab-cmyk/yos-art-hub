import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { LEAD_STATUSES, PROJECT_STATUSES, QUOTATION_STATUSES, SOURCES, clientLabel, date, money, options, whatsappLink } from "../lib/format";
import type { Client, Lead, Project, Quotation } from "../lib/types";
import { Async, Badge, Button, Empty, Modal, PageHeader, RecordForm, SearchInput, Section, Table, confirmDelete, type FieldDef } from "../ui";

export const CLIENT_FIELDS: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "brand", label: "Business / brand" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", placeholder: "+966…" },
  { name: "country", label: "Country" },
  { name: "language", label: "Preferred language", type: "select", options: [{ value: "en", label: "English" }, { value: "ar", label: "Arabic" }] },
  { name: "source", label: "Source", type: "select", options: options(SOURCES) },
  { name: "notes", label: "Notes", type: "textarea" },
];

/** All clients for dropdowns, newest first. */
export async function clientOptions() {
  const rows = await must(supabase.from("clients").select("id,name,brand").order("created_at", { ascending: false }));
  return rows.map((c) => ({ value: c.id, label: clientLabel(c) }));
}

export function Clients() {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Client> | null>(null);
  const nav = useNavigate();
  const state = useData(() => must(supabase.from("clients").select("*").order("created_at", { ascending: false })) as Promise<Client[]>);

  const term = q.trim().toLowerCase();
  const rows = (state.data ?? []).filter(
    (c) => !term || [c.name, c.brand, c.email, c.phone, c.country].some((v) => v?.toLowerCase().includes(term)),
  );

  return (
    <>
      <PageHeader
        title="Clients"
        sub={state.data ? `${state.data.length} total` : undefined}
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, brand, email, phone" />
            <Button kind="primary" onClick={() => setEditing({})}>
              + New client
            </Button>
          </>
        }
      />
      <Async state={state}>
        {() =>
          rows.length === 0 ? (
            <Empty title={term ? "No clients match your search" : "No clients yet"} hint="Clients are also created automatically from the inquiry form." />
          ) : (
            <Table head={["Name", "Brand", "Contact", "Country", "Source", "Added"]}>
              {rows.map((c) => (
                <tr key={c.id} className="cursor-pointer" onClick={() => nav(`/clients/${c.id}`)}>
                  <td className="font-medium">
                    <Link to={`/clients/${c.id}`} onClick={(e) => e.stopPropagation()}>
                      {c.name}
                    </Link>
                  </td>
                  <td className="text-muted">{c.brand ?? "—"}</td>
                  <td className="text-muted">{c.email || c.phone || "—"}</td>
                  <td className="text-muted">{c.country ?? "—"}</td>
                  <td className="text-muted">{c.source ? SOURCES[c.source] : "—"}</td>
                  <td className="text-muted">{date(c.created_at)}</td>
                </tr>
              ))}
            </Table>
          )
        }
      </Async>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="New client">
        <RecordForm
          fields={CLIENT_FIELDS}
          onCancel={() => setEditing(null)}
          onSubmit={async (v) => {
            const c = await must(supabase.from("clients").insert(v).select("id").single());
            setEditing(null);
            nav(`/clients/${c.id}`);
          }}
        />
      </Modal>
    </>
  );
}

export function ClientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const state = useData(async () => {
    const [client, leads, quotes, projects] = await Promise.all([
      must(supabase.from("clients").select("*").eq("id", id!).single()),
      must(supabase.from("leads").select("*").eq("client_id", id!).order("date", { ascending: false })),
      must(supabase.from("quotations").select("*, quotation_totals").eq("client_id", id!).order("created_at", { ascending: false })),
      must(supabase.from("projects").select("*").eq("client_id", id!).order("created_at", { ascending: false })),
    ]);
    return { client: client as Client, leads: leads as Lead[], quotes: quotes as Quotation[], projects: projects as Project[] };
  }, [id]);

  return (
    <Async state={state}>
      {({ client, leads, quotes, projects }) => {
        const wa = whatsappLink(client.phone);
        return (
          <>
            <PageHeader
              title={client.name}
              sub={[client.brand, client.country, client.source && SOURCES[client.source]].filter(Boolean).join(" · ") || undefined}
              actions={
                <>
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer">
                      <Button>WhatsApp</Button>
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`}>
                      <Button>Email</Button>
                    </a>
                  )}
                  <Button onClick={() => setEdit(true)}>Edit</Button>
                  <Button
                    kind="danger"
                    onClick={async () => {
                      if (!confirmDelete(`${client.name} and all their leads, quotations and projects`)) return;
                      await must(supabase.from("clients").delete().eq("id", client.id));
                      nav("/clients");
                    }}
                  >
                    Delete
                  </Button>
                </>
              }
            />
            <div className="grid gap-5 lg:grid-cols-3">
              <Section title="Details">
                <dl className="space-y-3 text-sm">
                  {(
                    [
                      ["Email", client.email],
                      ["Phone", client.phone],
                      ["Language", client.language === "ar" ? "Arabic" : client.language === "en" ? "English" : null],
                      ["Added", date(client.created_at)],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="break-words">{v || "—"}</dd>
                    </div>
                  ))}
                  {client.notes && (
                    <div>
                      <dt className="text-xs text-muted">Notes</dt>
                      <dd className="whitespace-pre-wrap">{client.notes}</dd>
                    </div>
                  )}
                </dl>
              </Section>
              <div className="space-y-5 lg:col-span-2">
                <Section title={`Leads (${leads.length})`} actions={<Link to={`/leads?new=${client.id}`}><Button small>+ Lead</Button></Link>}>
                  {leads.length === 0 ? <p className="text-sm text-muted">No leads.</p> : (
                    <ul className="divide-y divide-line/40 text-sm">
                      {leads.map((l) => (
                        <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                          <Link to={`/leads?open=${l.id}`} className="hover:text-accent">
                            {l.ref} · {l.requested_service ?? "Inquiry"} <span className="text-muted">· {date(l.date)}</span>
                          </Link>
                          <Badge value={l.status} label={LEAD_STATUSES[l.status]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
                <Section title={`Quotations (${quotes.length})`} actions={<Link to={`/quotations/new?client=${client.id}`}><Button small>+ Quotation</Button></Link>}>
                  {quotes.length === 0 ? <p className="text-sm text-muted">No quotations.</p> : (
                    <ul className="divide-y divide-line/40 text-sm">
                      {quotes.map((q) => (
                        <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                          <Link to={`/quotations/${q.id}`} className="hover:text-accent">
                            {q.ref} · {money(q.quotation_totals?.total, q.currency)} <span className="text-muted">· {date(q.issue_date)}</span>
                          </Link>
                          <Badge value={q.status} label={QUOTATION_STATUSES[q.status]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
                <Section title={`Projects (${projects.length})`}>
                  {projects.length === 0 ? <p className="text-sm text-muted">No projects.</p> : (
                    <ul className="divide-y divide-line/40 text-sm">
                      {projects.map((p) => (
                        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                          <Link to={`/projects/${p.id}`} className="hover:text-accent">
                            {p.ref} · {p.name}
                          </Link>
                          <Badge value={p.status} label={PROJECT_STATUSES[p.status]} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </div>
            </div>
            <Modal open={edit} onClose={() => setEdit(false)} title="Edit client">
              <RecordForm
                fields={CLIENT_FIELDS}
                initial={client as never}
                onCancel={() => setEdit(false)}
                onSubmit={async (v) => {
                  await must(supabase.from("clients").update(v).eq("id", client.id));
                  setEdit(false);
                  state.reload();
                }}
              />
            </Modal>
          </>
        );
      }}
    </Async>
  );
}
