import { useLang } from "@/i18n/use-lang";

const CLIENTS = [
  "ARAMCO", "STC", "NEOM", "ROSHN", "SABIC", "MAADEN",
  "ALINMA", "ELM", "TAWUNIYA", "ALRAJHI", "MOBILY", "SAUDIA",
  "DIRIYAH", "QIDDIYA", "TABBY", "TAMARA", "JAHEZ", "NOON",
];

function LogoItem({ label }: { label: string }) {
  return (
    <span
      className="group inline-flex shrink-0 items-center justify-center px-8 py-4"
      dir="ltr"
    >
      <span className="font-display text-2xl md:text-3xl font-bold tracking-[0.2em] text-white/40 transition-all duration-500 group-hover:text-white group-hover:scale-110 group-hover:tracking-[0.25em]">
        {label}
      </span>
    </span>
  );
}

export function ClientsMarquee() {
  const { t, lang } = useLang();
  const items = [...CLIENTS, ...CLIENTS];
  return (
    <section className="relative overflow-hidden bg-ink py-20" id="clients">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          {lang === "ar" ? "أبرز العملاء" : "Selected clients"}
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-4xl">
          {lang === "ar"
            ? "علاماتٌ وثقت بالعمل معي"
            : "Brands that trusted the work"}
        </h2>
        <p className="mt-3 text-sm text-white/60">
          {lang === "ar"
            ? "نخبةٌ من العلامات في السعودية والإمارات ومصر والخليج."
            : "A selection of brands across KSA, UAE, Egypt and the Gulf."}
        </p>
      </div>

      <div
        className="clients-marquee relative mt-12"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="clients-marquee-track flex w-max items-center gap-4" dir="ltr">
          {items.map((c, i) => (
            <LogoItem key={i} label={c} />
          ))}
        </div>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        .clients-marquee-track {
          animation: clients-scroll 45s linear infinite;
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
