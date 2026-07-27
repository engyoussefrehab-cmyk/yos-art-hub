import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Workflow } from "lucide-react";
import { useAdminLang } from "@/i18n/admin-lang";
import {
  getMethodologyAdmin,
  saveMethodology,
  type MethodologyCopyDTO,
  type MethodologyStepDTO,
} from "@/lib/methodology.functions";

export const Route = createFileRoute("/admin/methodology")({
  component: RouteComponent,
});

type StepDraft = Partial<MethodologyStepDTO> & { _key: string };

function RouteComponent() {
  const { lang } = useAdminLang();
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const qc = useQueryClient();
  const loadFn = useServerFn(getMethodologyAdmin);
  const saveFn = useServerFn(saveMethodology);

  const q = useQuery({ queryKey: ["admin-methodology"], queryFn: () => loadFn() });

  const [copy, setCopy] = useState<Partial<MethodologyCopyDTO>>({ is_visible: true });
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!q.data) return;
    setCopy(q.data.copy ?? { is_visible: true });
    setSteps((q.data.steps ?? []).map((s) => ({ ...s, _key: s.id })));
    setDeletedIds([]);
  }, [q.data]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          copy,
          steps: steps.map(({ _key, ...s }) => s),
          deletedIds,
        },
      }),
    onSuccess: () => {
      toast.success(L("تم الحفظ", "Saved"));
      qc.invalidateQueries({ queryKey: ["admin-methodology"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStep = (key: string, patch: Partial<MethodologyStepDTO>) =>
    setSteps((arr) => arr.map((s) => (s._key === key ? { ...s, ...patch } : s)));

  const move = (idx: number, dir: -1 | 1) =>
    setSteps((arr) => {
      const next = [...arr];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return arr;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  const removeStep = (step: StepDraft) => {
    if (step.id) setDeletedIds((d) => [...d, step.id!]);
    setSteps((arr) => arr.filter((s) => s._key !== step._key));
  };

  const addStep = () =>
    setSteps((arr) => [
      ...arr,
      {
        _key: `new-${Date.now()}`,
        title_ar: "",
        title_en: "",
        description_ar: "",
        description_en: "",
        is_published: true,
      },
    ]);

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    area = false,
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {area ? (
        <Textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold">{L("منهجية العمل", "Methodology")}</h1>
            <p className="text-sm text-muted-foreground">
              {L("تحكم كامل في عنوان ومحتوى قسم منهجية العمل بالصفحة الرئيسية.",
                 "Full control over the homepage methodology section.")}
            </p>
          </div>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="me-2 h-4 w-4" />
          {save.isPending ? L("جارٍ الحفظ…", "Saving…") : L("حفظ", "Save")}
        </Button>
      </header>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">{L("جارٍ التحميل…", "Loading…")}</p>
      ) : (
        <>
          <section className="rounded-md border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{L("نصوص القسم", "Section copy")}</h2>
              <label className="flex items-center gap-2 text-xs">
                <Switch
                  checked={copy.is_visible ?? true}
                  onCheckedChange={(v) => setCopy((c) => ({ ...c, is_visible: v }))}
                />
                {L("إظهار القسم", "Visible")}
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {field(L("الشارة (عربي)", "Kicker (AR)"), copy.kicker_ar ?? "", (v) => setCopy((c) => ({ ...c, kicker_ar: v })))}
              {field(L("الشارة (إنجليزي)", "Kicker (EN)"), copy.kicker_en ?? "", (v) => setCopy((c) => ({ ...c, kicker_en: v })))}
              {field(L("العنوان (عربي)", "Title (AR)"), copy.title_ar ?? "", (v) => setCopy((c) => ({ ...c, title_ar: v })))}
              {field(L("العنوان (إنجليزي)", "Title (EN)"), copy.title_en ?? "", (v) => setCopy((c) => ({ ...c, title_en: v })))}
              {field(L("الوصف (عربي)", "Lede (AR)"), copy.lede_ar ?? "", (v) => setCopy((c) => ({ ...c, lede_ar: v })), true)}
              {field(L("الوصف (إنجليزي)", "Lede (EN)"), copy.lede_en ?? "", (v) => setCopy((c) => ({ ...c, lede_en: v })), true)}
            </div>
          </section>

          <section className="space-y-4 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{L("الخطوات", "Steps")}</h2>
              <Button size="sm" variant="outline" onClick={addStep}>
                <Plus className="me-2 h-4 w-4" />
                {L("خطوة جديدة", "Add step")}
              </Button>
            </div>

            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground">{L("لا توجد خطوات بعد.", "No steps yet.")}</p>
            )}

            {steps.map((step, i) => (
              <div key={step._key} className="rounded-md border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {L("الخطوة", "Step")} {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <label className="me-2 flex items-center gap-2 text-xs">
                      <Switch
                        checked={step.is_published ?? true}
                        onCheckedChange={(v) => setStep(step._key, { is_published: v })}
                      />
                      {L("منشورة", "Published")}
                    </label>
                    <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeStep(step)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {field(L("العنوان (عربي)", "Title (AR)"), step.title_ar ?? "", (v) => setStep(step._key, { title_ar: v }))}
                  {field(L("العنوان (إنجليزي)", "Title (EN)"), step.title_en ?? "", (v) => setStep(step._key, { title_en: v }))}
                  {field(L("الوصف (عربي)", "Description (AR)"), step.description_ar ?? "", (v) => setStep(step._key, { description_ar: v }), true)}
                  {field(L("الوصف (إنجليزي)", "Description (EN)"), step.description_en ?? "", (v) => setStep(step._key, { description_en: v }), true)}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
