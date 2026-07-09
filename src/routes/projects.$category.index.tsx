import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { brandingProjects, categories, logoBoards, profileBoards, socialBoards } from "@/lib/portfolio-data";

export const Route = createFileRoute("/projects/$category/")({
  head: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    const title = cat ? `${cat.label} — يوسف رحاب` : "مشاريع — يوسف رحاب";
    const desc = cat?.desc ?? "أعمال مختارة.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    if (!cat) throw notFound();
    return { category: cat };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/projects" className="hover:text-foreground">المشاريع</Link>
        <span>/</span>
        <span className="text-foreground">{category.label}</span>
      </nav>
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">تخصّص</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-tight">{category.label}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{category.desc}</p>
      </header>

      <div className="mt-14">
        {category.slug === "branding" && <BrandingList />}
        {category.slug === "logos" && <ImageGrid images={logoBoards} label="لوحة شعارات" cols={2} />}
        {category.slug === "profiles" && <ImageGrid images={profileBoards} label="ملف شركة" cols={3} />}
        {category.slug === "social" && <ImageGrid images={socialBoards} label="منشور" cols={3} />}
      </div>
    </section>
  );
}

function BrandingList() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {brandingProjects.map((p, i) => (
        <Link
          key={p.slug}
          to="/projects/$category/$slug"
          params={{ category: "branding", slug: p.slug }}
          className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="aspect-[16/11] overflow-hidden">
            <img src={p.cover} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span>٠{i + 1}</span>
              <span className="h-px w-8 bg-border" />
              <span>{p.country} · {p.year}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold">{p.name}</h3>
            <div className="mt-1 text-accent font-medium text-sm">{p.tagline}</div>
            <p className="mt-3 text-muted-foreground leading-relaxed">{p.short}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              عرض المشروع <span aria-hidden>←</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ImageGrid({ images, label, cols }: { images: string[]; label: string; cols: 2 | 3 }) {
  const gridCls = cols === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 gap-6 ${gridCls}`}>
      {images.map((src, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-cream">
          <img src={src} alt={`${label} ${i + 1}`} loading="lazy" className="w-full" />
        </div>
      ))}
    </div>
  );
}
