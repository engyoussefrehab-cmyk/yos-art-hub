import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useLang } from "@/i18n/use-lang";
import { sanitizeHtml } from "@/lib/insights-types";
import type { PortfolioDTO, CategoryDTO } from "@/lib/portfolio.functions";

import { pair } from "@/i18n/dictionary";
import { Chip, Heading, PageHero, Pill, Stat, container, focusRing } from "@/components/studio";
export function CategoryView({
  category,
  projects,
}: {
  category: CategoryDTO;
  projects: PortfolioDTO[];
}) {
  const { t, lang } = useLang();
  const label =
    lang === "ar" ? category.name_ar || category.name_en : category.name_en || category.name_ar;
  const desc = lang === "ar" ? category.description_ar : category.description_en;
  const intro = lang === "ar" ? category.intro_ar : category.intro_en;
  const rawContent = lang === "ar" ? category.content_ar : category.content_en;
  const content = useMemo(() => (rawContent ? sanitizeHtml(rawContent) : ""), [rawContent]);
  const ctaLabel = lang === "ar" ? category.cta_label_ar : category.cta_label_en;
  const projectsHref = "/projects";
  const featuredIds = new Set(category.featured_project_ids ?? []);
  const featured = projects.filter((p) => featuredIds.has((p as any).id));
  const rest = projects.filter((p) => !featuredIds.has((p as any).id));
  const ordered = [...featured, ...rest];

  return (
    <>
      <PageHero
        kicker={t("cat_kicker")}
        title={label}
        lede={intro || desc || undefined}
        crumbs={[{ label: t("crumb_projects"), to: projectsHref }, { label }]}
        image={category.hero_image_url || undefined}
        aside={<Stat value={`${projects.length}`} label={t("projects_items")} />}
      >
        <Pill to="/contact" variant="light">
          {t("cta_start_project")}
        </Pill>
      </PageHero>

      <section className={`${container} pb-28 pt-16 md:pb-40 md:pt-24`}>
        {content && (
          <article
            className="prose prose-invert mb-16 max-w-3xl prose-headings:font-display"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        <ProjectsList categorySlug={category.slug} projects={ordered} />

        {category.faq && category.faq.length > 0 && (
          <div className="mt-28 md:mt-40">
            <Heading kicker="أسئلة" title={pair("ui_categoryview_1")[0]} />
            <div className="mt-10 border-t border-white/10">
              {category.faq.map((f, i) => {
                const q = f.q_ar;
                const a = f.a_ar;
                if (!q && !a) return null;
                return (
                  <details key={i} className="group border-b border-white/10 py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold md:text-xl">
                      {q}
                      <span
                        aria-hidden
                        className="text-2xl text-accent transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    {a && <p className="mt-3 max-w-3xl leading-[1.9] text-muted-foreground">{a}</p>}
                  </details>
                );
              })}
            </div>
          </div>
        )}

        {ctaLabel && category.cta_href && (
          <div className="mt-16">
            <Pill to={category.cta_href} variant="red">
              {ctaLabel}
            </Pill>
          </div>
        )}
      </section>
    </>
  );
}

function ProjectsList({
  categorySlug,
  projects,
}: {
  categorySlug: string;
  projects: PortfolioDTO[];
}) {
  const { lang } = useLang();
  if (projects.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/15 p-10 text-center text-muted-foreground">
        {lang === "ar" ? pair("ui_categoryview_2")[0] : pair("ui_categoryview_2")[1]}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {projects.map((p) => {
        const name = p.name_ar;
        const short = p.short_ar;
        const href = `/projects/${categorySlug}/${p.slug}`;
        return (
          <Link key={p.slug} to={href} className={`group flex flex-col ${focusRing}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-white/5 sm:rounded-[1.75rem]">
              {p.cover && (
                <img
                  src={p.cover}
                  alt={name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              {p.year && (
                <span className="absolute bottom-3 start-3 hidden sm:block">
                  <Chip tone="dark">{p.year}</Chip>
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-sm font-bold leading-snug transition-colors group-hover:text-accent sm:mt-4 sm:text-lg">
              {name}
            </h3>
            {short && (
              <p className="mt-1 hidden text-sm text-muted-foreground line-clamp-1 sm:block">
                {short}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
