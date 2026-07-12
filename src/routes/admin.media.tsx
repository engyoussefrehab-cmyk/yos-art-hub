import { createFileRoute } from "@tanstack/react-router";
import { AdminMediaView } from "@/views/admin/AdminMediaView";

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaView,
});
