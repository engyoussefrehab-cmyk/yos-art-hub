import { createFileRoute, notFound } from "@tanstack/react-router";
import { brandingProjects } from "@/lib/portfolio-data";
import { brandingEn } from "@/i18n/portfolio-en";
import { ProjectDetailView } from "@/views/ProjectDetailView";

export const Route = createFileRoute("/en/projects/$category/$slug")({
  head: ({ params }) => {
    const p = brandingProjects.find((x) => x.slug === params.slug);
    const en = brandingEn[params.slug];
    const name = en?.name ?? p?.name ?? "Project";
    const tagline = en?.tagline ?? p?.tagline ?? "";
    const desc = en?.short ?? p?.short ?? "Project details.";
    const title = tagline ? `${name} — ${tagline}` : `${name} — Youssef Rehab`;
    const path = `/en/projects/${params.category}/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: `${name}, brand identity, logo design, Youssef Rehab` },
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
