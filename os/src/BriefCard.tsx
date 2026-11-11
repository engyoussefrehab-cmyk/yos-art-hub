import { useState } from "react";
import { Link } from "react-router-dom";
import type { Lead } from "./lib/types";
import { SOURCES, clientLabel, date, whatsappLink } from "./lib/format";

type Block = { title: string; rows: [string, string][] };

/** The website brief is saved as plain text: "— Section —" then "label: value" lines. */
export function parseBrief(text: string | null | undefined): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;
  for (const raw of (text ?? "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const head = line.match(/^—\s*(.+?)\s*—$/);
    if (head) {
      cur = { title: head[1], rows: [] };
      blocks.push(cur);
      continue;
    }
    const i = line.indexOf(":");
    if (!cur) {
      cur = { title: "", rows: [] };
      blocks.push(cur);
    }
    if (i > 0 && i < 40) cur.rows.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
    else if (cur.rows.length) cur.rows[cur.rows.length - 1][1] += "\n" + line;
    else cur.rows.push(["", line]);
  }
  // drop the "نموذج المشروع من الموقع" preface line; keep untitled text only if it is the whole brief
  const titled = blocks.filter((b) => b.title && b.rows.length);
  return titled.length ? titled : blocks.filter((b) => b.rows.length);
}

/** Readable answers: one card per section, label on the side, value next to it. */
export function BriefAnswers({ brief }: { brief: string | null | undefined }) {
  const blocks = parseBrief(brief);
  if (!blocks.length) return <p className="text-sm text-muted">No details were written.</p>;
  return (
    <div dir="rtl" className="grid gap-3 md:grid-cols-2">
      {blocks.map((b, i) => (
        <div key={i} className="rounded-card border border-line/50 bg-surface-2/40 p-4">
          {b.title && <h3 className="mb-2 text-sm font-semibold text-accent">{b.title}</h3>}
          <dl className="space-y-2 text-sm">
            {b.rows.map(([k, v], j) => (
              <div key={j} className="grid grid-cols-[7.5rem_1fr] gap-3">
                <dt className="text-muted">{k}</dt>
                <dd className="whitespace-pre-wrap break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

/** One inquiry: summary row that expands to the full answers. */
export function InquiryItem({ lead, defaultOpen = false }: { lead: Lead; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = lead.clients;
  const wa = whatsappLink(c?.phone);
  return (
    <li className="rounded-card border border-line/60 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <button type="button" onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <p className="truncate font-medium">{clientLabel(c)}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {lead.ref} · {SOURCES[lead.source]} · {date(lead.date)}
            {lead.requested_service ? ` · ${lead.requested_service}` : ""}
          </p>
        </button>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3 py-1.5 hover:border-fg/60">
              WhatsApp
            </a>
          )}
          {c?.email && (
            <a href={`mailto:${c.email}`} className="rounded-full border border-line px-3 py-1.5 hover:border-fg/60">
              Email
            </a>
          )}
          <Link to={`/leads?open=${lead.id}`} className="rounded-full border border-line px-3 py-1.5 hover:border-fg/60">
            Open lead
          </Link>
          <button type="button" onClick={() => setOpen(!open)} className="rounded-full bg-surface-2 px-3 py-1.5 hover:brightness-125">
            {open ? "Hide" : "Show answers"}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line/50 p-4">
          <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm" dir="ltr">
            {c?.phone && <span><span className="text-muted">Phone </span>{c.phone}</span>}
            {c?.email && <span><span className="text-muted">Email </span>{c.email}</span>}
          </div>
          <BriefAnswers brief={lead.brief} />
        </div>
      )}
    </li>
  );
}
