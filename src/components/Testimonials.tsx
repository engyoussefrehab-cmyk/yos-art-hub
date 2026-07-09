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
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8 text-accent/40"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.5 8C5.9 8 3 10.9 3 14.5S5.9 21 9.5 21c.5 0 1-.1 1.5-.2-.6 2.5-2.6 4.4-5 5-.4.1-.6.6-.3.9.2.2.5.3.7.2 4.8-1.2 8.6-5.4 8.6-11V14c0-3.3-2.7-6-5.5-6zm14 0C19.9 8 17 10.9 17 14.5S19.9 21 23.5 21c.5 0 1-.1 1.5-.2-.6 2.5-2.6 4.4-5 5-.4.1-.6.6-.3.9.2.2.5.3.7.2 4.8-1.2 8.6-5.4 8.6-11V14c0-3.3-2.7-6-5.5-6z" />
    </svg>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-border bg-cream" id="testimonials">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-border pb-10 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              آراء العملاء
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
              ثقة تُبنى بمشروع تلو الآخر
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              مختارات من آراء عملاء تعاملت معهم عبر منصّة {testimonialStats.platform}.
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

        {/* Masonry-style grid */}
        <div className="mt-12 columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6">
          {testimonials.map((t, i) => (
            <article
              key={i}
              className="group relative break-inside-avoid rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-20px_rgb(0_0_0/0.15)]"
            >
              <div className="flex items-start justify-between">
                <QuoteMark />
                <Stars n={t.rating} />
              </div>
              <p className="mt-4 text-[15px] leading-[1.9] text-foreground/90">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-primary-foreground">
                  {t.name.trim().charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-semibold">
                    {t.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.project}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
