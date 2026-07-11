import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { formatDate, sanitizeHtml, type InsightArticle } from "@/lib/insights-types";

interface Props {
  article: InsightArticle;
  allArticles: InsightArticle[];
}

function slugify(str: string) {
  return str.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "section";
}

// Extract H2 headings from HTML for TOC and inject id attributes.
function processContent(html: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = [];
  const seen = new Set<string>();
  const processed = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugify(text);
    let n = 1;
    while (seen.has(id)) id = `${slugify(text)}-${++n}`;
    seen.add(id);
    toc.push({ id, text });
    if (/id\s*=/.test(attrs)) return `<h2${attrs}>${inner}</h2>`;
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
  return { html: processed, toc };
}

export function InsightsArticleView({ article, allArticles }: Props) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const category = article.category;

  const rawContent = (lang === "ar" ? article.content_ar : article.content_en) || article.content_ar;
  const { html, toc } = useMemo(() => processContent(sanitizeHtml(rawContent || "")), [rawContent]);

  // Related: same category, exclude current
  const related = useMemo(() => {
    const explicit = article.related_slugs
      .map((s) => allArticles.find((a) => a.slug === s))
      .filter((a): a is InsightArticle => !!a);
    if (explicit.length >= 3) return explicit.slice(0, 3);
    const same = allArticles.filter((a) => a.category.slug === category.slug && a.slug !== article.slug);
    const merged = [...explicit];
    for (const a of same) {
      if (merged.length >= 3) break;
      if (!merged.find((m) => m.slug === a.slug)) merged.push(a);
    }
    return merged.slice(0, 3);
  }, [article, allArticles, category.slug]);

  // Prev/next by published_at order
  const { prev, next } = useMemo(() => {
    const sorted = [...allArticles].sort((a, b) => {
      const at = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bt = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bt - at;
    });
    const idx = sorted.findIndex((a) => a.slug === article.slug);
    return {
      prev: idx > 0 ? sorted[idx - 1] : null,
      next: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null,
    };
  }, [allArticles, article.slug]);

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
    const title = lang === "ar" ? article.title_ar : article.title_en;
    if (network === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
    } else if (network === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  const title = lang === "ar" ? article.title_ar : article.title_en || article.title_ar;
  const excerpt = lang === "ar" ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar;
  const catLabel = lang === "ar" ? category.label_ar : category.label_en;

  const coverStyle = article.cover_url
    ? { backgroundImage: `url(${article.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg, #0f0f2b 0%, #1a2540 60%, #d4a574 100%)" };

  return (
    <div className="bg-background">
      <div className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent">
        <div className="h-full bg-accent transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      <header className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0" style={coverStyle} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-white sm:pt-28">
          <nav className="flex items-center gap-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link to={base} className="hover:text-white">{lang === "ar" ? "الرؤى" : "Insights"}</Link>
            <span aria-hidden>/</span>
            <Link to={`${base}/${category.slug}`} className="hover:text-white">{catLabel}</Link>
          </nav>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur">
            {catLabel}
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          {excerpt && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">{excerpt}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span>{article.author_name}</span>
            <span aria-hidden>·</span>
            {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at, lang)}</time>}
            <span aria-hidden>·</span>
            <span>{article.reading_minutes} {lang === "ar" ? "دقائق قراءة" : "min read"}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-[1fr_240px]">
        <article className="min-w-0">
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
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </ShareBtn>
          </div>

          <div
            className="prose-article insights-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {article.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {article.faq && article.faq.length > 0 && (
            <section className="mt-16 border-t border-border/60 pt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {lang === "ar" ? "أسئلة شائعة" : "Frequently asked questions"}
              </h2>
              <div className="mt-6 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70">
                {article.faq.map((f, i) => (
                  <details key={i} className="group bg-card">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold text-foreground transition-colors hover:text-accent">
                      <span>{lang === "ar" ? f.q_ar : f.q_en || f.q_ar}</span>
                      <span className="text-accent transition-transform group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {lang === "ar" ? f.a_ar : f.a_en || f.a_ar}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

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

          <nav className="mt-12 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link to={`${base}/${prev.category.slug}/${prev.slug}`} className="group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-accent/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "المقال السابق" : "Previous"}</span>
                <p className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
                  {lang === "ar" ? prev.title_ar : prev.title_en || prev.title_ar}
                </p>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`${base}/${next.category.slug}/${next.slug}`} className="group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-accent/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "المقال التالي" : "Next"}</span>
                <p className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
                  {lang === "ar" ? next.title_ar : next.title_en || next.title_ar}
                </p>
              </Link>
            ) : <span />}
          </nav>
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {lang === "ar" ? "في هذا المقال" : "On this page"}
              </span>
              <ul className="mt-4 space-y-3 border-l border-border/70 ps-4 rtl:border-l-0 rtl:border-r rtl:ps-0 rtl:pe-4">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-sm text-muted-foreground transition-colors hover:text-accent">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="border-t border-border/60 bg-card/40">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {lang === "ar" ? "مقالات ذات صلة" : "Related reading"}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <RelatedCard key={r.id} article={r} />)}
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
      type="button" onClick={onClick} aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >{children}</button>
  );
}

function RelatedCard({ article }: { article: InsightArticle }) {
  const { lang } = useLang();
  const base = lang === "ar" ? "/insights" : "/en/insights";
  const style = article.cover_url
    ? { backgroundImage: `url(${article.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "linear-gradient(135deg,#1a1a2e,#0f3460)" };
  return (
    <Link
      to={`${base}/${article.category.slug}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
    >
      <div className="aspect-[16/9]" style={style} aria-hidden />
      <div className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-accent">
          {lang === "ar" ? article.category.label_ar : article.category.label_en}
        </div>
        <h3 className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
          {lang === "ar" ? article.title_ar : article.title_en || article.title_ar}
        </h3>
      </div>
    </Link>
  );
}
