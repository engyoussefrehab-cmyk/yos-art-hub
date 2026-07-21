import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowUpRight, Pause, Play, Sparkles } from "lucide-react";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";

const CAT_LABELS: Record<string, { ar: string; en: string }> = {
  branding: { ar: "الهوية البصرية", en: "Brand Identity" },
  logos: { ar: "الشعارات", en: "Logos" },
  profiles: { ar: "ملفات الشركات", en: "Company Profiles" },
  social: { ar: "سوشيال ميديا", en: "Social Media" },
};

export function LatestProjectsSlider({
  projects,
  limit = 8,
  compact = false,
  autoPlay = true,
  speed = 0.35,
}: {
  projects: PortfolioDTO[];
  limit?: number;
  compact?: boolean;
  autoPlay?: boolean;
  /** pixels per animation frame */
  speed?: number;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);

  const items = [...projects]
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, limit);

  // Duplicate list for seamless loop
  const loop = autoPlay && items.length > 1 ? [...items, ...items] : items;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateBtns = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max);
    // For autoplay loop we use scrollWidth/2 as the effective range
    const range = autoPlay && items.length > 1 ? el.scrollWidth / 2 : (el.scrollWidth - el.clientWidth);
    if (range > 0) {
      const p = isAr
        ? 1 - ((el.scrollLeft - (autoPlay ? el.scrollWidth / 2 : 0)) / range) * -1
        : (el.scrollLeft % range) / range;
      setProgress(Math.max(0, Math.min(1, isAr ? Math.abs(p % 1) : p)));
    }
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

  // Auto-play continuous scroll (respects prefers-reduced-motion)
  useEffect(() => {
    if (!isPlaying || !autoPlay || items.length < 2) return;
    const el = scrollerRef.current;
    if (!el) return;
    const mq = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    if (mq?.matches) return;
    let raf = 0;
    const step = () => {
      if (!pausedRef.current && el) {
        const half = el.scrollWidth / 2;
        const delta = speed * (isAr ? -1 : 1);
        let next = el.scrollLeft + delta;
        if (!isAr && next >= half) next -= half;
        if (isAr && next <= 0) next += half;
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(step);
    };
    if (isAr) el.scrollLeft = el.scrollWidth / 2;
    raf = requestAnimationFrame(step);
    const onChange = () => { if (mq?.matches) cancelAnimationFrame(raf); };
    mq?.addEventListener?.("change", onChange);
    return () => {
      cancelAnimationFrame(raf);
      mq?.removeEventListener?.("change", onChange);
    };
  }, [isPlaying, autoPlay, items.length, isAr, speed]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 640);
    el.scrollBy({ left: dir * step * (isAr ? -1 : 1), behavior: "smooth" });
  };

  if (items.length === 0) return null;

  const cardWidth = compact
    ? "basis-[74%] sm:basis-[44%] md:basis-[32%] lg:basis-[24%] shrink-0 grow-0 min-w-0 snap-start"
    : "basis-[86%] sm:basis-[60%] lg:basis-[40%] shrink-0 grow-0 min-w-0 snap-start";
  const aspect = "aspect-[4/3]";
  const titleClass = compact ? "text-sm sm:text-base" : "text-2xl";
  const pad = compact ? "p-3 sm:p-4" : "p-6";

  const allProjectsHref = isAr ? "/projects" : "/en/projects";

  return (
    <section className={compact ? "" : "mt-16"}>
      {/* Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-widest text-accent ${compact ? "text-[10px]" : "text-xs"}`}>
            <Sparkles className="h-3 w-3" />
            {t("مختارات جديدة", "Fresh work")}
          </div>
          <h2 className={`mt-2 font-display font-bold leading-[1.1] ${compact ? "text-xl md:text-2xl" : "text-3xl md:text-5xl"}`}>
            {t("أحدث المشاريع", "Latest projects")}
          </h2>
          {!compact && (
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              {t(
                "لمحة سريعة من آخر ما أنجزته — مرّر جانبيًا لاستكشاف الأعمال.",
                "A quick glance at the latest work — swipe sideways to explore.",
              )}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!compact && (
            <Link
              to={allProjectsHref}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-accent/50 hover:text-accent sm:inline-flex"
            >
              {t("كل المشاريع", "View all")}
              <ArrowUpRight className={`h-3.5 w-3.5 ${isAr ? "-scale-x-100" : ""}`} />
            </Link>
          )}
          {autoPlay && items.length > 1 && (
            <button
              type="button"
              aria-label={isPlaying ? t("إيقاف", "Pause") : t("تشغيل", "Play")}
              onClick={() => setIsPlaying((v) => !v)}
              className={`rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted ${compact ? "p-1.5" : "p-2"}`}
            >
              {isPlaying ? <Pause className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> : <Play className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
            </button>
          )}
          <button
            type="button"
            aria-label={t("السابق", "Previous")}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onClick={() => scrollBy(-1)}
            disabled={!autoPlay && !canPrev}
            className={`rounded-full border border-border bg-background text-foreground transition-opacity disabled:opacity-30 hover:bg-muted ${compact ? "p-1.5" : "p-2"}`}
          >
            {isAr ? <ChevronRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> : <ChevronLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
          </button>
          <button
            type="button"
            aria-label={t("التالي", "Next")}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onClick={() => scrollBy(1)}
            disabled={!autoPlay && !canNext}
            className={`rounded-full border border-border bg-background text-foreground transition-opacity disabled:opacity-30 hover:bg-muted ${compact ? "p-1.5" : "p-2"}`}
          >
            {isAr ? <ChevronLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} /> : <ChevronRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
          </button>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={scrollerRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onPointerDown={pause}
        onPointerUp={resume}
        className={`${compact ? "mt-4 gap-3 sm:gap-4" : "mt-8 gap-5"} flex cursor-grab snap-x active:cursor-grabbing ${autoPlay ? "" : "snap-mandatory"} overflow-x-auto ${autoPlay ? "" : "scroll-smooth"} pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {loop.map((p, i) => {
          const name = isAr ? p.name_ar : p.name_en;
          const short = isAr ? p.short_ar : p.short_en;
          const catLabel = p.category_slug
            ? CAT_LABELS[p.category_slug]?.[isAr ? "ar" : "en"] ?? p.category_slug
            : null;
          const href = isAr
            ? `/projects/${p.category_slug ?? "branding"}/${p.slug}`
            : `/en/projects/${p.category_slug ?? "branding"}/${p.slug}`;
          return (
            <Link
              key={`${p.slug}-${i}`}
              to={href}
              aria-hidden={i >= items.length ? true : undefined}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-cream transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-xl ${cardWidth}`}
            >
              <div className={`${aspect} relative overflow-hidden bg-muted`}>
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                )}
                {/* Overlay on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Category chip */}
                {catLabel && !compact && (
                  <span className="absolute start-4 top-4 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground shadow-sm backdrop-blur">
                    {catLabel}
                  </span>
                )}
                {/* Featured badge */}
                {p.featured && !compact && (
                  <span className="absolute end-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground shadow-sm">
                    {t("مميّز", "Featured")}
                  </span>
                )}
                {/* Hover CTA */}
                {!compact && (
                  <span className="absolute bottom-4 end-4 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {t("عرض المشروع", "View project")}
                    <ArrowUpRight className={`h-3.5 w-3.5 ${isAr ? "-scale-x-100" : ""}`} />
                  </span>
                )}
              </div>
              <div className={pad}>
                {!compact && (
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.industry && <span>{p.industry}</span>}
                    {p.year && <span>· {p.year}</span>}
                    {p.country && <span>· {p.country}</span>}
                  </div>
                )}
                <h3 className={`${compact ? "" : "mt-2"} truncate font-display font-bold transition-colors group-hover:text-accent ${titleClass}`}>{name}</h3>
                {!compact && short && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{short}</p>}
                {!compact && p.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((tg) => (
                      <span key={tg} className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                        {tg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Progress bar */}
      {!compact && items.length > 1 && (
        <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${Math.max(6, progress * 100)}%` }}
          />
        </div>
      )}

      {/* Mobile "View all" */}
      {!compact && (
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to={allProjectsHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            {t("عرض كل المشاريع", "View all projects")}
            <ArrowUpRight className={`h-3.5 w-3.5 ${isAr ? "-scale-x-100" : ""}`} />
          </Link>
        </div>
      )}
    </section>
  );
}
