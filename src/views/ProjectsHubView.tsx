import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import type { PortfolioDTO, CategoryDTO } from "@/lib/portfolio.functions";
import { LatestProjectsSlider } from "@/components/projects/LatestProjectsSlider";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { Reveal } from "@/components/Reveal";
import p5 from "@/assets/portfolio/page_5.webp";
import p22 from "@/assets/portfolio/page_22.webp";
import p27 from "@/assets/portfolio/page_27.webp";
import p34 from "@/assets/portfolio/page_34.webp";

const FALLBACK_COVERS: Record<string, string> = {
  branding: p5,
  logos: p22,
  profiles: p27,
  social: p34,
};

const FALLBACK_I18N: Record<string, { label: DictKey; desc: DictKey }> = {
  branding: { label: "cat_branding_label", desc: "cat_branding_desc" },
  logos: { label: "cat_logos_label", desc: "cat_logos_desc" },
  profiles: { label: "cat_profiles_label", desc: "cat_profiles_desc" },
  social: { label: "cat_social_label", desc: "cat_social_desc" },
};

export function ProjectsHubView({
  projects = [],
  categories = [],
  routeId,
}: {
  projects?: PortfolioDTO[];
  categories?: CategoryDTO[];
  routeId: "/projects/" | "/en/projects/";
}) {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const totalProjects = projects.length;
  const sectorCount = new Set(projects.map((p) => p.industry).filter(Boolean) as string[]).size;
  const countryCount = new Set(projects.map((p) => p.country).filter(Boolean) as string[]).size;

  const stats: { value: string; label: string }[] = [
    { value: `${totalProjects}+`, label: t("projects_stat_projects") },
    { value: `${sectorCount || categories.length}+`, label: t("projects_stat_sectors") },
    { value: `${countryCount || 4}+`, label: t("projects_stat_countries") },
  ];

  return (
    <>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-cream/60 via-background to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[-10%] h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 start-[-8%] h-[420px] w-[420px] rounded-full bg-primary/5 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:pt-28">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {t("projects_kicker")}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              {t("projects_title")}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">{t("projects_lede")}</p>
          </Reveal>

          <Reveal delay={240}>
            <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border/60 bg-cream/60 p-4 sm:p-6"
                >
                  <dt className="font-display text-3xl font-bold sm:text-4xl">{s.value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ─── Latest projects ─────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-16">
          <Reveal>
            <LatestProjectsSlider projects={projects} />
          </Reveal>
        </section>
      )}

      {/* ─── Category grid ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6 border-t border-border/60 pt-10">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-accent">
                {t("projects_kicker")}
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{t("projects_title")}</h2>
            </div>
            <div className="hidden shrink-0 text-sm text-muted-foreground sm:block">
              {categories.length} {t("projects_items")}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((c, i) => {
            const fallbackMeta = FALLBACK_I18N[c.slug];
            const label = lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar;
            const dbDesc = lang === "ar" ? c.description_ar : c.description_en;
            const desc = dbDesc || (fallbackMeta ? t(fallbackMeta.desc) : "");
            const cover = c.cover_image_url || FALLBACK_COVERS[c.slug] || FALLBACK_COVERS.branding;
            const idx = String(i + 1).padStart(2, "0");
            const href = lang === "ar" ? `/projects/${c.slug}` : `/en/projects/${c.slug}`;
            return (
              <Reveal key={c.slug} delay={i * 60}>
                <Link
                  to={href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-cream transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-2xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={cover}
                      alt={label}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/0 to-background/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute end-4 top-4 flex items-center gap-2">
                      <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-sm backdrop-blur">
                        {c.project_count}+ {t("projects_items")}
                      </span>
                    </div>
                    <span className="absolute bottom-4 start-4 font-display text-3xl font-bold text-foreground/30">
                      {idx}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <h3 className="font-display text-2xl font-bold sm:text-3xl">{label}</h3>
                    {desc && <p className="mt-3 line-clamp-2 text-muted-foreground">{desc}</p>}
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      <span className="relative">
                        {t("projects_view_section")}
                        <span className="absolute -bottom-0.5 start-0 h-[1.5px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
                      </span>
                      <ArrowUpRight
                        className={`h-4 w-4 transition-transform duration-500 ${
                          isAr
                            ? "-scale-x-100 group-hover:-translate-x-1 group-hover:-translate-y-1"
                            : "group-hover:translate-x-1 group-hover:-translate-y-1"
                        }`}
                      />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ─── Advanced browser ────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <Reveal>
            <ProjectsBrowser projects={projects} routeId={routeId} />
          </Reveal>
        </section>
      )}
    </>
  );
}
