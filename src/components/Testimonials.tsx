import { useEffect, useRef } from "react";
import { testimonials, testimonialStats } from "@/lib/testimonials";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`تقييم ${n} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < n ? "text-accent" : "text-border"}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function QuoteMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-accent/40" fill="currentColor" aria-hidden>
      <path d="M9.5 8C5.9 8 3 10.9 3 14.5S5.9 21 9.5 21c.5 0 1-.1 1.5-.2-.6 2.5-2.6 4.4-5 5-.4.1-.6.6-.3.9.2.2.5.3.7.2 4.8-1.2 8.6-5.4 8.6-11V14c0-3.3-2.7-6-5.5-6zm14 0C19.9 8 17 10.9 17 14.5S19.9 21 23.5 21c.5 0 1-.1 1.5-.2-.6 2.5-2.6 4.4-5 5-.4.1-.6.6-.3.9.2.2.5.3.7.2 4.8-1.2 8.6-5.4 8.6-11V14c0-3.3-2.7-6-5.5-6z" />
    </svg>
  );
}

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <article className="group relative flex w-[320px] shrink-0 flex-col rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-20px_rgb(0_0_0/0.15)] sm:w-[400px]">
      <div className="flex items-start justify-between">
        <QuoteMark />
        <Stars n={t.rating} />
      </div>
      <p className="mt-4 line-clamp-6 text-[15px] leading-[1.9] text-foreground/90">
        {t.quote}
      </p>
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-primary-foreground">
          {t.name.trim().charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-semibold">{t.name}</div>
          <div className="truncate text-xs text-muted-foreground">{t.project}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span aria-hidden>⭐</span>
        <span>تقييمات موثقة من منصة مستقل</span>
      </div>
    </article>
  );
}

function Slider() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Duplicate items to enable seamless infinite loop
  const items = [...testimonials, ...testimonials];

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const SPEED = 0.5; // px per frame (~30px/sec at 60fps)
    let raf = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let isDragging = false;
    let startX = 0;
    let startScroll = 0;

    const halfWidth = () => track.scrollWidth / 2;

    // Start in the middle so user can scroll both directions
    scroller.scrollLeft = 0;

    const wrap = () => {
      const half = halfWidth();
      if (half <= 0) return;
      if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
      else if (scroller.scrollLeft < 0) scroller.scrollLeft += half;
    };

    const tick = () => {
      if (!paused && !isDragging) {
        scroller.scrollLeft += SPEED;
        wrap();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pauseFor = (ms = 2000) => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, ms);
    };

    const onEnter = () => { paused = true; };
    const onLeave = () => { if (!isDragging) paused = false; };
    const onWheel = () => pauseFor(1500);
    const onScroll = () => wrap();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add("is-grabbing");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      scroller.scrollLeft = startScroll - (e.clientX - startX);
      wrap();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try { scroller.releasePointerCapture(e.pointerId); } catch {}
      scroller.classList.remove("is-grabbing");
      pauseFor(1500);
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
      if (resumeTimer) clearTimeout(resumeTimer);
      scroller.removeEventListener("mouseenter", onEnter);
      scroller.removeEventListener("mouseleave", onLeave);
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      className="testimonials-slider mt-12"
      style={{
        maskImage: "linear-gradient(to left, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to left, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        ref={scrollerRef}
        className="testimonials-scroller"
        dir="ltr"
        aria-label="آراء العملاء"
      >
        <div ref={trackRef} className="testimonials-track">
          {items.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-border bg-cream" id="testimonials">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-border pb-10 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              آراء العملاء
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
              ثقة تُبنى بمشروع تلو الآخر
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              مختارات من آراء عملاء تعاملت معهم.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">
                  {testimonialStats.averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
              <Stars n={5} />
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-display text-3xl font-bold">
                +{testimonialStats.count}
              </div>
              <div className="text-xs text-muted-foreground">تقييم موثّق</div>
            </div>
          </div>
        </div>

        <Slider />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          اسحب البطاقات يمينًا أو يسارًا لتصفّح المزيد
        </p>
      </div>
    </section>
  );
}
