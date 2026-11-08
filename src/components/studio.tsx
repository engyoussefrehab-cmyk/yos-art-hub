/*
 * Shared "studio" UI used on every page: rounded hero card with a moving
 * colour field, pill buttons with a round arrow, section headings with a ✦
 * kicker, chips and card shells. Dark only. Animations live in styles.css
 * (.yr-blob, .yr-marquee) and respect prefers-reduced-motion.
 */
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Standard page container width and side padding. */
export const container = "mx-auto max-w-[1400px] px-6 md:px-10";

/** Card shell. */
export const card = "rounded-[1.75rem] border border-white/10 bg-[#0b0b0b]";

/** Round arrow used inside buttons and on cards. */
export function ArrowDot({
  tone = "dark",
  size = "sm",
}: {
  tone?: "dark" | "light" | "red";
  size?: "sm" | "lg";
}) {
  const tones = {
    dark: "bg-black text-white",
    light: "bg-white text-black",
    red: "bg-accent text-accent-foreground",
  };
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-transform group-hover:-rotate-45 ${tones[tone]} ${
        size === "lg" ? "h-14 w-14 text-xl" : "h-8 w-8 text-sm"
      }`}
    >
      ↖
    </span>
  );
}

/** Pill button with a round arrow. Use `to` for site pages, `href` for files/external. */
export function Pill({
  to,
  href,
  children,
  variant = "light",
  download,
  newTab,
  type,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "light" | "red" | "ghost";
  download?: string;
  newTab?: boolean;
  type?: "submit" | "button";
}) {
  const styles = {
    light: "bg-white text-black",
    red: "bg-accent text-accent-foreground",
    ghost: "border border-white/20 text-white hover:border-white/60",
  };
  const cls = `group inline-flex items-center gap-3 whitespace-nowrap rounded-full py-1.5 pe-1.5 ps-5 text-sm font-bold transition disabled:opacity-60 ${styles[variant]} ${focusRing}`;
  const dot = (
    <ArrowDot tone={variant === "light" ? "red" : variant === "red" ? "dark" : "light"} />
  );
  if (type)
    return (
      <button type={type} className={cls}>
        {children}
        {dot}
      </button>
    );
  if (href)
    return (
      <a
        href={href}
        className={cls}
        download={download}
        target={download || newTab ? "_blank" : undefined}
        rel={download || newTab ? "noopener noreferrer" : undefined}
      >
        {children}
        {dot}
      </a>
    );
  return (
    <Link to={to!} className={cls}>
      {children}
      {dot}
    </Link>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="text-accent">✦</span>
      {children}
    </span>
  );
}

/** Section heading: ✦ kicker, title, optional action on the far side. */
export function Heading({
  kicker,
  title,
  lede,
  action,
  as: Tag = "h2",
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Tag className="mt-3 font-display text-3xl font-bold leading-[1.2] md:text-[2.75rem]">
          {title}
        </Tag>
        {lede && (
          <p className="mt-4 max-w-2xl leading-[1.9] text-muted-foreground md:text-lg">{lede}</p>
        )}
      </div>
      {action && <div className="shrink-0 self-start md:self-auto">{action}</div>}
    </div>
  );
}

/** Colour field behind hero/CTA cards. */
export function ColourField({ variant = "hero" }: { variant?: "hero" | "soft" }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <div className="yr-blob absolute -top-24 end-[-10%] h-[70%] w-[70%] rounded-full bg-accent/55 blur-[110px]" />
      <div className="yr-blob absolute bottom-[-30%] start-[-10%] h-[70%] w-[60%] rounded-full bg-[#ff9a62]/30 blur-[120px] [animation-delay:-6s]" />
      {variant === "hero" && (
        <div className="yr-blob absolute top-[25%] start-[30%] h-[45%] w-[40%] rounded-full bg-[#7b2cff]/25 blur-[120px] [animation-delay:-12s]" />
      )}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: "repeating-linear-gradient(115deg, white 0 1px, transparent 1px 22px)",
        }}
      />
    </div>
  );
}

/**
 * Top of an inner page: a rounded card with the colour field, breadcrumb
 * slot, kicker, big title, lede and optional actions/meta.
 */
export function PageHero({
  kicker,
  title,
  lede,
  crumbs,
  children,
  aside,
  image,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: { label: string; to?: string }[];
  children?: ReactNode;
  aside?: ReactNode;
  image?: string;
}) {
  return (
    <section className="px-3 pt-3 sm:px-6">
      <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 pb-10 pt-24 md:px-16 md:pb-16 md:pt-32">
        {image ? (
          <div aria-hidden className="absolute inset-0 -z-10">
            <img src={image} alt="" className="h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/70 to-[#0b0b0b]/30" />
          </div>
        ) : (
          <ColourField />
        )}
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="مسار الصفحة"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60"
          >
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {c.to ? (
                  <Link to={c.to} className="hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-white/90">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span aria-hidden>/</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className={aside ? "lg:col-span-8" : "lg:col-span-10"}>
            {kicker && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">
                <span className="text-accent">✦</span>
                {kicker}
              </span>
            )}
            <h1 className="mt-5 font-display text-[2.25rem] font-bold leading-[1.15] text-white sm:text-5xl lg:text-[3.75rem]">
              {title}
            </h1>
            {lede && (
              <p className="mt-5 max-w-2xl text-base leading-[1.9] text-white/75 md:text-lg">
                {lede}
              </p>
            )}
            {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
          </div>
          {aside && <div className="lg:col-span-4 lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

/** Small rounded chip / tag. */
export function Chip({
  children,
  tone = "line",
}: {
  children: ReactNode;
  tone?: "line" | "solid" | "dark";
}) {
  const t = {
    line: "border border-white/15 text-white/80",
    solid: "bg-white text-black font-semibold",
    dark: "bg-black/70 text-white backdrop-blur",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${t[tone]}`}>
      {children}
    </span>
  );
}

/** Stat tile. */
export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/[0.05] p-5 backdrop-blur">
      <div className="font-display text-2xl font-bold md:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground md:text-sm">{label}</div>
    </div>
  );
}
