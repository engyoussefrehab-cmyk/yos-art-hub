import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/categories")({
  beforeLoad: () => {
    // Categories are currently managed through the Insights section.
    throw redirect({ to: "/admin/insights" });
  },
});
