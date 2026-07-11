import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/media")({
  component: () => (
    <ComingSoonPanel
      title="مكتبة الوسائط"
      description="مركز الوسائط: رفع، بحث، إعادة استخدام، مجلدات، وتحديث النص البديل. يعتمد على Supabase Storage مع روابط موقّعة آمنة."
      phase="المرحلة 4 · Media Library"
    />
  ),
});
