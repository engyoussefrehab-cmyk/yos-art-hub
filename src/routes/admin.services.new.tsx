import { createFileRoute } from "@tanstack/react-router";
import { AdminServiceEditorView } from "@/views/admin/AdminServiceEditorView";

export const Route = createFileRoute("/admin/services/new")({
  component: () => <AdminServiceEditorView />,
});
