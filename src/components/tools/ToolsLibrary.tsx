import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/use-lang";
import { PageHero, container } from "@/components/studio";

export function ToolsLibrary() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  return (
    <main dir={isAr ? "rtl" : "ltr"}>
      <PageHero kicker={t("tools_kicker")} title={t("tools_title")} lede={t("tools_intro")} />
      <div className={`${container} pb-28 pt-16 md:pb-40 md:pt-24`}>
        <section
          aria-label={t("nav_tools")}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <Link
            to={"/tools/color-brief"}
            className="group relative flex min-h-80 flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] p-6 text-start transition-colors hover:border-white/25 sm:p-8"
          >
            <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl transition duration-500 group-hover:bg-accent/20" />
            <div className="relative mb-8 flex items-center justify-between">
              <span className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {t("tools_palette_tag")}
              </span>
              <span
                aria-hidden="true"
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-background text-foreground transition group-hover:border-accent/40 group-hover:text-accent"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3.1 1.8 1.8 0 0 1 1.3-3.1H17a4 4 0 0 0 4-4c0-4.3-4-7.8-9-7.8Z" />
                  <circle cx="7.5" cy="11" r="1" />
                  <circle cx="10" cy="7.5" r="1" />
                  <circle cx="14.5" cy="7.5" r="1" />
                  <circle cx="17" cy="10.5" r="1" />
                </svg>
              </span>
            </div>

            <div
              aria-hidden="true"
              className="relative mb-6 flex h-20 items-end gap-2 overflow-hidden rounded-2xl border border-border/70 bg-background/75 p-3"
            >
              <span className="h-9 flex-1 rounded-lg bg-[#D93D3D]" />
              <span className="h-12 flex-1 rounded-lg bg-[#D98C4A]" />
              <span className="h-14 flex-1 rounded-lg bg-[#E5C66F]" />
              <span className="h-11 flex-1 rounded-lg bg-[#47796E]" />
              <span className="h-8 flex-1 rounded-lg bg-[#263B39]" />
            </div>

            <div className="relative mt-auto">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {t("tools_palette_title")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t("tools_palette_desc")}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition group-hover:text-accent">
                {t("tools_palette_cta")}
                <span
                  aria-hidden="true"
                  className={`text-lg transition-transform ${isAr ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
                >
                  {isAr ? "←" : "→"}
                </span>
              </span>
            </div>
          </Link>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">{t("tools_coming_soon")}</p>
      </div>
    </main>
  );
}
