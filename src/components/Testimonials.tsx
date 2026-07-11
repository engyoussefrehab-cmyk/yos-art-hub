import { useCallback, useEffect, useRef } from "react";
import { testimonials, testimonialStats } from "@/lib/testimonials";
import { useLang } from "@/i18n/use-lang";


function Stars({ n }: { n: number }) {
  const { t } = useLang();
  return (
    <div className="inline-flex items-center gap-0.5 leading-none" aria-label={`${t("t_kicker")}: ${n}/5`} dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" width={16} height={16}
          className={`block shrink-0 ${i < n ? "text-accent" : "text-muted-foreground/25"}`}
          fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}


function QuoteMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-9 w-9 text-accent/25"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.5 8C5.9 8 3 10.9 3 14.5S5.9 21 9.5 21c.5 0 1-.1 1.5-.2-.6 2.5-2.6 4.4-5 5-.4.1-.6.6-.3.9.2.2.5.3.7.2 4.8-1.2 8.6-5.4 8.6-11V14c0-3.3-2.7-6-5.5-6zm14 0C19.9 8 17 10.9 17 14.5S19.9 21 23.5 21c.5 0 1-.1 1.5-.2-.6 2.5-2.6 4.4-5 5-.4.1-.6.6-.3.9.2.2.5.3.7.2 4.8-1.2 8.6-5.4 8.6-11V14c0-3.3-2.7-6-5.5-6z" />
    </svg>
  );
}

function Card({ t: item }: { t: (typeof testimonials)[number] }) {
  const { t, lang } = useLang();
  return (
    <article
      className="group relative flex h-full min-h-[340px] w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background p-8 shadow-[0_1px_0_rgb(0_0_0/0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.18)] sm:min-h-[360px] sm:w-[380px] sm:p-9"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-accent/0 via-accent/60 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <header className="flex items-start justify-between gap-4">
        <QuoteMark />
        <div className="flex h-6 items-center">
          <Stars n={item.rating} />
        </div>
      </header>

      <p className="mt-6 line-clamp-6 text-[15px] leading-[2] text-foreground/90">{item.quote}</p>

      <div className="mt-auto pt-8">
        <div className="flex items-center gap-3 border-t border-border/70 pt-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-base font-semibold text-white ring-1 ring-accent/20">
            {item.name.trim().charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm font-semibold">{item.name}</div>
            <div className="truncate text-xs text-muted-foreground">{item.project}</div>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[10.5px] text-muted-foreground">
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-accent" fill="currentColor" aria-hidden>
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span>{t("t_verified_badge")}</span>
          {lang === "en" && <span className="opacity-60">· {t("t_original_note")}</span>}
        </div>
      </div>
    </article>
  );
}


function NavButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const { t } = useLang();
  const isPrev = direction === "prev";
  return (
    <button type="button" onClick={onClick}
      aria-label={isPrev ? t("t_prev") : t("t_next")}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {isPrev ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-9 6 9 6" />}
      </svg>
    </button>
  );
}


function Slider() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ paused: false, isDragging: false, resumeTimer: null as ReturnType<typeof setTimeout> | null });
  // Duplicate items to enable seamless infinite loop
  const items = [...testimonials, ...testimonials];

  const wrap = useCallback(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
    else if (scroller.scrollLeft < 0) scroller.scrollLeft += half;
  }, []);

  const pauseFor = useCallback((ms = 2500) => {
    stateRef.current.paused = true;
    if (stateRef.current.resumeTimer) clearTimeout(stateRef.current.resumeTimer);
    stateRef.current.resumeTimer = setTimeout(() => {
      stateRef.current.paused = false;
    }, ms);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const firstCard = scroller.querySelector<HTMLElement>("article");
      const cardWidth = firstCard ? firstCard.offsetWidth + 28 : 348;
      scroller.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
      pauseFor(2500);
      // Ensure wrap after smooth scroll completes
      setTimeout(wrap, 420);
    },
    [pauseFor, wrap]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const SPEED = 0.5; // ~30px/sec at 60fps
    let raf = 0;
    let startX = 0;
    let startScroll = 0;

    scroller.scrollLeft = 0;

    const tick = () => {
      const s = stateRef.current;
      if (!s.paused && !s.isDragging) {
        scroller.scrollLeft += SPEED;
        wrap();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => { stateRef.current.paused = true; };
    const onLeave = () => { if (!stateRef.current.isDragging) stateRef.current.paused = false; };
    const onWheel = () => pauseFor(1500);
    const onScroll = () => wrap();

    const onPointerDown = (e: PointerEvent) => {
      // On touch devices, rely on native horizontal scrolling — JS drag hijacks
      // the gesture and freezes the slider on mobile.
      if (e.pointerType === "touch") {
        stateRef.current.paused = true;
        pauseFor(2500);
        return;
      }
      stateRef.current.isDragging = true;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add("is-grabbing");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      scroller.scrollLeft = startScroll - (e.clientX - startX);
      wrap();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;
      try { scroller.releasePointerCapture(e.pointerId); } catch {}
      scroller.classList.remove("is-grabbing");
      pauseFor(2000);
    };

    scroller.addEventListener("mouseenter", onEnter);
    scroller.addEventListener("mouseleave", onLeave);
    scroller.addEventListener("wheel", onWheel, { passive: true });
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onPointerUp);
    scroller.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(raf);
      const rt = stateRef.current.resumeTimer;
      if (rt) clearTimeout(rt);
      scroller.removeEventListener("mouseenter", onEnter);
      scroller.removeEventListener("mouseleave", onLeave);
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("pointercancel", onPointerUp);
    };
  }, [pauseFor, wrap]);

  return (
    <div className="testimonials-slider mt-10">
      <div
        style={{
          maskImage:
            "linear-gradient(to left, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to left, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div
          ref={scrollerRef}
          className="testimonials-scroller pb-2"
          dir="ltr"
          aria-label="testimonials"
        >
          <div ref={trackRef} className="testimonials-track items-stretch">
            {items.map((it, i) => (
              <Card key={i} t={it} />
            ))}
          </div>
        </div>
      </div>

      <SliderNav step={step} />
    </div>
  );
}

function SliderNav({ step }: { step: (dir: 1 | -1) => void }) {
  const { t, lang } = useLang();
  return (
    <div className="mt-6 flex items-center justify-center gap-3" dir={lang === "ar" ? "rtl" : "ltr"}>
      <NavButton direction="prev" onClick={() => step(-1)} />
      <span className="text-xs text-muted-foreground">{t("t_hint")}</span>
      <NavButton direction="next" onClick={() => step(1)} />
    </div>
  );
}


export function Testimonials() {
  const { t } = useLang();
  return (
    <section className="border-y border-border bg-cream" id="testimonials">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-border pb-10 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("t_kicker")}</span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">{t("t_title")}</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">{t("t_lede")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{testimonialStats.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
              <Stars n={5} />
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-display text-3xl font-bold">+{testimonialStats.count}</div>
              <div className="text-xs text-muted-foreground">{t("t_verified")}</div>
            </div>
          </div>
        </div>

        <Slider />
      </div>
    </section>
  );
}

