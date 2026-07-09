import { createFileRoute, notFound } from "@tanstack/react-router";
import { brandingProjects } from "@/lib/portfolio-data";
import { ProjectDetailView } from "@/views/ProjectDetailView";

export const Route = createFileRoute("/projects/$category/$slug")({
  head: ({ params }) => {
    const p = brandingProjects.find((x) => x.slug === params.slug);
    const title = p ? `${p.name} — ${p.tagline}` : "مشروع — يوسف رحاب";
    const desc = p?.short ?? "تفاصيل المشروع.";
    const path = `/projects/${params.category}/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: `${p?.name ?? "مشروع"}, هوية بصرية, تصميم شعار, يوسف رحاب` },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: path },
        { property: "og:type", content: "article" },
        ...(p ? [{ property: "og:image", content: p.cover }] : []),
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
  loader: ({ params }) => {
    if (params.category !== "branding") throw notFound();
    const project = brandingProjects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { slug: project.slug };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useLoaderData();
  return <ProjectDetailView slug={slug} />;
}
