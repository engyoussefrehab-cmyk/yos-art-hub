import { createFileRoute } from "@tanstack/react-router";
import { GenericListView } from "@/admin/lib/GenericListView";

export const Route = createFileRoute("/admin/cms/$entity/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { entity } = Route.useParams();
  return <GenericListView entityKey={entity} />;
}
