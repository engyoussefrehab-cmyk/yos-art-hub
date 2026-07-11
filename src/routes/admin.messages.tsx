import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export const Route = createFileRoute("/admin/messages")({
  component: () => (
    <ComingSoonPanel
      title="رسائل التواصل"
      description="صندوق الوارد: رسائل نموذج التواصل مع حالات مقروء / غير مقروء / أرشيف، وتحديث لحظي عبر Supabase Realtime."
      phase="المرحلة 4 · Contact Inbox"
    />
  ),
});
