import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import {
  getServiceTierPageCopy,
  saveServiceTierPageCopy,
  type ServiceTierPageDTO,
} from "@/lib/service-tiers.functions";
import { useAdminLang } from "@/i18n/admin-lang";

export const Route = createFileRoute("/admin/service-tier-page")({
  component: RouteComponent,
});

type Field = { key: keyof ServiceTierPageDTO; label: { ar: string; en: string }; area?: boolean };

const HERO: Field[] = [
  { key: "eyebrow_ar", label: { ar: "شارة الهيرو (عربي)", en: "Eyebrow (AR)" } },
  { key: "eyebrow_en", label: { ar: "شارة الهيرو (إنجليزي)", en: "Eyebrow (EN)" } },
  { key: "title_ar", label: { ar: "العنوان الرئيسي (عربي)", en: "Title (AR)" } },
  { key: "title_en", label: { ar: "العنوان الرئيسي (إنجليزي)", en: "Title (EN)" } },
  { key: "subtitle_ar", label: { ar: "العنوان الفرعي (عربي)", en: "Subtitle (AR)" }, area: true },
  { key: "subtitle_en", label: { ar: "العنوان الفرعي (إنجليزي)", en: "Subtitle (EN)" }, area: true },
];
const COMPARE: Field[] = [
  { key: "compare_eyebrow_ar", label: { ar: "شارة المقارنة (عربي)", en: "Compare eyebrow (AR)" } },
  { key: "compare_eyebrow_en", label: { ar: "شارة المقارنة (إنجليزي)", en: "Compare eyebrow (EN)" } },
  { key: "compare_title_ar", label: { ar: "عنوان المقارنة (عربي)", en: "Compare title (AR)" } },
  { key: "compare_title_en", label: { ar: "عنوان المقارنة (إنجليزي)", en: "Compare title (EN)" } },
  { key: "footnote_ar", label: { ar: "الحاشية (عربي)", en: "Footnote (AR)" }, area: true },
  { key: "footnote_en", label: { ar: "الحاشية (إنجليزي)", en: "Footnote (EN)" }, area: true },
];
const CTA: Field[] = [
  { key: "cta_eyebrow_ar", label: { ar: "شارة CTA (عربي)", en: "CTA eyebrow (AR)" } },
  { key: "cta_eyebrow_en", label: { ar: "شارة CTA (إنجليزي)", en: "CTA eyebrow (EN)" } },
  { key: "cta_title_ar", label: { ar: "عنوان CTA (عربي)", en: "CTA title (AR)" } },
  { key: "cta_title_en", label: { ar: "عنوان CTA (إنجليزي)", en: "CTA title (EN)" } },
  { key: "cta_subtitle_ar", label: { ar: "وصف CTA (عربي)", en: "CTA subtitle (AR)" }, area: true },
  { key: "cta_subtitle_en", label: { ar: "وصف CTA (إنجليزي)", en: "CTA subtitle (EN)" }, area: true },
  { key: "cta_button_ar", label: { ar: "نص الزر (عربي)", en: "Button (AR)" } },
  { key: "cta_button_en", label: { ar: "نص الزر (إنجليزي)", en: "Button (EN)" } },
  { key: "cta_href", label: { ar: "رابط الزر", en: "Button href" } },
];

function RouteComponent() {
  const { lang } = useAdminLang();
  const qc = useQueryClient();
  const loadFn = useServerFn(getServiceTierPageCopy);
  const saveFn = useServerFn(saveServiceTierPageCopy);

  const q = useQuery({ queryKey: ["service-tier-page-copy"], queryFn: () => loadFn() });
  const [values, setValues] = useState<Partial<ServiceTierPageDTO>>({});
  useEffect(() => {
    if (q.data) setValues(q.data);
  }, [q.data]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: values }),
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
      qc.invalidateQueries({ queryKey: ["service-tier-page-copy"] });
      qc.invalidateQueries({ queryKey: ["service-tiers-page"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof ServiceTierPageDTO, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const renderGroup = (title: string, fields: Field[]) => (
    <section className="rounded-md border p-4">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.area ? "md:col-span-2" : undefined}>
            <Label className="mb-1.5 block text-xs">{f.label[lang]}</Label>
            {f.area ? (
              <Textarea
                rows={3}
                value={(values[f.key] as string) ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            ) : (
              <Input
                value={(values[f.key] as string) ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {lang === "ar" ? "محتوى صفحة فئات الخدمات" : "Service Tiers Page Copy"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {lang === "ar"
              ? "تحكم في النصوص الظاهرة أعلى الصفحة وأسفلها ونداءات الحث."
              : "Manage the hero, comparison heading, footnote, and CTA copy."}
          </p>
        </div>
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending || q.isLoading}>
          <Save className="me-1 h-3.5 w-3.5" />
          {save.isPending
            ? lang === "ar"
              ? "جاري الحفظ..."
              : "Saving..."
            : lang === "ar"
              ? "حفظ"
              : "Save"}
        </Button>
      </header>

      {q.isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      ) : (
        <>
          {renderGroup(lang === "ar" ? "قسم الهيرو" : "Hero section", HERO)}
          {renderGroup(lang === "ar" ? "قسم المقارنة" : "Comparison section", COMPARE)}
          {renderGroup(lang === "ar" ? "قسم الدعوة للتواصل" : "Call-to-action", CTA)}
        </>
      )}
    </div>
  );
}
