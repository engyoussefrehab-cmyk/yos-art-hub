import { createFileRoute, useParams } from "@tanstack/react-router";
import { AdminServiceEditorView } from "@/views/admin/AdminServiceEditorView";

function Editor() {
  const { id } = useParams({ from: "/admin/services/$id" });
  return <AdminServiceEditorView id={id} />;
}

export const Route = createFileRoute("/admin/services/$id")({
  component: Editor,
});
