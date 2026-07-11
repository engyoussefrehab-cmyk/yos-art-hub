import { createFileRoute } from "@tanstack/react-router";
import { AdminArticleEditorView } from "@/views/admin/AdminArticleEditorView";

export const Route = createFileRoute("/admin/insights/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <AdminArticleEditorView articleId={id} />;
  },
});
