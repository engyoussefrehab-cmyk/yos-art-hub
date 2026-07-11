import { Construction } from "lucide-react";

export function ComingSoonPanel({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase?: string;
}) {
  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Construction className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">قيد التطوير</div>
            <div className="text-sm text-muted-foreground">
              الجدول والصلاحيات جاهزة في قاعدة البيانات. الواجهة الكاملة (إنشاء،
              تحرير، حذف، بحث وفلترة) ستُضاف في المرحلة القادمة.
            </div>
            {phase && (
              <div className="pt-2 text-[11px] text-muted-foreground/80">{phase}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
