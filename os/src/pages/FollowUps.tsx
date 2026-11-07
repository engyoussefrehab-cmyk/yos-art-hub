import { useState } from "react";
import { Link } from "react-router-dom";
import { must, supabase } from "../lib/supabase";
import { useData } from "../lib/useData";
import { date, today, whatsappLink } from "../lib/format";
import type { FollowUp } from "../lib/types";
import { Async, Button, Card, Empty, Modal, PageHeader, RecordForm, type FieldDef } from "../ui";
import { clientOptions } from "./Clients";

const SELECT = "*, clients(name,phone), leads(ref), quotations(ref)";

export function FollowUps() {
  const [editing, setEditing] = useState<Partial<FollowUp> | null>(null);
  const [showDone, setShowDone] = useState(false);
  const state = useData(async () => {
    const [open, done, clients, leads, quotes] = await Promise.all([
      must(supabase.from("follow_ups").select(SELECT).is("done_at", null).order("due_date")),
      must(supabase.from("follow_ups").select(SELECT).not("done_at", "is", null).order("done_at", { ascending: false }).limit(30)),
      clientOptions(),
      must(supabase.from("leads").select("id,ref,clients(name)").not("status", "in", "(won,lost)").order("date", { ascending: false })),
      must(supabase.from("quotations").select("id,ref,clients(name)").in("status", ["draft", "sent"]).order("created_at", { ascending: false })),
    ]);
    const label = (r: { ref: string; clients: unknown }) => `${r.ref} · ${(r.clients as { name: string } | null)?.name ?? ""}`;
    return {
      open: open as FollowUp[],
      done: done as FollowUp[],
      fields: [
        { name: "title", label: "What to do", required: true, full: true },
        { name: "due_date", label: "Due", type: "date", required: true },
        { name: "client_id", label: "Client", type: "select", options: clients },
        { name: "lead_id", label: "Lead", type: "select", options: leads.map((l) => ({ value: l.id, label: label(l) })) },
        { name: "quotation_id", label: "Quotation", type: "select", options: quotes.map((q) => ({ value: q.id, label: label(q) })) },
        { name: "note", label: "Note", type: "textarea" },
      ] as FieldDef[],
    };
  });

  const update = async (id: string, patch: Partial<FollowUp>) => {
    // Show the change immediately, then save and refresh.
    state.setData((d) => {
      if (!d) return d;
      const all = [...d.open, ...d.done].map((f) => (f.id === id ? { ...f, ...patch } : f));
      return { ...d, open: all.filter((f) => !f.done_at).sort((a, b) => a.due_date.localeCompare(b.due_date)), done: all.filter((f) => f.done_at) };
    });
    try {
      await must(supabase.from("follow_ups").update(patch).eq("id", id));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
    state.reload();
  };

  return (
    <>
      <PageHeader
        title="Follow-ups"
        sub="In-app reminders. Check this page (or the dashboard) daily — no push notifications are sent."
        actions={<Button kind="primary" onClick={() => setEditing({ due_date: today(1) })}>+ New follow-up</Button>}
      />
      <Async state={state}>
        {({ open, done }) => {
          const t = today();
          const groups = [
            ["Overdue", open.filter((f) => f.due_date < t)],
            ["Today", open.filter((f) => f.due_date === t)],
            ["Upcoming", open.filter((f) => f.due_date > t)],
          ] as const;
          return (
            <div className="space-y-8">
              {open.length === 0 && <Empty title="All caught up" hint="New inquiries and sent quotations add follow-ups here automatically." />}
              {groups.map(([title, list]) =>
                list.length ? (
                  <section key={title}>
                    <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${title === "Overdue" ? "text-accent" : "text-muted"}`}>
                      {title} ({list.length})
                    </h2>
                    <div className="space-y-2">
                      {list.map((f) => (
                        <Item key={f.id} f={f} onEdit={() => setEditing(f)} onUpdate={(p) => update(f.id, p)} />
                      ))}
                    </div>
                  </section>
                ) : null,
              )}
              <section>
                <button type="button" onClick={() => setShowDone((v) => !v)} className="text-sm text-muted hover:text-fg">
                  {showDone ? "Hide" : "Show"} recently completed ({done.length})
                </button>
                {showDone && (
                  <div className="mt-3 space-y-2 opacity-70">
                    {done.map((f) => (
                      <Item key={f.id} f={f} onEdit={() => setEditing(f)} onUpdate={(p) => update(f.id, p)} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          );
        }}
      </Async>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit follow-up" : "New follow-up"}>
        {editing && state.data && (
          <RecordForm
            fields={state.data.fields}
            initial={editing as Record<string, unknown>}
            onCancel={() => setEditing(null)}
            onSubmit={async (v) => {
              if (editing.id) await must(supabase.from("follow_ups").update(v).eq("id", editing.id));
              else await must(supabase.from("follow_ups").insert(v));
              setEditing(null);
              state.reload();
            }}
          />
        )}
      </Modal>
    </>
  );
}

function Item({ f, onEdit, onUpdate }: { f: FollowUp; onEdit: () => void; onUpdate: (p: Partial<FollowUp>) => void }) {
  const wa = whatsappLink(f.clients?.phone);
  const overdue = !f.done_at && f.due_date < today();
  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <input
        type="checkbox"
        checked={!!f.done_at}
        aria-label={`Mark "${f.title}" done`}
        className="h-4 w-4 accent-[var(--yr-accent)]"
        onChange={(e) => onUpdate({ done_at: e.target.checked ? new Date().toISOString() : null })}
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${f.done_at ? "line-through" : ""}`}>{f.title}</p>
        <p className="mt-0.5 text-xs text-muted">
          <span className={overdue ? "text-accent" : ""}>{date(f.due_date)}</span>
          {f.clients && (
            <>
              {" · "}
              <Link to={`/clients/${f.client_id}`} className="hover:text-fg">
                {f.clients.name}
              </Link>
            </>
          )}
          {f.leads && <> · <Link to={`/leads?open=${f.lead_id}`} className="hover:text-fg">{f.leads.ref}</Link></>}
          {f.quotations && <> · <Link to={`/quotations/${f.quotation_id}`} className="hover:text-fg">{f.quotations.ref}</Link></>}
          {f.note && <> · {f.note}</>}
        </p>
      </div>
      {!f.done_at && (
        <div className="flex flex-wrap gap-1">
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer">
              <Button small kind="ghost">WhatsApp</Button>
            </a>
          )}
          <Button small kind="ghost" onClick={() => onUpdate({ due_date: today(1) })}>
            Tomorrow
          </Button>
          <Button small kind="ghost" onClick={() => onUpdate({ due_date: today(3) })}>
            +3 days
          </Button>
          <Button small onClick={onEdit}>
            Edit
          </Button>
        </div>
      )}
    </Card>
  );
}
