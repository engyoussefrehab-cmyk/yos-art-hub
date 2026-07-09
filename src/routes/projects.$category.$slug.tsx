import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { brandingProjects } from "@/lib/portfolio-data";

export const Route = createFileRoute("/projects/$category/$slug")({
  head: ({ params }) => {
    const p = brandingProjects.find((x) => x.slug === params.slug);
    const title = p ? `${p.name} — ${p.tagline}` : "مشروع — يوسف رحاب";
    const desc = p?.short ?? "تفاصيل المشروع.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(p ? [{ property: "og:image", content: p.cover }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    if (params.category !== "branding") throw notFound();
    const project = brandingProjects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    const idx = brandingProjects.findIndex((p) => p.slug === params.slug);
    const next = brandingProjects[(idx + 1) % brandingProjects.length];
    return { project, next };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project, next } = Route.useLoaderData();
  return (
    <article>
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
          <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/projects" className="hover:text-foreground">المشاريع</Link>
            <span>/</span>
            <Link to="/projects/$category" params={{ category: "branding" }} className="hover:text-foreground">الهوية البصرية</Link>
            <span>/</span>
            <span className="text-foreground">{project.name}</span>
          </nav>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span>هوية بصرية</span>
                <span className="h-px w-8 bg-border" />
                <span>{project.country} · {project.year}</span>
              </div>
              <h1 className="mt-4 font-display text-5xl md:text-7xl font-bold leading-[1.05]">{project.name}</h1>
              <div className="mt-3 text-accent font-medium text-lg">{project.tagline}</div>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{project.description}</p>
            </div>
            <div className="md:col-span-5">
              <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-background p-6">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">التخصص</dt>
                  <dd className="mt-1 font-semibold">هوية بصرية</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">السنة</dt>
                  <dd className="mt-1 font-semibold">{project.year}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">الدولة</dt>
                  <dd className="mt-1 font-semibold">{project.country}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">النوع</dt>
                  <dd className="mt-1 font-semibold">Logo & Identity</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="overflow-hidden rounded-3xl border border-border bg-cream">
          <img src={project.cover} alt={project.name} className="w-full" />
        </div>
      </section>

      <section className="border-y border-border bg-ink text-primary-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">التوجّه والمقاربة</span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">كيف بنينا الهوية</h2>
          </div>
          <div className="md:col-span-7">
            <ul className="space-y-4">
              {project.approach.map((a: string, i: number) => (
                <li key={a} className="flex items-start gap-4 border-b border-white/10 pb-4">
                  <span className="font-display text-2xl font-bold text-accent">٠{i + 1}</span>
                  <span className="text-lg text-white/85 leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-2xl border border-accent/40 bg-accent/10 p-6">
              <div className="text-xs uppercase tracking-widest text-accent">Value Proposition</div>
              <p className="mt-2 text-lg leading-relaxed">{project.value}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="overflow-hidden rounded-3xl border border-border bg-cream">
          <img src={project.mockup} alt={`${project.name} mockups`} className="w-full" />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">المشروع التالي</div>
            <div className="mt-2 font-display text-3xl md:text-4xl font-bold">{next.name}</div>
            <div className="mt-1 text-accent">{next.tagline}</div>
          </div>
          <div className="flex gap-3">
            <Link to="/projects/$category" params={{ category: "branding" }} className="rounded-full border border-primary/20 px-6 py-3 text-sm font-semibold hover:bg-cream">كل المشاريع</Link>
            <Link to="/projects/$category/$slug" params={{ category: "branding", slug: next.slug }} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">التالي ←</Link>
          </div>
        </div>
      </section>
    </article>
  );
}
