import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO, CategoryDTO } from "@/lib/portfolio.functions";

export function CategoryView({
  category,
  projects,
}: {
  category: CategoryDTO;
  projects: PortfolioDTO[];
}) {
  const { t, lang } = useLang();
  const label = lang === "ar" ? category.name_ar || category.name_en : category.name_en || category.name_ar;
  const desc = lang === "ar" ? category.description_ar : category.description_en;
  const projectsHref = lang === "ar" ? "/projects" : "/en/projects";

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={projectsHref} className="hover:text-foreground">{t("crumb_projects")}</Link>
        <span>/</span>
        <span className="text-foreground">{label}</span>
      </nav>
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("cat_kicker")}</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-tight">{label}</h1>
        {desc && <p className="mt-5 text-lg text-muted-foreground">{desc}</p>}
      </header>

      <div className="mt-14">
        <ProjectsList categorySlug={category.slug} projects={projects} />
      </div>
    </section>
  );
}

function ProjectsList({ categorySlug, projects }: { categorySlug: string; projects: PortfolioDTO[] }) {
  const { t, lang } = useLang();
  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-cream/50 p-10 text-center text-muted-foreground">
        {lang === "ar" ? "لا توجد مشاريع منشورة بعد في هذا القسم." : "No published projects yet in this section."}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {projects.map((p, i) => {
        const name = lang === "ar" ? p.name_ar : p.name_en;
        const short = lang === "ar" ? p.short_ar : p.short_en;
        const idx = String(i + 1).padStart(2, "0");
        const href = lang === "ar"
          ? `/projects/${categorySlug}/${p.slug}`
          : `/en/projects/${categorySlug}/${p.slug}`;
        return (
          <Link
            key={p.slug}
            to={href}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="aspect-[16/11] overflow-hidden bg-muted">
              {p.cover && <img src={p.cover} alt={name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span>{idx}</span>
                <span className="h-px w-8 bg-border" />
                <span>{p.industry ?? ""}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl md:text-3xl font-bold">{name}</h3>
              {p.industry && <div className="mt-1 text-accent font-medium text-sm">{p.industry}</div>}
              <p className="mt-3 text-muted-foreground leading-relaxed">{short}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                {t("view_project")} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
