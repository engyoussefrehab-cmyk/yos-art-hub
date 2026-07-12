import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";
import type { PortfolioDTO } from "@/lib/portfolio.functions";

const catI18n: Record<string, { label: DictKey; desc: DictKey }> = {
  branding: { label: "cat_branding_label", desc: "cat_branding_desc" },
  logos: { label: "cat_logos_label", desc: "cat_logos_desc" },
  profiles: { label: "cat_profiles_label", desc: "cat_profiles_desc" },
  social: { label: "cat_social_label", desc: "cat_social_desc" },
};

// Static image boards for non-branding categories (illustrative moodboards).
import p22 from "@/assets/portfolio/page_22.webp";
import p23 from "@/assets/portfolio/page_23.webp";
import p24 from "@/assets/portfolio/page_24.webp";
import p25 from "@/assets/portfolio/page_25.webp";
import p27 from "@/assets/portfolio/page_27.webp";
import p28 from "@/assets/portfolio/page_28.webp";
import p29 from "@/assets/portfolio/page_29.webp";
import p30 from "@/assets/portfolio/page_30.webp";
import p31 from "@/assets/portfolio/page_31.webp";
import p32 from "@/assets/portfolio/page_32.webp";
import p34 from "@/assets/portfolio/page_34.webp";
import p35 from "@/assets/portfolio/page_35.webp";
import p36 from "@/assets/portfolio/page_36.webp";
import p37 from "@/assets/portfolio/page_37.webp";
import p38 from "@/assets/portfolio/page_38.webp";
import p39 from "@/assets/portfolio/page_39.webp";
import p40 from "@/assets/portfolio/page_40.webp";

const logoBoards = [p22, p23, p24, p25];
const profileBoards = [p27, p28, p29, p30, p31, p32];
const socialBoards = [p34, p35, p36, p37, p38, p39, p40];

export function CategoryView({ categorySlug, projects }: { categorySlug: string; projects: PortfolioDTO[] }) {
  const { t, lang } = useLang();
  const meta = catI18n[categorySlug];
  if (!meta) return null;
  const label = t(meta.label);
  const desc = t(meta.desc);
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
        <p className="mt-5 text-lg text-muted-foreground">{desc}</p>
      </header>

      <div className="mt-14">
        {categorySlug === "branding" && <BrandingList projects={projects} />}
        {categorySlug === "logos" && <ImageGrid images={logoBoards} labelKey="logo_board" cols={2} />}
        {categorySlug === "profiles" && <ImageGrid images={profileBoards} labelKey="profile_board" cols={3} />}
        {categorySlug === "social" && <ImageGrid images={socialBoards} labelKey="post_board" cols={3} />}
      </div>
    </section>
  );
}

function BrandingList({ projects }: { projects: PortfolioDTO[] }) {
  const { t, lang } = useLang();
  if (projects.length === 0) {
    return <p className="text-muted-foreground">لا توجد مشاريع منشورة بعد.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {projects.map((p, i) => {
        const name = lang === "ar" ? p.name_ar : p.name_en;
        const short = lang === "ar" ? p.short_ar : p.short_en;
        const idx = String(i + 1).padStart(2, "0");
        const href = lang === "ar" ? `/projects/branding/${p.slug}` : `/en/projects/branding/${p.slug}`;
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

function ImageGrid({ images, labelKey, cols }: { images: string[]; labelKey: DictKey; cols: 2 | 3 }) {
  const { t } = useLang();
  const gridCls = cols === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  const label = t(labelKey);
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
