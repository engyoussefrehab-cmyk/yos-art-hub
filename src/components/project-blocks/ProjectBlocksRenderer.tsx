import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Star } from "lucide-react";
import type { ProjectBlock } from "@/lib/project-blocks";
import { ZoomableImage } from "@/components/ZoomableImage";

type Lang = "ar" | "en";

export type RenderContext = {
  projectName: string;
  categorySlug: string | null;
  categoryLabel: string;
  industry: string | null;
  projectsHref: string;
  categoryHref: string;
  next: { slug: string; name: string; categorySlug: string | null; href: string } | null;
};

function pick(ar?: string, en?: string, lang: Lang = "ar") {
  const primary = lang === "ar" ? ar : en;
  return (primary && primary.trim()) || (lang === "ar" ? en : ar) || "";
}

export function ProjectBlocksRenderer({
  blocks,
  lang,
  context,
}: {
  blocks: ProjectBlock[];
  lang: Lang;
  context?: RenderContext;
}) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="project-blocks">
      {blocks.map((b) => (
        <BlockRender key={b.id} block={b} lang={lang} context={context} />
      ))}
    </div>
  );
}

function BlockRender({ block: b, lang, context }: { block: ProjectBlock; lang: Lang; context?: RenderContext }) {
  if (b.enabled === false) return null;
  switch (b.type) {
    case "hero": {
      const title = pick(b.title_ar, b.title_en, lang) || context?.projectName || "";
      const kicker = pick(b.kicker_ar, b.kicker_en, lang);
      const subtitle = pick(b.subtitle_ar, b.subtitle_en, lang);
      const description = pick(b.description_ar, b.description_en, lang);
      const specialtyLabel = pick(b.specialty_label_ar, b.specialty_label_en, lang) || (lang === "ar" ? "التخصص" : "Specialty");
      const specialtyValue = pick(b.specialty_value_ar, b.specialty_value_en, lang) || context?.categoryLabel || "";
      const typeLabel = pick(b.type_label_ar, b.type_label_en, lang) || (lang === "ar" ? "النوع" : "Type");
      const typeValue = pick(b.type_value_ar, b.type_value_en, lang) || context?.industry || context?.categoryLabel || "";
      const showMeta = b.show_meta_card !== false;
      return (
        <section className="border-b border-border bg-cream">
          <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 md:pt-12 md:pb-24">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
              <div className={showMeta ? "md:col-span-7" : "md:col-span-12"}>
                {(kicker || context?.industry) && (
                  <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                    <span>{kicker || context?.categoryLabel}</span>
                    {(kicker && context?.industry) && <span className="h-px w-8 bg-border" />}
                    {context?.industry && <span>{context.industry}</span>}
                  </div>
                )}
                <h1 className="mt-4 font-display text-5xl md:text-7xl font-bold leading-[1.05]">{title}</h1>
                {subtitle && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
                {description && <p className="mt-4 max-w-xl leading-relaxed text-foreground/85">{description}</p>}
              </div>
              {showMeta && (
                <div className="md:col-span-5">
                  <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-background p-6">
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{specialtyLabel}</dt>
                      <dd className="mt-1 font-semibold">{specialtyValue}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{typeLabel}</dt>
                      <dd className="mt-1 font-semibold">{typeValue}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }
    case "cover": {
      if (!b.url) return null;
      const alt = pick(b.alt_ar, b.alt_en, lang) || context?.projectName || "";
      return (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-cream">
            <ZoomableImage src={b.url} alt={alt} eager />
          </div>
        </section>
      );
    }
    case "approach": {
      const items = (lang === "ar" ? b.items_ar : b.items_en) ?? [];
      const filtered = items.filter((s) => s && s.trim());
      if (filtered.length === 0 && !pick(b.value_ar, b.value_en, lang)) return null;
      const kicker = pick(b.kicker_ar, b.kicker_en, lang);
      const title = pick(b.title_ar, b.title_en, lang);
      const value = pick(b.value_ar, b.value_en, lang);
      const valueLabel = pick(b.value_label_ar, b.value_label_en, lang) || (lang === "ar" ? "القيمة" : "Value");
      return (
        <section className="border-y border-border bg-ink text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-12">
            <div className="md:col-span-5">
              {kicker && <span className="text-xs font-semibold uppercase tracking-widest text-accent">{kicker}</span>}
              {title && <h2 className="mt-3 font-display text-4xl font-bold leading-tight">{title}</h2>}
            </div>
            <div className="md:col-span-7">
              {filtered.length > 0 && (
                <ul className="space-y-4">
                  {filtered.map((a, i) => (
                    <li key={i} className="flex items-start gap-4 border-b border-white/10 pb-4">
                      <span className="font-display text-2xl font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-lg text-white/85 leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              )}
              {value && (
                <div className="mt-10 rounded-2xl border border-accent/40 bg-accent/10 p-6">
                  <div className="text-xs uppercase tracking-widest text-accent">{valueLabel}</div>
                  <p className="mt-2 text-lg leading-relaxed">{value}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }
    case "meta": {
      const items = (b.items ?? []).filter((it) => (pick(it.label_ar, it.label_en, lang) || pick(it.value_ar, it.value_en, lang)));
      const logoUrl = b.logo_url ?? "";
      if (items.length === 0 && !logoUrl) return null;
      const title = pick(b.title_ar, b.title_en, lang);
      return (
        <section className="mx-auto max-w-6xl px-6 py-12">
          {title && <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>}
          {logoUrl && (
            <div className="mb-4 flex items-center justify-center rounded-2xl border border-border bg-background p-6">
              <img
                src={logoUrl}
                alt=""
                loading="lazy"
                className="max-h-20 w-auto max-w-[220px] object-contain sm:max-h-24 sm:max-w-[280px]"
              />
            </div>
          )}
          <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-background p-6 md:grid-cols-3">
            {items.map((it, i) => (
              <div key={i}>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{pick(it.label_ar, it.label_en, lang)}</dt>
                <dd className="mt-1 font-semibold">{pick(it.value_ar, it.value_en, lang)}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }
    case "deliverables": {
      const items = (b.items ?? []).filter((it) => pick(it.label_ar, it.label_en, lang));
      if (items.length === 0) return null;
      const title = pick(b.title_ar, b.title_en, lang);
      return (
        <section className="mx-auto max-w-6xl px-6 py-12">
          {title && <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>}
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-medium">{pick(it.label_ar, it.label_en, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "typography": {
      if (!b.heading_font && !b.body_font && !pick(b.sample_ar, b.sample_en, lang)) return null;
      const title = pick(b.title_ar, b.title_en, lang);
      const sample = pick(b.sample_ar, b.sample_en, lang) || (lang === "ar" ? "الطباعة هي صوت العلامة." : "Typography is the voice of the brand.");
      return (
        <section className="mx-auto max-w-6xl px-6 py-12">
          {title && <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {b.heading_font && (
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "خط العناوين" : "Heading font"}</div>
                <div className="mt-2 font-display text-3xl font-bold">{b.heading_font}</div>
                <p className="mt-3 text-2xl leading-snug" style={{ fontFamily: b.heading_font }}>{sample}</p>
              </div>
            )}
            {b.body_font && (
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "خط المتن" : "Body font"}</div>
                <div className="mt-2 font-display text-3xl font-bold">{b.body_font}</div>
                <p className="mt-3 text-base leading-relaxed" style={{ fontFamily: b.body_font }}>{sample}</p>
              </div>
            )}
          </div>
        </section>
      );
    }
    case "links": {
      const items = (b.items ?? []).filter((it) => it.url);
      if (items.length === 0) return null;
      const title = pick(b.title_ar, b.title_en, lang);
      return (
        <section className="mx-auto max-w-6xl px-6 py-12">
          {title && <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>}
          <div className="flex flex-wrap gap-3">
            {items.map((it, i) => (
              <a
                key={i}
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-cream"
              >
                <ExternalLink className="h-4 w-4" />
                {pick(it.label_ar, it.label_en, lang) || it.url}
              </a>
            ))}
          </div>
        </section>
      );
    }
    case "testimonial": {
      const quote = pick(b.quote_ar, b.quote_en, lang);
      if (!quote) return null;
      const role = pick(b.author_role_ar, b.author_role_en, lang);
      const rating = Math.max(0, Math.min(5, b.rating ?? 0));
      return (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <figure className="rounded-3xl border border-border bg-background p-8 shadow-sm md:p-10">
            {rating > 0 && (
              <div className="mb-4 flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-accent" : "fill-none opacity-30"}`} />
                ))}
              </div>
            )}
            <blockquote className="font-display text-2xl md:text-3xl font-semibold leading-snug">“{quote}”</blockquote>
            {(b.author_name || role || b.author_avatar_url) && (
              <figcaption className="mt-6 flex items-center gap-4">
                {b.author_avatar_url && (
                  <img src={b.author_avatar_url} alt={b.author_name || ""} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                )}
                <div>
                  {b.author_name && <div className="font-semibold">{b.author_name}</div>}
                  {role && <div className="text-sm text-muted-foreground">{role}</div>}
                </div>
              </figcaption>
            )}
          </figure>
        </section>
      );
    }
    case "embed": {
      if (!b.url) return null;
      const aspectCls =
        b.aspect === "4/3" ? "aspect-[4/3]" :
        b.aspect === "1/1" ? "aspect-square" :
        b.aspect === "9/16" ? "aspect-[9/16] max-w-md mx-auto" :
        "aspect-video";
      const caption = pick(b.caption_ar, b.caption_en, lang);
      return (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className={`overflow-hidden rounded-3xl border border-border bg-black ${aspectCls}`}>
            <iframe
              src={b.url}
              className="h-full w-full"
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              title={caption || "embed"}
            />
          </div>
          {caption && <p className="mt-3 text-center text-sm text-muted-foreground">{caption}</p>}
        </section>
      );
    }
    case "next-project": {
      if (!context?.next) return null;
      const label = pick(b.label_ar, b.label_en, lang) || (lang === "ar" ? "المشروع التالي" : "Next Project");
      const cta = pick(b.cta_ar, b.cta_en, lang) || (lang === "ar" ? "التالي" : "Next");
      const allLabel = pick(b.all_label_ar, b.all_label_en, lang) || (lang === "ar" ? "كل المشاريع" : "All projects");
      const arrow = lang === "ar" ? "←" : "→";
      return (
        <section className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="mt-2 font-display text-3xl md:text-4xl font-bold">{context.next.name}</div>
            </div>
            <div className="flex gap-3">
              <Link to={context.categoryHref} className="rounded-full border border-primary/20 px-6 py-3 text-sm font-semibold hover:bg-cream">{allLabel}</Link>
              <Link to={context.next.href} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{`${cta} ${arrow}`}</Link>
            </div>
          </div>
        </section>
      );
    }
    case "heading": {
      const text = pick(b.text_ar, b.text_en, lang);
      if (!text) return null;
      const align = b.align === "center" ? "text-center" : "";
      const cls =
        b.level === 3
          ? "font-display text-2xl md:text-3xl font-bold"
          : "font-display text-3xl md:text-5xl font-bold";
      return (
        <section className="mx-auto max-w-5xl px-6 py-10">
          {b.level === 3 ? <h3 className={`${cls} ${align}`}>{text}</h3> : <h2 className={`${cls} ${align}`}>{text}</h2>}
        </section>
      );
    }
    case "text": {
      const text = pick(b.content_ar, b.content_en, lang);
      if (!text) return null;
      const align = b.align === "center" ? "text-center" : "";
      return (
        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className={`whitespace-pre-line text-lg leading-relaxed text-foreground/85 ${align}`}>{text}</div>
        </section>
      );
    }
    case "image": {
      if (!b.url) return null;
      const width =
        b.width === "full" ? "max-w-none" : b.width === "narrow" ? "max-w-3xl" : "max-w-7xl";
      const caption = pick(b.caption_ar, b.caption_en, lang);
      return (
        <section className={`mx-auto ${width} px-6 py-8`}>
          <figure className="overflow-hidden rounded-3xl border border-border bg-cream">
            <ZoomableImage src={b.url} alt={caption || ""} />
            {caption && (
              <figcaption className="border-t border-border bg-background/70 px-6 py-3 text-sm text-muted-foreground">
                {caption}
              </figcaption>
            )}
          </figure>
        </section>
      );
    }
    case "two-col-image": {
      if (!b.url_left && !b.url_right) return null;
      return (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[b.url_left, b.url_right].filter(Boolean).map((u, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-border bg-cream">
                <ZoomableImage src={u as string} alt="" />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "gallery": {
      const urls = (b.urls ?? []).filter(Boolean);
      if (urls.length === 0) return null;
      const cols = b.columns ?? 3;
      const grid =
        cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
      return (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className={`grid grid-cols-2 gap-4 ${grid}`}>
            {urls.map((u, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-cream">
                <ZoomableImage src={u} alt="" imgClassName="aspect-[4/3] w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "quote": {
      const text = pick(b.text_ar, b.text_en, lang);
      if (!text) return null;
      return (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <blockquote className="border-s-4 border-accent ps-6">
            <p className="font-display text-2xl md:text-3xl font-semibold leading-snug">“{text}”</p>
            {b.author && <footer className="mt-3 text-sm text-muted-foreground">— {b.author}</footer>}
          </blockquote>
        </section>
      );
    }
    case "palette": {
      const colors = (b.colors ?? []).filter((c) => c && c.hex);
      if (colors.length === 0) return null;
      const title = pick(b.title_ar, b.title_en, lang);
      return (
        <section className="mx-auto max-w-6xl px-6 py-10">
          {title && <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {colors.map((c, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-background">
                <div className="aspect-[4/3] w-full" style={{ background: c.hex }} />
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold">{c.name || c.hex}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "video": {
      if (!b.url) return null;
      const isYoutube = /youtu\.?be/.test(b.url);
      const isVimeo = /vimeo\.com/.test(b.url);
      const caption = pick(b.caption_ar, b.caption_en, lang);
      return (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="overflow-hidden rounded-3xl border border-border bg-black">
            {isYoutube || isVimeo ? (
              <div className="aspect-video">
                <iframe
                  src={toEmbed(b.url)}
                  className="h-full w-full"
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={caption || "video"}
                />
              </div>
            ) : (
              <video src={b.url} controls className="w-full" preload="metadata" />
            )}
          </div>
          {caption && <p className="mt-3 text-center text-sm text-muted-foreground">{caption}</p>}
        </section>
      );
    }
    case "stats": {
      const items = (b.items ?? []).filter((i) => i && i.value);
      if (items.length === 0) return null;
      return (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background p-6 text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-accent">{it.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{pick(it.label_ar, it.label_en, lang)}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "callout": {
      const text = pick(b.text_ar, b.text_en, lang);
      if (!text) return null;
      const tone =
        b.tone === "info"
          ? "border-primary/30 bg-primary/10"
          : b.tone === "success"
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-accent/40 bg-accent/10";
      return (
        <section className="mx-auto max-w-4xl px-6 py-8">
          <div className={`rounded-2xl border p-6 text-lg leading-relaxed ${tone}`}>{text}</div>
        </section>
      );
    }
    case "spacer": {
      const h = b.size === "sm" ? "h-6" : b.size === "lg" ? "h-24" : "h-12";
      return <div className={h} aria-hidden />;
    }
    case "before-after": {
      if (!b.before_url || !b.after_url) return null;
      const caption = pick(b.caption_ar, b.caption_en, lang);
      const labelBefore = pick(b.label_before_ar, b.label_before_en, lang) || (lang === "ar" ? "قبل" : "Before");
      const labelAfter = pick(b.label_after_ar, b.label_after_en, lang) || (lang === "ar" ? "بعد" : "After");
      return (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <BeforeAfterCompare
            before={b.before_url}
            after={b.after_url}
            labelBefore={labelBefore}
            labelAfter={labelAfter}
            orientation={b.orientation ?? "horizontal"}
          />
          {caption && (
            <p className="mt-3 text-center text-sm text-muted-foreground">{caption}</p>
          )}
        </section>
      );
    }
    default:
      return null;
  }
}

function BeforeAfterCompare({
  before,
  after,
  labelBefore,
  labelAfter,
  orientation,
}: {
  before: string;
  after: string;
  labelBefore: string;
  labelAfter: string;
  orientation: "horizontal" | "vertical";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const draggingRef = useRef(false);
  const isVertical = orientation === "vertical";

  const setFromEvent = (clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const raw = isVertical
      ? ((clientY - r.top) / r.height) * 100
      : ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, raw)));
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      setFromEvent(e.clientX, e.clientY);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVertical]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (isVertical) {
      if (e.key === "ArrowUp") setPos((p) => Math.max(0, p - step));
      if (e.key === "ArrowDown") setPos((p) => Math.min(100, p + step));
    } else {
      if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - step));
      if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + step));
    }
  };

  const clipStyle = isVertical
    ? { clipPath: `inset(0 0 ${100 - pos}% 0)` }
    : { clipPath: `inset(0 ${100 - pos}% 0 0)` };

  return (
    <div
      ref={wrapRef}
      className="relative select-none overflow-hidden rounded-3xl border border-border bg-cream shadow-lg"
      onPointerDown={(e) => {
        draggingRef.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromEvent(e.clientX, e.clientY);
      }}
      style={{ touchAction: "none", cursor: isVertical ? "row-resize" : "col-resize" }}
    >
      <img src={after} alt={labelAfter} className="block h-auto w-full select-none" draggable={false} loading="lazy" />
      <img src={before} alt={labelBefore} className="absolute inset-0 block h-full w-full select-none object-cover" draggable={false} loading="lazy" style={clipStyle} />
      <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">{labelBefore}</span>
      <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent-foreground">{labelAfter}</span>
      <div
        role="slider"
        aria-label="Before/After"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-orientation={isVertical ? "vertical" : "horizontal"}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute z-10 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
        style={
          isVertical
            ? { left: 0, right: 0, top: `${pos}%`, height: 2, transform: "translateY(-1px)" }
            : { top: 0, bottom: 0, left: `${pos}%`, width: 2, transform: "translateX(-1px)" }
        }
      >
        <div
          className="absolute grid h-10 w-10 place-items-center rounded-full bg-white text-foreground shadow-lg ring-1 ring-black/10"
          style={
            isVertical
              ? { left: "50%", top: 0, transform: "translate(-50%,-50%)" }
              : { top: "50%", left: 0, transform: "translate(-50%,-50%)" }
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={isVertical ? { transform: "rotate(90deg)" } : undefined}>
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 6 15 12 9 18" transform="translate(6,0)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function toEmbed(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.replace(/^\//, "")}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "");
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return url;
}
