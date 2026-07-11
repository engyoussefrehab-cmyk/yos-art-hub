import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAuditLogsFn, listAuthAttemptsFn } from "@/lib/audit.functions";

type Row = Record<string, any>;

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString("ar-EG", { hour12: false });
  } catch {
    return ts;
  }
}

function AuditPage() {
  const [tab, setTab] = useState<"audit" | "auth">("audit");
  const [audit, setAudit] = useState<Row[] | null>(null);
  const [attempts, setAttempts] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const [a, b] = await Promise.all([
        listAuditLogsFn({ data: { limit: 150 } }),
        listAuthAttemptsFn({ data: { limit: 150 } }),
      ]);
      setAudit(a as Row[]);
      setAttempts(b as Row[]);
    } catch (e: any) {
      setErr(e?.message ?? "تعذّر جلب السجلات.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">سجلات التدقيق</h1>
          <p className="text-sm text-muted-foreground">محاولات تسجيل الدخول والعمليات الحساسة على الحساب.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-full border border-border px-4 py-1.5 text-xs hover:border-accent hover:text-accent"
          >
            {loading ? "جاري…" : "تحديث"}
          </button>
          <Link to="/admin/insights" className="rounded-full border border-border px-4 py-1.5 text-xs hover:border-accent hover:text-accent">
            رجوع
          </Link>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/70">
        {[
          { id: "audit", label: `العمليات الحساسة${audit ? ` (${audit.length})` : ""}` },
          { id: "auth", label: `محاولات الدخول${attempts ? ` (${attempts.length})` : ""}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === t.id ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{err}</p>}

      {tab === "audit" && (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="min-w-full text-right text-sm">
            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">التوقيت</th>
                <th className="px-3 py-2">الإجراء</th>
                <th className="px-3 py-2">المستخدم</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {(audit ?? []).map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{fmt(r.created_at)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                  <td className="px-3 py-2 text-xs">{r.actor_email ?? r.actor_user_id ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.ip ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {r.meta && Object.keys(r.meta).length ? JSON.stringify(r.meta) : "—"}
                  </td>
                </tr>
              ))}
              {audit && audit.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">لا توجد سجلات.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "auth" && (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="min-w-full text-right text-sm">
            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">التوقيت</th>
                <th className="px-3 py-2">البريد</th>
                <th className="px-3 py-2">النتيجة</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">السبب</th>
              </tr>
            </thead>
            <tbody>
              {(attempts ?? []).map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{fmt(r.created_at)}</td>
                  <td className="px-3 py-2 text-xs">{r.email}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${r.success ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>
                      {r.success ? "نجاح" : "فشل"}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{r.ip ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.reason ?? "—"}</td>
                </tr>
              ))}
              {attempts && attempts.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">لا توجد محاولات.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "سجلات التدقيق | لوحة التحكم" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuditPage,
});
