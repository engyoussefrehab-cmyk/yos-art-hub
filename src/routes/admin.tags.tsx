import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/tags")({
  component: () => (
    <ComingSoonPanel
      title="الوسوم"
      description="مكتبة وسوم موحّدة تُستخدم عبر المقالات والمشاريع لتصنيف المحتوى وتحسين البحث الداخلي."
      phase="المرحلة 2 · Taxonomy"
    />
  ),
});
