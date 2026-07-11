import { createFileRoute } from "@tanstack/react-router";
import { AdminArticleEditorView } from "@/views/admin/AdminArticleEditorView";

export const Route = createFileRoute("/admin/insights/new")({
  component: () => <AdminArticleEditorView />,
});
