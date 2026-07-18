import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";
import { ProjectBlocksRenderer } from "@/components/project-blocks/ProjectBlocksRenderer";
import { ZoomableImage } from "@/components/ZoomableImage";

export function ProjectDetailView({ project, next }: { project: PortfolioDTO; next: PortfolioDTO | null }) {
  const { t, lang } = useLang();
  const name = lang === "ar" ? project.name_ar : project.name_en;
  const short = lang === "ar" ? project.short_ar : project.short_en;
  const description = lang === "ar" ? project.description_ar : project.description_en;
  const approach = lang === "ar" ? project.approach_ar : project.approach_en;
  const value = lang === "ar" ? project.value_ar : project.value_en;

  const projectsHref = lang === "ar" ? "/projects" : "/en/projects";
  const brandingHref = lang === "ar" ? "/projects/branding" : "/en/projects/branding";
  const nextHref = next ? (lang === "ar" ? `/projects/branding/${next.slug}` : `/en/projects/branding/${next.slug}`) : brandingHref;
  const nextName = next ? (lang === "ar" ? next.name_ar : next.name_en) : "";
  const arrow = lang === "ar" ? "←" : "→";

  return (
    <article>
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
          <nav className="mb-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={projectsHref} className="hover:text-foreground">{t("crumb_projects")}</Link>
            <span>/</span>
            <Link to={brandingHref} className="hover:text-foreground">{t("cat_branding_label")}</Link>
            <span>/</span>
            <span className="text-foreground">{name}</span>
          </nav>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span>{t("proj_kind")}</span>
                <span className="h-px w-8 bg-border" />
                <span>{project.industry ?? ""}</span>
              </div>
              <h1 className="mt-4 font-display text-5xl md:text-7xl font-bold leading-[1.05]">{name}</h1>
              {project.industry && <div className="mt-3 text-accent font-medium text-lg">{project.industry}</div>}
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{short}</p>
              <p className="mt-4 max-w-xl leading-relaxed text-foreground/85">{description}</p>
            </div>
            <div className="md:col-span-5">
              <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-background p-6">
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">{t("proj_specialty")}</dt>
                  <dd className="mt-1 font-semibold">{t("proj_kind")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">{t("proj_type")}</dt>
                  <dd className="mt-1 font-semibold">Logo & Identity</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {project.cover && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-cream">
            <img src={project.cover} alt={name} loading="eager" decoding="async" className="w-full" />
          </div>
        </section>
      )}

      {approach.length > 0 && (
        <section className="border-y border-border bg-ink text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("proj_approach_kicker")}</span>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight">{t("proj_approach_title")}</h2>
            </div>
            <div className="md:col-span-7">
              <ul className="space-y-4">
                {approach.map((a, i) => (
                  <li key={i} className="flex items-start gap-4 border-b border-white/10 pb-4">
                    <span className="font-display text-2xl font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-lg text-white/85 leading-relaxed">{a}</span>
                  </li>
                ))}
              </ul>
              {value && (
                <div className="mt-10 rounded-2xl border border-accent/40 bg-accent/10 p-6">
                  <div className="text-xs uppercase tracking-widest text-accent">{t("proj_value")}</div>
                  <p className="mt-2 text-lg leading-relaxed">{value}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}


      {project.blocks.length > 0 && (
        <ProjectBlocksRenderer blocks={project.blocks} lang={lang} />
      )}

      {project.blocks.length === 0 && project.gallery.slice(1).map((src, i) => (
        <section key={i} className="mx-auto max-w-7xl px-6 py-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-cream">
            <img loading="lazy" decoding="async" src={src} alt={`${name} ${i + 2}`} className="w-full" />
          </div>
        </section>
      ))}

      {next && (
        <section className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("proj_next")}</div>
              <div className="mt-2 font-display text-3xl md:text-4xl font-bold">{nextName}</div>
            </div>
            <div className="flex gap-3">
              <Link to={brandingHref} className="rounded-full border border-primary/20 px-6 py-3 text-sm font-semibold hover:bg-cream">{t("proj_all")}</Link>
              <Link to={nextHref} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{lang === "ar" ? `التالي ${arrow}` : `Next ${arrow}`}</Link>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
