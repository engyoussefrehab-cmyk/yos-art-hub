import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import {
  getArticle,
  getCategory,
  getRelatedArticles,
  getAdjacentArticles,
  formatDate,
  type Article,
  type Block,
} from "@/lib/insights-data";

export function InsightsArticleView({ slug }: { slug: string }) {
  const { lang } = useLang();
  const article = getArticle(slug);
  const base = lang === "ar" ? "/insights" : "/en/insights";

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">
          {lang === "ar" ? "المقال غير موجود" : "Article not found"}
        </h1>
        <Link to={base} className="mt-6 inline-block text-accent underline">
          {lang === "ar" ? "العودة إلى المقالات" : "Back to insights"}
        </Link>
      </div>
    );
  }

  const category = getCategory(article.category)!;
  const related = getRelatedArticles(article.slug, 3);
  const { prev, next } = getAdjacentArticles(article.slug);

  // Table of contents
  const toc = useMemo(
    () =>
      article.content
        .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
        .map((b) => ({ id: b.id, label: b.text[lang] })),
    [article, lang],
  );

  // Reading progress
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? Math.min(100, Math.max(0, (h.scrollTop / total) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const share = (network: "twitter" | "linkedin" | "copy") => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = article.title[lang];
    if (network === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
    } else if (network === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  return (
    <div className="bg-background">
      {/* Reading progress */}
      <div className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent">
        <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: `linear-gradient(135deg, ${article.cover.from} 0%, ${article.cover.to} 100%)` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(50% 40% at 20% 30%, ${article.cover.accent}55, transparent 60%)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-white sm:pt-28">
          <nav className="flex items-center gap-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link to={base} className="hover:text-white">
              {lang === "ar" ? "الرؤى" : "Insights"}
            </Link>
            <span aria-hidden>/</span>
            <Link to={`${base}/${category.slug}`} className="hover:text-white">
              {category.label[lang]}
            </Link>
          </nav>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur">
            {category.label[lang]}
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            {article.title[lang]}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/80">{article.excerpt[lang]}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span>{article.author[lang]}</span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time>
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} {lang === "ar" ? "دقائق قراءة" : "min read"}</span>
          </div>
        </div>
      </header>

      {/* Body + TOC */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[1fr_240px]">
        <article className="min-w-0">
          {/* Share */}
          <div className="mb-8 flex items-center gap-2 border-b border-border/60 pb-6">
            <span className="text-xs text-muted-foreground">{lang === "ar" ? "مشاركة:" : "Share:"}</span>
            <ShareBtn onClick={() => share("twitter")} label="X / Twitter">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M18.244 2H21l-6.52 7.45L22 22h-6.844l-4.79-6.26L4.8 22H2l6.98-7.98L2 2h6.96l4.36 5.77L18.244 2Zm-1.2 18h1.9L7.05 4H5.06l11.984 16Z" /></svg>
            </ShareBtn>
            <ShareBtn onClick={() => share("linkedin")} label="LinkedIn">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
            </ShareBtn>
            <ShareBtn onClick={() => share("copy")} label={lang === "ar" ? "نسخ الرابط" : "Copy link"}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </ShareBtn>
          </div>

          <div className="prose-article">
            {article.content.map((b, i) => <RenderBlock key={i} block={b} />)}
          </div>

          {/* FAQ */}
          {article.faq && article.faq.length > 0 && (
            <section className="mt-16 border-t border-border/60 pt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {lang === "ar" ? "أسئلة شائعة" : "Frequently asked questions"}
              </h2>
              <div className="mt-6 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70">
                {article.faq.map((f, i) => (
                  <details key={i} className="group bg-card">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold text-foreground transition-colors hover:text-accent">
                      <span>{f.q[lang]}</span>
                      <span className="text-accent transition-transform group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a[lang]}</div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-16 rounded-3xl border border-border/70 bg-ink p-8 text-white sm:p-12">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              {lang === "ar" ? "جاهزٌ لبناء علامةٍ أقوى؟" : "Ready to build a stronger brand?"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              {lang === "ar"
                ? "احجز جلسة استكشاف مجانيّة، سنستعرض موقعك الحاليّ وفرص التطوير خطوةً بخطوة."
                : "Book a free discovery call — we'll walk through your current position and where to grow, step by step."}
            </p>
            <Link
              to={lang === "ar" ? "/contact" : "/en/contact"}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              {lang === "ar" ? "احجز جلسة استكشاف" : "Book a Discovery Call"}
              <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
            </Link>
          </section>

          {/* Prev / Next */}
          <nav className="mt-12 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`${base}/${prev.category}/${prev.slug}`}
                className="group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-accent/50"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === "ar" ? "المقال السابق" : "Previous"}
                </span>
                <p className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
                  {prev.title[lang]}
                </p>
              </Link>
            ) : <span />}
            {next ? (
              <Link
                to={`${base}/${next.category}/${next.slug}`}
                className={`group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-accent/50 ${lang === "ar" ? "text-right" : "text-right"}`}
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === "ar" ? "المقال التالي" : "Next"}
                </span>
                <p className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
                  {next.title[lang]}
                </p>
              </Link>
            ) : <span />}
          </nav>
        </article>

        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {lang === "ar" ? "في هذا المقال" : "On this page"}
            </span>
            <ul className="mt-4 space-y-3 border-l border-border/70 ps-4 rtl:border-l-0 rtl:border-r rtl:ps-0 rtl:pe-4">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="text-sm text-muted-foreground transition-colors hover:text-accent">
                    {h.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border/60 bg-card/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {lang === "ar" ? "مقالات ذات صلة" : "Related reading"}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <RelatedCard key={r.slug} article={r} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ShareBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </button>
  );
}

function RenderBlock({ block }: { block: Block }) {
  const { lang } = useLang();
  switch (block.type) {
    case "p":
      return <p className="my-5 text-[17px] leading-[1.85] text-foreground/85">{block.text[lang]}</p>;
    case "h2":
      return (
        <h2 id={block.id} className="mt-14 mb-4 scroll-mt-24 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {block.text[lang]}
        </h2>
      );
    case "h3":
      return (
        <h3 id={block.id} className="mt-10 mb-3 scroll-mt-24 font-display text-xl font-semibold text-foreground">
          {block.text[lang]}
        </h3>
      );
    case "quote":
      return (
        <blockquote className="my-8 rounded-2xl border-s-4 border-accent bg-card p-6 font-display text-xl italic leading-relaxed text-foreground">
          "{block.text[lang]}"
          {block.cite && <cite className="mt-3 block text-sm not-italic text-muted-foreground">— {block.cite}</cite>}
        </blockquote>
      );
    case "list":
      return (
        <ul className="my-6 space-y-2.5 ps-6 marker:text-accent">
          {block.items.map((it, i) => (
            <li key={i} className="list-disc text-[17px] leading-[1.85] text-foreground/85">{it[lang]}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside className="my-10 rounded-2xl border border-accent/30 bg-accent/5 p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">{block.title[lang]}</div>
          <p className="mt-2 text-[17px] leading-[1.8] text-foreground/90">{block.text[lang]}</p>
        </aside>
      );
  }
}

function RelatedCard({ article }: { article: Article }) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const cat = getCategory(article.category)!;
  return (
    <Link
      to={`${base}/${article.category}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
    >
      <div
        className="aspect-[16/9]"
        style={{ background: `linear-gradient(135deg, ${article.cover.from}, ${article.cover.to})` }}
        aria-hidden
      />
      <div className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-accent">{cat.label[lang]}</div>
        <h3 className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
          {article.title[lang]}
        </h3>
      </div>
    </Link>
  );
}
