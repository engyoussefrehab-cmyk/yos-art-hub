import { createFileRoute } from "@tanstack/react-router";
import { AdminArticlesListView } from "@/views/admin/AdminArticlesListView";

export const Route = createFileRoute("/admin/insights/")({
  component: AdminArticlesListView,
});
