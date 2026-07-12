import { createFileRoute } from "@tanstack/react-router";
import { AdminPortfolioEditorView } from "@/views/admin/AdminPortfolioEditorView";

export const Route = createFileRoute("/admin/portfolio/new")({
  component: () => <AdminPortfolioEditorView />,
});
