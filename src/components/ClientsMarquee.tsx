import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n/use-lang";
import { supabase } from "@/integrations/supabase/client";

import { pair } from "@/i18n/dictionary";
type Logo = { id: string; name: string; logo_url: string; href: string | null };

function LogoTile({ logo }: { logo: Logo }) {
  const img = (
    <img
      src={logo.logo_url}
      alt={logo.name}
      loading="lazy"
      className="h-9 w-auto max-w-[150px] object-contain opacity-60 grayscale brightness-200 contrast-125 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-[1.06] md:h-11"
    />
  );
  return (
    <span
      className="group relative inline-flex h-20 shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/40 hover:bg-white/[0.05] hover:shadow-[0_0_40px_-8px_hsl(var(--accent)/0.35)] md:h-24 md:px-10"
      dir="ltr"
      title={logo.name}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {logo.href ? (
        <a href={logo.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
          {img}
        </a>
      ) : (
        img
      )}
    </span>
  );
}

function Row({ logos, reverse = false, duration = 50 }: { logos: Logo[]; reverse?: boolean; duration?: number }) {
  const items = useMemo(() => [...logos, ...logos], [logos]);
  return (
    <div
      className="clients-marquee relative"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="clients-marquee-track flex w-max items-center gap-3 md:gap-4"
        dir="ltr"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {items.map((c, i) => (
          <LogoTile key={`${c.id}-${i}`} logo={c} />
        ))}
      </div>
    </div>
  );
}

export function ClientsMarquee() {
  const { lang } = useLang();
  const [logos, setLogos] = useState<Logo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("client_logos")
      .select("id,name,logo_url,href")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setLogos((data ?? []) as Logo[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!logos || logos.length === 0) return null;

  const count = logos.length;
  const twoRows = count >= 8;
  const half = Math.ceil(count / 2);
  const rowA = twoRows ? logos.slice(0, half) : logos;
  const rowB = twoRows ? logos.slice(half) : [];

  return (
    <section className="relative overflow-hidden bg-ink py-24" id="clients" aria-labelledby="clients-heading">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-white/[0.03] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {lang === "ar" ? pair("ui_clientsmarquee_1")[0] : pair("ui_clientsmarquee_1")[1]}
          </span>
          <h2
            id="clients-heading"
            className="mt-5 font-display text-3xl font-bold leading-[1.15] text-white md:text-5xl"
          >
            {lang === "ar" ? (
              <>
                علاماتٌ وثقت
                <span className="text-accent"> بالعمل معي</span>
              </>
            ) : (
              <>
                Brands that trusted
                <span className="text-accent"> the work</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
            {lang === "ar" ? pair("ui_clientsmarquee_2")[0] : pair("ui_clientsmarquee_2")[1]}
          </p>
        </div>

        {/* Stats strip */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-5 text-center backdrop-blur-sm rtl:divide-x-reverse">
          <div className="px-3">
            <div className="font-display text-2xl font-bold text-white md:text-3xl">
              {count}+
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
              {lang === "ar" ? pair("ui_clientsmarquee_3")[0] : pair("ui_clientsmarquee_3")[1]}
            </div>
          </div>
          <div className="px-3">
            <div className="font-display text-2xl font-bold text-white md:text-3xl">4</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
              {lang === "ar" ? pair("ui_clientsmarquee_4")[0] : pair("ui_clientsmarquee_4")[1]}
            </div>
          </div>
          <div className="px-3">
            <div className="font-display text-2xl font-bold text-white md:text-3xl">100%</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">
              {lang === "ar" ? pair("ui_clientsmarquee_5")[0] : pair("ui_clientsmarquee_5")[1]}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="relative mt-14 space-y-4 md:space-y-5">
        <Row logos={rowA} duration={twoRows ? 55 : 50} />
        {twoRows && rowB.length > 0 && <Row logos={rowB} reverse duration={65} />}
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        .clients-marquee-track {
          animation-name: clients-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .clients-marquee:hover .clients-marquee-track {
          animation-play-state: paused;
        }
        @keyframes clients-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .clients-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
