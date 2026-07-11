import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/portfolio")({
  component: () => (
    <ComingSoonPanel
      title="المشاريع"
      description="إدارة مشاريع البرتفوليو: العميل، القطاع، التحدي، الحل، النتائج، معرض الصور، والوسوم. مع خيارات النشر والجدولة والتمييز."
      phase="المرحلة 2 · Portfolio CMS"
    />
  ),
});
