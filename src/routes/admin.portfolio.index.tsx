import { createFileRoute } from "@tanstack/react-router";
import { AdminPortfolioListView } from "@/views/admin/AdminPortfolioListView";

export const Route = createFileRoute("/admin/portfolio/")({
  component: AdminPortfolioListView,
});
