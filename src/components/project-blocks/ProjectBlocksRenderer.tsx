import type { ProjectBlock } from "@/lib/project-blocks";
import { ZoomableImage } from "@/components/ZoomableImage";

type Lang = "ar" | "en";

function pick(ar?: string, en?: string, lang: Lang = "ar") {
  const primary = lang === "ar" ? ar : en;
  return (primary && primary.trim()) || (lang === "ar" ? en : ar) || "";
}

export function ProjectBlocksRenderer({
  blocks,
  lang,
}: {
  blocks: ProjectBlock[];
  lang: Lang;
}) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="project-blocks">
      {blocks.map((b) => (
        <BlockRender key={b.id} block={b} lang={lang} />
      ))}
    </div>
  );
}

function BlockRender({ block: b, lang }: { block: ProjectBlock; lang: Lang }) {
  switch (b.type) {
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
                <img src={u} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
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
      return (
        <section className="mx-auto max-w-6xl px-6 py-10">
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
    default:
      return null;
  }
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
