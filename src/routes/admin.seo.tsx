import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/seo")({
  component: () => (
    <ComingSoonPanel
      title="مدير SEO"
      description="عرض شامل لجميع الصفحات المنشورة مع التنبيه لأي عناصر SEO ناقصة (عنوان، وصف، صورة OG)، وتوليد Sitemap تلقائي من قاعدة البيانات."
      phase="المرحلة 4 · SEO Manager"
    />
  ),
});
