import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";

export function LatestProjectsSlider({ projects, limit = 8 }: { projects: PortfolioDTO[]; limit?: number }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);

  const items = [...projects]
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, limit);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateBtns = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max);
  };

  useEffect(() => {
    updateBtns();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateBtns, { passive: true });
    window.addEventListener("resize", updateBtns);
    return () => {
      el.removeEventListener("scroll", updateBtns);
      window.removeEventListener("resize", updateBtns);
    };
  }, [items.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 640);
    el.scrollBy({ left: dir * step * (isAr ? -1 : 1), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("مختارات جديدة", "Fresh work")}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            {t("أحدث المشاريع", "Latest projects")}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={t("السابق", "Previous")}
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            className="rounded-full border border-border bg-background p-2 text-foreground transition-opacity disabled:opacity-30 hover:bg-muted"
          >
            {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label={t("التالي", "Next")}
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            className="rounded-full border border-border bg-background p-2 text-foreground transition-opacity disabled:opacity-30 hover:bg-muted"
          >
            {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p) => {
          const name = isAr ? p.name_ar : p.name_en;
          const short = isAr ? p.short_ar : p.short_en;
          const href = isAr
            ? `/projects/${p.category_slug ?? "branding"}/${p.slug}`
            : `/en/projects/${p.category_slug ?? "branding"}/${p.slug}`;
          return (
            <Link
              key={p.slug}
              to={href}
              className="group relative w-[85%] flex-none snap-start overflow-hidden rounded-3xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl sm:w-[60%] lg:w-[38%]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {p.industry && <span>{p.industry}</span>}
                  {p.year && <span>· {p.year}</span>}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">{name}</h3>
                {short && <p className="mt-2 line-clamp-2 text-muted-foreground">{short}</p>}
              </div>
              {p.featured && (
                <span className="absolute end-4 top-4 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                  {t("مميّز", "Featured")}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
