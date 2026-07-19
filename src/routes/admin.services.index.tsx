import { createFileRoute } from "@tanstack/react-router";
import { AdminServicesListView } from "@/views/admin/AdminServicesListView";

export const Route = createFileRoute("/admin/services/")({
  component: AdminServicesListView,
});
