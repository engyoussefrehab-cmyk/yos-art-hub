import { createFileRoute } from "@tanstack/react-router";
import { GenericEditorView } from "@/admin/lib/GenericEditorView";

export const Route = createFileRoute("/admin/cms/$entity/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { entity, id } = Route.useParams();
  return <GenericEditorView entityKey={entity} id={id} mode="edit" />;
}
