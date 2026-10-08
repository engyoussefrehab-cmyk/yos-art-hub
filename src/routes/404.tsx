import { createFileRoute } from "@tanstack/react-router";
import { NotFoundComponent } from "./__root";

// Prerendered to /404.html — GitHub Pages serves it for any unknown URL.
export const Route = createFileRoute("/404")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: NotFoundComponent,
});
