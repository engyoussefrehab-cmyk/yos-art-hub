import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <ComingSoonPanel
      title="إعدادات الموقع"
      description="اللوجو، الفافيكون، بيانات الشركة، وسائل التواصل، وإعدادات التتبع (Google Analytics، Search Console، Tag Manager، Facebook Pixel)."
      phase="المرحلة 4 · Website Settings"
    />
  ),
});
