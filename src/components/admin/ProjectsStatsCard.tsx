import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useAdminLang } from "@/i18n/admin-lang";

type Stats = { projects_count: number; countries_count: number; sectors_count: number };

export function ProjectsStatsCard() {
  const { lang } = useAdminLang();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const [stats, setStats] = useState<Stats>({ projects_count: 0, countries_count: 0, sectors_count: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects_page_stats")
        .select("projects_count,countries_count,sectors_count")
        .eq("id", "default")
        .maybeSingle();
      if (data) setStats(data as Stats);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("projects_page_stats")
      .upsert({ id: "default", ...stats });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(L("تم حفظ الإحصائيات", "Statistics saved"));
  };

  const num = (label: string, key: keyof Stats) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min={0}
        value={String(stats[key] ?? 0)}
        onChange={(e) => setStats((s) => ({ ...s, [key]: Number(e.target.value) || 0 }))}
      />
    </div>
  );

  return (
    <section className="rounded-xl border border-border/70 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold">{L("إحصائيات صفحة المشاريع", "Projects page statistics")}</h2>
            <p className="text-xs text-muted-foreground">
              {L("تتحكم في أرقام البطاقات أعلى صفحة المشاريع (0 = حساب تلقائي).",
                 "Controls the stat cards on the projects page (0 = auto-calculated).")}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={save} disabled={saving || loading}>
          <Save className="me-2 h-4 w-4" />
          {saving ? L("جارٍ الحفظ…", "Saving…") : L("حفظ", "Save")}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {num(L("عدد المشاريع المنجزة", "Completed projects"), "projects_count")}
        {num(L("عدد الدول / الأسواق", "Countries / markets"), "countries_count")}
        {num(L("عدد القطاعات", "Industry sectors"), "sectors_count")}
      </div>
    </section>
  );
}
