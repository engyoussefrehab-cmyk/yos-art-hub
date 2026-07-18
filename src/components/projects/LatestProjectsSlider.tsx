import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/i18n/use-lang";
import type { PortfolioDTO } from "@/lib/portfolio.functions";

export function LatestProjectsSlider({
  projects,
  limit = 8,
  compact = false,
  autoPlay = true,
  speed = 0.6,
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

  // Auto-play continuous scroll (respects prefers-reduced-motion)
  useEffect(() => {
    if (!autoPlay || items.length < 2) return;
    const el = scrollerRef.current;
    if (!el) return;
    const mq = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    if (mq?.matches) return; // user prefers reduced motion — no autoplay
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
    // Start from a neutral position for RTL
    if (isAr) el.scrollLeft = el.scrollWidth / 2;
    raf = requestAnimationFrame(step);
    const onChange = () => { if (mq?.matches) cancelAnimationFrame(raf); };
    mq?.addEventListener?.("change", onChange);
    return () => {
      cancelAnimationFrame(raf);
      mq?.removeEventListener?.("change", onChange);
    };
  }, [autoPlay, items.length, isAr, speed]);

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
    ? "w-[72%] flex-none snap-start xs:w-[60%] sm:w-[38%] md:w-[30%] lg:w-[22%]"
    : "w-[85%] flex-none snap-start sm:w-[60%] lg:w-[38%]";
  const aspect = compact ? "aspect-[4/3]" : "aspect-[4/3]";
  const titleClass = compact ? "text-sm sm:text-base" : "text-2xl";
  const pad = compact ? "p-3 sm:p-4" : "p-6";

  return (
    <section className={compact ? "" : "mt-16"}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className={`font-semibold uppercase tracking-widest text-accent ${compact ? "text-[10px]" : "text-xs"}`}>
            {t("مختارات جديدة", "Fresh work")}
          </div>
          <h2 className={`mt-1 font-display font-bold ${compact ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"}`}>
            {t("أحدث المشاريع", "Latest projects")}
          </h2>
        </div>
        <div className="flex shrink-0 gap-2">
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


      <div
        ref={scrollerRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onPointerDown={pause}
        onPointerUp={resume}
        className={`${compact ? "mt-4 gap-3 sm:gap-4" : "mt-6 gap-5"} flex snap-x ${autoPlay ? "" : "snap-mandatory"} overflow-x-auto ${autoPlay ? "" : "scroll-smooth"} pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {loop.map((p, i) => {
          const name = isAr ? p.name_ar : p.name_en;
          const short = isAr ? p.short_ar : p.short_en;
          const href = isAr
            ? `/projects/${p.category_slug ?? "branding"}/${p.slug}`
            : `/en/projects/${p.category_slug ?? "branding"}/${p.slug}`;
          return (
            <Link
              key={`${p.slug}-${i}`}
              to={href}
              aria-hidden={i >= items.length ? true : undefined}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl ${cardWidth}`}
            >
              <div className={`${aspect} overflow-hidden bg-muted`}>
                {p.cover && (
                  <img
                    src={p.cover}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className={pad}>
                {!compact && (
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.industry && <span>{p.industry}</span>}
                    {p.year && <span>· {p.year}</span>}
                  </div>
                )}
                <h3 className={`${compact ? "" : "mt-2"} truncate font-display font-bold ${titleClass}`}>{name}</h3>
                {!compact && short && <p className="mt-2 line-clamp-2 text-muted-foreground">{short}</p>}
              </div>
              {p.featured && !compact && (
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
