import { Link } from "react-router-dom";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { LEAD_STATUSES, SOURCES, clientLabel, date, money, moneyMap, sumByCurrency, today } from "../lib/format";
import type { Currency, FollowUp, Lead, LeadSource, LeadStatus, Project, Quotation } from "../lib/types";
import { balance } from "./Projects";
import { Async, Button, Card, PageHeader, Section } from "../ui";

/** Every number here is computed from the database — nothing is hard-coded. */
export function Dashboard() {
  const state = useData(async () => {
    const monthStart = today().slice(0, 8) + "01";
    const sixMonthsAgo = (() => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - 5);
      return d.toISOString().slice(0, 8) + "01";
    })();
    const [leads, quotes, projects, followUps, payments] = await Promise.all([
      must(supabase.from("leads").select("id,ref,status,source,date,created_at,client_id,clients(name,brand)").order("created_at", { ascending: false })),
      must(supabase.from("quotations").select("id,ref,status,currency,expiry_date,client_id,clients(name,brand),quotation_totals").eq("status", "sent")),
      must(supabase.from("projects").select("id,ref,name,status,budget,currency,due_date,clients(name,brand),payments(amount,currency)").not("status", "eq", "cancelled")),
      must(supabase.from("follow_ups").select("id,title,due_date,client_id,clients(name,phone)").is("done_at", null).lte("due_date", today()).order("due_date")),
      must(supabase.from("payments").select("amount,currency,paid_on").gte("paid_on", sixMonthsAgo)),
    ]);
    return {
      monthStart,
      leads: leads as unknown as Lead[],
      quotes: quotes as unknown as Quotation[],
      projects: projects as unknown as Project[],
      followUps: followUps as unknown as FollowUp[],
      payments: payments as { amount: number; currency: Currency; paid_on: string }[],
    };
  });

  return (
    <>
      <PageHeader
        title="Dashboard"
        sub={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        actions={
          <>
            <Link to="/leads">
              <Button>+ Lead</Button>
            </Link>
            <Link to="/quotations/new">
              <Button kind="primary">+ Quotation</Button>
            </Link>
          </>
        }
      />
      <Async state={state}>
        {({ monthStart, leads, quotes, projects, followUps, payments }) => {
          const t = today();
          const weekAgo = today(-7);
          const newLeads = leads.filter((l) => l.status === "new_inquiry");
          const leadsThisWeek = leads.filter((l) => l.date >= weekAgo).length;
          const active = projects.filter((p) => !["completed", "cancelled"].includes(p.status));
          const overdue = followUps.filter((f) => f.due_date < t);
          const dueToday = followUps.filter((f) => f.due_date === t);
          const thisMonth = sumByCurrency(payments.filter((p) => p.paid_on >= monthStart));
          const outstanding = sumByCurrency(
            projects.map((p) => ({ amount: balance(p, p.payments ?? []).outstanding, currency: p.currency })),
          );
          const awaiting = sumByCurrency(quotes.map((q) => ({ amount: q.quotation_totals?.total ?? null, currency: q.currency })));

          const byStatus = countBy(leads.filter((l) => !["won", "lost"].includes(l.status)), (l) => l.status) as Record<LeadStatus, number>;
          const bySource = countBy(leads.filter((l) => l.date >= today(-30)), (l) => l.source) as Record<LeadSource, number>;
          const months = monthly(payments);

          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi to="/leads" label="New inquiries" value={String(newLeads.length)} hint={`${leadsThisWeek} leads in the last 7 days`} accent={newLeads.length > 0} />
                <Kpi to="/follow-ups" label="Follow-ups due" value={String(followUps.length)} hint={overdue.length ? `${overdue.length} overdue` : "None overdue"} accent={overdue.length > 0} />
                <Kpi to="/quotations" label="Quotations awaiting reply" value={String(quotes.length)} hint={quotes.length ? moneyMap(awaiting) : "—"} />
                <Kpi to="/projects" label="Active projects" value={String(active.length)} hint={`${active.filter((p) => p.due_date && p.due_date < t).length} past due date`} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Card className="p-5">
                  <p className="text-xs text-muted">Received this month</p>
                  <p className="mt-1 text-2xl font-semibold">{moneyMap(thisMonth)}</p>
                </Card>
                <Card className="p-5">
                  <p className="text-xs text-muted">Outstanding on projects</p>
                  <p className={`mt-1 text-2xl font-semibold ${outstanding.size ? "text-warning" : ""}`}>{moneyMap(outstanding)}</p>
                </Card>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Section title="To do today" actions={<Link to="/follow-ups" className="text-xs text-muted hover:text-fg">All →</Link>}>
                  {followUps.length === 0 ? (
                    <p className="text-sm text-muted">Nothing due today.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {[...overdue, ...dueToday].slice(0, 8).map((f) => (
                        <li key={f.id} className="flex items-start justify-between gap-3">
                          <span>{f.title}</span>
                          <span className={`shrink-0 text-xs ${f.due_date < t ? "text-accent" : "text-muted"}`}>{f.due_date < t ? date(f.due_date) : "Today"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title="Newest inquiries" actions={<Link to="/leads" className="text-xs text-muted hover:text-fg">All →</Link>}>
                  {newLeads.length === 0 ? (
                    <p className="text-sm text-muted">No new inquiries waiting.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {newLeads.slice(0, 6).map((l) => (
                        <li key={l.id} className="flex justify-between gap-3">
                          <Link to={`/leads?open=${l.id}`} className="hover:text-accent">
                            {clientLabel(l.clients)}
                          </Link>
                          <span className="shrink-0 text-xs text-muted">{SOURCES[l.source]} · {date(l.date)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title="Open leads by status">
                  <Bars data={Object.entries(LEAD_STATUSES).filter(([k]) => !["won", "lost"].includes(k)).map(([k, label]) => [label, byStatus[k as LeadStatus] ?? 0])} />
                </Section>

                <Section title="Leads by source (last 30 days)">
                  <Bars data={Object.entries(SOURCES).map(([k, label]) => [label, bySource[k as LeadSource] ?? 0])} />
                </Section>

                <Section title="Revenue received (last 6 months)">
                  {months.every((m) => !m.total.size) ? (
                    <p className="text-sm text-muted">No payments recorded yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {months.map((m) => (
                        <li key={m.key} className="flex justify-between gap-3">
                          <span className="text-muted">{m.label}</span>
                          <span>{moneyMap(m.total)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title="Active projects" actions={<Link to="/projects" className="text-xs text-muted hover:text-fg">All →</Link>}>
                  {active.length === 0 ? (
                    <p className="text-sm text-muted">No active projects.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {active.slice(0, 6).map((p) => (
                        <li key={p.id} className="flex justify-between gap-3">
                          <Link to={`/projects/${p.id}`} className="hover:text-accent">
                            {p.name}
                          </Link>
                          <span className={`shrink-0 text-xs ${p.due_date && p.due_date < t ? "text-accent" : "text-muted"}`}>
                            {p.due_date ? `Due ${date(p.due_date)}` : money(p.budget, p.currency)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </div>
            </div>
          );
        }}
      </Async>
    </>
  );
}

function countBy<T>(rows: T[], key: (r: T) => string) {
  const out: Record<string, number> = {};
  for (const r of rows) out[key(r)] = (out[key(r)] ?? 0) + 1;
  return out;
}

function monthly(payments: { amount: number; currency: Currency; paid_on: string }[]) {
  const out: { key: string; label: string; total: Map<Currency, number> }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 6; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      key,
      label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      total: sumByCurrency(payments.filter((p) => p.paid_on.startsWith(key))),
    });
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

function Kpi({ to, label, value, hint, accent }: { to: string; label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <Link to={to} className="block rounded-card border border-line/60 bg-surface p-5 transition hover:border-line">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${accent ? "text-accent" : ""}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-muted">{hint}</p>
    </Link>
  );
}

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  if (data.every(([, n]) => n === 0)) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <ul className="space-y-2.5">
      {data.map(([label, n]) => (
        <li key={label} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3 text-sm">
          <span className="truncate text-muted">{label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{n}</span>
        </li>
      ))}
    </ul>
  );
}
