import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/services")({
  component: () => (
    <ComingSoonPanel
      title="الخدمات"
      description="إدارة الخدمات المعروضة على الموقع: العنوان، الوصف، المزايا، الأيقونة، صورة الغلاف، وزر الإجراء."
      phase="المرحلة 2 · Services CMS"
    />
  ),
});
