import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Archive, Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

function MessagesInbox() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "archived">("all");
  const [active, setActive] = useState<Row | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("contact_messages_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  const del = async (id: string) => {
    if (!confirm("حذف الرسالة نهائياً؟")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setActive(null); load(); }
  };

  const filtered = (rows ?? []).filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && !`${r.name} ${r.email} ${r.subject ?? ""} ${r.message}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const openMsg = (r: Row) => {
    setActive(r);
    if (r.status === "unread") setStatus(r.id, "read");
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">صندوق الرسائل</h1>
        <p className="mt-1 text-sm text-muted-foreground">رسائل نموذج التواصل مع تحديث لحظي.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="بحث…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm">
          <option value="all">الكل</option>
          <option value="unread">غير مقروء</option>
          <option value="read">مقروء</option>
          <option value="archived">أرشيف</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          {rows === null ? (
            <div className="p-6 text-sm text-muted-foreground">جاري التحميل…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">لا توجد رسائل.</div>
          ) : (
            <ul className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto">
              {filtered.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => openMsg(r)}
                    className={`w-full text-right px-4 py-3 hover:bg-muted/30 ${active?.id === r.id ? "bg-muted/40" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-medium truncate">
                        {r.status === "unread" ? <Mail className="h-4 w-4 text-primary" /> : <MailOpen className="h-4 w-4 text-muted-foreground" />}
                        {r.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground truncate">{r.subject || r.message}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6 min-h-[300px]">
          {!active ? (
            <div className="text-sm text-muted-foreground">اختر رسالة لعرضها.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{active.subject || "(بدون موضوع)"}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    من <span className="font-medium">{active.name}</span> · <a className="underline" href={`mailto:${active.email}`}>{active.email}</a>
                    {active.phone && <> · {active.phone}</>}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{new Date(active.created_at).toLocaleString("ar-EG")}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(active.id, active.status === "unread" ? "read" : "unread")}>
                    {active.status === "unread" ? "تحديد كمقروء" : "تحديد كغير مقروء"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(active.id, "archived")}><Archive className="ms-1 h-3.5 w-3.5" /> أرشفة</Button>
                  <Button size="sm" variant="ghost" onClick={() => del(active.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <div className="whitespace-pre-wrap rounded-xl border border-border/60 bg-background p-4 text-sm leading-7">{active.message}</div>
              <div>
                <a
                  href={`mailto:${active.email}?subject=${encodeURIComponent("رد: " + (active.subject ?? ""))}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  الرد عبر البريد
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/messages")({
  component: MessagesInbox,
});
