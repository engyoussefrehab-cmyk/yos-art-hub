import { createFileRoute, useParams } from "@tanstack/react-router";
import { AdminPortfolioEditorView } from "@/views/admin/AdminPortfolioEditorView";

function Editor() {
  const { id } = useParams({ from: "/admin/portfolio/$id" });
  return <AdminPortfolioEditorView id={id} />;
}

export const Route = createFileRoute("/admin/portfolio/$id")({
  component: Editor,
});
