import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import p5 from "@/assets/portfolio/page_5.webp";
import p22 from "@/assets/portfolio/page_22.webp";
import p27 from "@/assets/portfolio/page_27.webp";
import p34 from "@/assets/portfolio/page_34.webp";

const categories = [
  { slug: "branding", cover: p5, count: 8 },
  { slug: "logos", cover: p22, count: 40 },
  { slug: "profiles", cover: p27, count: 6 },
  { slug: "social", cover: p34, count: 7 },
];

const catI18n: Record<string, { label: DictKey; desc: DictKey }> = {
  branding: { label: "cat_branding_label", desc: "cat_branding_desc" },
  logos: { label: "cat_logos_label", desc: "cat_logos_desc" },
  profiles: { label: "cat_profiles_label", desc: "cat_profiles_desc" },
  social: { label: "cat_social_label", desc: "cat_social_desc" },
};

export function ProjectsHubView() {
  const { t, lang } = useLang();
  const catBase = lang === "ar" ? "/projects" : "/en/projects";
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("projects_kicker")}</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-tight">{t("projects_title")}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{t("projects_lede")}</p>
      </header>
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((c, i) => {
          const meta = catI18n[c.slug];
          const label = meta ? t(meta.label) : c.slug;
          const desc = meta ? t(meta.desc) : "";
          const idx = String(i + 1).padStart(2, "0");
          const href = lang === "ar" ? `/projects/${c.slug}` : `/en/projects/${c.slug}`;
          return (
            <Link
              key={c.slug}
              to={href}
              className="group relative overflow-hidden rounded-3xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={c.cover} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{idx}</div>
                  <div className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">{c.count}+ {t("projects_items")}</div>
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold">{label}</h2>
                <p className="mt-2 text-muted-foreground">{desc}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  {t("projects_view_section")} <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {/* silence unused when catBase not used */}
      <span hidden>{catBase}</span>
    </section>
  );
}
