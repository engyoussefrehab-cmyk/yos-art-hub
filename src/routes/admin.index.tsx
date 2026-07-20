import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/admin/shell/AdminDashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});
