import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/pages")({
  component: () => (
    <ComingSoonPanel
      title="صفحات الموقع"
      description="إدارة الصفحات الثابتة: الرئيسية، من نحن، الخدمات، البرتفوليو، Insights، التواصل، سياسة الخصوصية. كل صفحة ستدعم Hero وSEO ومحرر بلوكات مرن."
      phase="المرحلة 2 · Pages CMS"
    />
  ),
});
