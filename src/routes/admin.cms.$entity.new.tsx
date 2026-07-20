import { createFileRoute } from "@tanstack/react-router";
import { GenericEditorView } from "@/admin/lib/GenericEditorView";

export const Route = createFileRoute("/admin/cms/$entity/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const { entity } = Route.useParams();
  return <GenericEditorView entityKey={entity} mode="create" />;
}
