import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { formatDate, sanitizeHtml, type InsightArticle } from "@/lib/insights-types";

import { pair } from "@/i18n/dictionary";
import { container } from "@/components/studio";
import { AR } from "@/components/studio-site";
import { InsightCard } from "@/components/InsightCard";
interface Props {
  article: InsightArticle;
  allArticles: InsightArticle[];
}

function slugify(str: string) {
  return (
    str
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

// Extract H2 headings from HTML for TOC and inject id attributes.
function processContent(html: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = [];
  const seen = new Set<string>();
  const processed = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const existing = attrs.match(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const preferred = existing?.[1] || existing?.[2] || existing?.[3] || slugify(text);
    let id = preferred;
    let n = 1;
    while (seen.has(id)) id = `${preferred}-${++n}`;
    seen.add(id);
    toc.push({ id, text });
    if (existing && id === preferred) return `<h2${attrs}>${inner}</h2>`;
    const safeId = id.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
    return `<h2 id="${safeId}"${existing ? attrs.replace(existing[0], "") : attrs}>${inner}</h2>`;
  });
  return { html: processed, toc };
}

export function InsightsArticleView({ article, allArticles }: Props) {
  const { lang } = useLang();
  const category = article.category;

  const rawContent =
    (lang === "ar" ? article.content_ar : article.content_en) || article.content_ar;
  const { html, toc } = useMemo(() => processContent(sanitizeHtml(rawContent || "")), [rawContent]);

  // Related: same category, exclude current
  const related = useMemo(() => {
    const explicit = article.related_slugs
      .map((s) => allArticles.find((a) => a.slug === s))
      .filter((a): a is InsightArticle => !!a);
    if (explicit.length >= 3) return explicit.slice(0, 3);
    const same = allArticles.filter(
      (a) => a.category.slug === category.slug && a.slug !== article.slug,
    );
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
  const [copyStatus, setCopyStatus] = useState("");
  const readingBody = useRef<HTMLDivElement>(null);
  const mobileContents = useRef<HTMLDetailsElement>(null);
  useEffect(() => setCopyStatus(""), [article.slug]);
  useEffect(() => {
    const onScroll = () => {
      const box = readingBody.current?.getBoundingClientRect();
      if (!box) return;
      const range = Math.max(box.height - window.innerHeight + 80, 1);
      setProgress(Math.min(100, Math.max(0, ((80 - box.top) / range) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [article.slug]);

  const share = (network: "twitter" | "linkedin" | "copy") => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = lang === "ar" ? article.title_ar : article.title_en;
    if (network === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (network === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      if (!navigator.clipboard) return setCopyStatus("تعذّر نسخ الرابط");
      navigator.clipboard.writeText(url).then(
        () => setCopyStatus("تم نسخ الرابط"),
        () => setCopyStatus("تعذّر نسخ الرابط"),
      );
    }
  };

  const title = lang === "ar" ? article.title_ar : article.title_en || article.title_ar;
  const excerpt = lang === "ar" ? article.excerpt_ar : article.excerpt_en || article.excerpt_ar;
  const catLabel = lang === "ar" ? category.label_ar : category.label_en;

  const cover = article.featured_image_url || article.cover_url;

  return (
    <div className="article-reading bg-background">
      <div aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-accent transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className={`${container} pb-7 pt-10 md:pb-10 md:pt-16`}>
          <div className="max-w-5xl">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="مسار الصفحة">
              <Link to="/insights" className="py-1 hover:text-accent">
                {lang === "ar" ? pair("nav_insights")[0] : pair("nav_insights")[1]}
              </Link>
              <span aria-hidden>/</span>
              <Link to="/insights/$category" params={{ category: category.slug }} className="py-1 hover:text-accent">
                {catLabel}
              </Link>
            </nav>
            <h1 className="mt-5 text-balance font-display text-[clamp(2.125rem,5.7vw,5rem)] font-bold leading-[1.17] text-foreground">
              {title}
            </h1>
            {excerpt && (
              <p className="mt-4 max-w-3xl text-base leading-loose text-muted-foreground md:text-lg">
                {excerpt}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              {article.author_name && <span>{article.author_name}</span>}
              {article.published_at && (
                <time dateTime={article.published_at}>
                  {formatDate(article.published_at, lang)}
                </time>
              )}
              {article.reading_minutes > 0 && <span>
                {lang === "ar" ? AR(article.reading_minutes) : article.reading_minutes}{" "}
                {lang === "ar"
                  ? pair("ui_insightsarticleview_1")[0]
                  : pair("ui_insightsarticleview_1")[1]}
              </span>}
            </div>
          </div>
      </header>
      {cover && (
        <div className={container}>
          <img src={cover} alt="" fetchPriority="high" className="aspect-[16/9] max-h-[31rem] w-full rounded-xl bg-cream object-cover" />
        </div>
      )}

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-8 md:px-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_235px]">
        <article className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-4">
            <span className="text-xs text-muted-foreground">
              {lang === "ar"
                ? pair("ui_insightsarticleview_2")[0]
                : pair("ui_insightsarticleview_2")[1]}
            </span>
            <ShareBtn onClick={() => share("twitter")} label="X / Twitter">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M18.244 2H21l-6.52 7.45L22 22h-6.844l-4.79-6.26L4.8 22H2l6.98-7.98L2 2h6.96l4.36 5.77L18.244 2Zm-1.2 18h1.9L7.05 4H5.06l11.984 16Z" />
              </svg>
            </ShareBtn>
            <ShareBtn onClick={() => share("linkedin")} label="LinkedIn">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
              </svg>
            </ShareBtn>
            <ShareBtn
              onClick={() => share("copy")}
              label={
                lang === "ar"
                  ? pair("ui_insightsarticleview_3")[0]
                  : pair("ui_insightsarticleview_3")[1]
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </ShareBtn>
            <span role="status" className="text-xs text-muted-foreground">{copyStatus}</span>
          </div>

          {toc.length > 0 && (
            <details ref={mobileContents} className="mb-7 rounded-xl border border-border bg-card px-4 lg:hidden">
              <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-foreground">{pair("ui_insightsarticleview_10")[0]}</summary>
              <ContentsLinks headings={toc} onSelect={() => { if (mobileContents.current) mobileContents.current.open = false; }} />
            </details>
          )}
          <div
            ref={readingBody}
            className="insights-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {article.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {article.faq && article.faq.length > 0 && (
            <section className="mt-16 border-t border-border/60 pt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {lang === "ar"
                  ? pair("ui_insightsarticleview_4")[0]
                  : pair("ui_insightsarticleview_4")[1]}
              </h2>
              <div className="mt-6 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70">
                {article.faq.map((f, i) => (
                  <details key={i} className="group bg-card">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold text-foreground transition-colors hover:text-accent">
                      <span>{lang === "ar" ? f.q_ar : f.q_en || f.q_ar}</span>
                      <span
                        className="text-accent transition-transform group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {lang === "ar" ? f.a_ar : f.a_en || f.a_ar}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 rounded-xl border border-border bg-cream p-6 text-foreground sm:p-10">
            <h2 className="font-display text-2xl font-bold sm:text-[2rem]">
              {lang === "ar"
                ? pair("ui_insightsarticleview_5")[0]
                : pair("ui_insightsarticleview_5")[1]}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-loose text-muted-foreground">
              {lang === "ar"
                ? pair("ui_insightsarticleview_6")[0]
                : pair("ui_insightsarticleview_6")[1]}
            </p>
            <Link
              to={"/contact"}
              className="group mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
            >
              {lang === "ar"
                ? pair("ui_insightsarticleview_7")[0]
                : pair("ui_insightsarticleview_7")[1]}
              <span
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-full border border-current transition-transform group-hover:-rotate-45"
              >
                ↖
              </span>
            </Link>
          </section>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="المقالات المجاورة">
            {prev ? (
              <Link
                to="/insights/$category/$slug" params={{ category: prev.category.slug, slug: prev.slug }}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === "ar"
                    ? pair("ui_insightsarticleview_8")[0]
                    : pair("ui_insightsarticleview_8")[1]}
                </span>
                <p className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
                  {lang === "ar" ? prev.title_ar : prev.title_en || prev.title_ar}
                </p>
              </Link>
            ) : null}
            {next ? (
              <Link
                to="/insights/$category/$slug" params={{ category: next.category.slug, slug: next.slug }}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === "ar"
                    ? pair("ui_insightsarticleview_9")[0]
                    : pair("ui_insightsarticleview_9")[1]}
                </span>
                <p className="mt-2 font-display text-base font-semibold text-foreground group-hover:text-accent">
                  {lang === "ar" ? next.title_ar : next.title_en || next.title_ar}
                </p>
              </Link>
            ) : null}
          </nav>
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {lang === "ar"
                  ? pair("ui_insightsarticleview_10")[0]
                  : pair("ui_insightsarticleview_10")[1]}
              </span>
              <ContentsLinks headings={toc} />
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="border-t border-border">
          <div className={`${container} py-10 md:py-16`}>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {lang === "ar"
                ? pair("ui_insightsarticleview_11")[0]
                : pair("ui_insightsarticleview_11")[1]}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <InsightCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ContentsLinks({ headings, onSelect }: { headings: { id: string; text: string }[]; onSelect?: () => void }) {
  return (
    <ul className="border-s border-border ps-3 pb-2 lg:mt-3">
      {headings.map(({ id, text }) => (
        <li key={id}>
          <a href={`#${encodeURIComponent(id)}`} onClick={onSelect} className="block py-2.5 text-sm leading-snug text-muted-foreground hover:text-accent">
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ShareBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </button>
  );
}
