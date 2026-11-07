import { useEffect, useRef, useState, type ReactNode } from "react";

/* ─────────────────────────────── layout bits */

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card border border-line/60 bg-surface ${className}`}>{children}</div>;
}

export function Section({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </Card>
  );
}

/* ─────────────────────────────── buttons */

type BtnKind = "primary" | "secondary" | "ghost" | "danger";
const btnClass: Record<BtnKind, string> = {
  primary: "bg-accent text-accent-fg hover:brightness-110",
  secondary: "border border-line bg-surface-2 text-fg hover:border-fg/60",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "text-accent hover:bg-accent/10",
};

export function Button({
  kind = "secondary",
  small,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind; small?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${btnClass[kind]} ${className}`}
    />
  );
}

/* ─────────────────────────────── states */

export function Loading() {
  return <div className="py-16 text-center text-sm text-muted">Loading…</div>;
}

export function ErrorBox({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="rounded-card border border-accent/50 bg-accent/10 p-4 text-sm">
      <p className="font-medium text-accent">Something went wrong</p>
      <p className="mt-1 text-muted">{error}</p>
      {onRetry && (
        <Button small className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Render data / loading / error with one call. */
export function Async<T>({
  state,
  children,
}: {
  state: { data: T | null; error: string | null; loading: boolean; reload: () => void };
  children: (data: T) => ReactNode;
}) {
  if (state.error) return <ErrorBox error={state.error} onRetry={state.reload} />;
  if (state.data == null) return <Loading />;
  return <>{children(state.data)}</>;
}

/* ─────────────────────────────── badge */

const tone: Record<string, string> = {
  // leads
  new_inquiry: "accent",
  won: "success",
  lost: "muted",
  // quotations
  draft: "muted",
  sent: "warning",
  accepted: "success",
  rejected: "muted",
  expired: "muted",
  // projects
  in_progress: "warning",
  completed: "success",
  cancelled: "muted",
  waiting_for_client: "accent",
  // priority
  high: "accent",
};
const toneClass: Record<string, string> = {
  accent: "border-accent/50 text-accent",
  success: "border-success/50 text-success",
  warning: "border-warning/50 text-warning",
  muted: "border-line text-muted",
  default: "border-line text-fg",
};
export function Badge({ value, label }: { value: string; label: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${toneClass[tone[value] ?? "default"]}`}>
      {label}
    </span>
  );
}

/* ─────────────────────────────── table */

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line/60 text-left text-xs uppercase tracking-wide text-muted">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line/40 [&>tr:last-child]:border-0 [&>tr:hover]:bg-surface-2 [&_td]:px-4 [&_td]:py-3">
          {children}
        </tbody>
      </table>
    </Card>
  );
}

/* ─────────────────────────────── modal */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-3xl" : "max-w-xl"} rounded-card border border-line bg-surface p-0 text-fg backdrop:bg-black/70`}
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-2 text-xl text-muted hover:text-fg">
              ×
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/* ─────────────────────────────── generic form */

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  full?: boolean; // span both columns
  step?: string;
};

type Values = Record<string, unknown>;

/** Turns form strings into DB values: '' → null, numbers parsed. */
function clean(fields: FieldDef[], values: Values) {
  const out: Values = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === "checkbox") out[f.name] = Boolean(v);
    else if (v === "" || v === undefined) out[f.name] = null;
    else if (f.type === "number") out[f.name] = Number(v);
    else out[f.name] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

export function RecordForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  extra,
}: {
  fields: FieldDef[];
  initial?: Values;
  onSubmit: (values: Values) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  extra?: ReactNode;
}) {
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    for (const f of fields) v[f.name] = initial?.[f.name] ?? (f.type === "checkbox" ? false : "");
    return v;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await onSubmit(clean(fields, values));
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const common = { id, name: f.name, required: f.required, placeholder: f.placeholder };
          const v = values[f.name] as string;
          return (
            <div key={f.name} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
              {f.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4 accent-[var(--yr-accent)]" />
                  {f.label}
                </label>
              ) : (
                <>
                  <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
                    {f.label}
                    {f.required && <span className="text-accent"> *</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea {...common} rows={4} className="input" value={v} onChange={(e) => set(f.name, e.target.value)} />
                  ) : f.type === "select" ? (
                    <select {...common} className="input" value={v} onChange={(e) => set(f.name, e.target.value)}>
                      {!f.required && <option value="">—</option>}
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...common}
                      type={f.type ?? "text"}
                      step={f.type === "number" ? f.step ?? "0.01" : undefined}
                      min={f.type === "number" ? 0 : undefined}
                      className="input"
                      value={v}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {extra}
      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        {onCancel && (
          <Button kind="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button kind="primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/* ─────────────────────────────── misc */

export function SearchInput({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="input max-w-xs"
    />
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      small
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const t = document.createElement("textarea");
          t.value = text;
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          t.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copied ✓" : label}
    </Button>
  );
}

export function confirmDelete(what: string) {
  return window.confirm(`Delete ${what}? This cannot be undone.`);
}
