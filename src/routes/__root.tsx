import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logoFull from "@/assets/logo-full.png.asset.json";
import { useLang, detectLang } from "@/i18n/use-lang";
import { useCmsMenu, useCmsSettings } from "@/hooks/use-cms-data";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const home = isAr ? "/" : "/en";
  const projects = isAr ? "/projects" : "/en/projects";
  const contact = isAr ? "/contact" : "/en/contact";
  const arrow = isAr ? "←" : "→";
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-24 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Ambient decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t("nf_eyebrow")}
        </span>

        <h1
          className="mt-8 font-display text-[7rem] leading-none font-light tracking-tight text-foreground sm:text-[9rem]"
          aria-label="404"
        >
          <span className="bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">4</span>
          <span className="mx-1 inline-block text-accent">0</span>
          <span className="bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">4</span>
        </h1>

        <div aria-hidden className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <h2 className="mt-6 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {t("nf_title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          {t("nf_desc")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={home}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            {t("nf_back")}
            <span className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">{arrow}</span>
          </Link>
          <Link
            to={projects}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/60 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            {t("nf_explore_projects")}
          </Link>
          <Link
            to={contact}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nf_contact")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">{t("err_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("err_desc")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">{t("err_retry")}</button>
          <a href={isAr ? "/" : "/en"} className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground">{t("nav_home")}</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "googlebot", content: "index, follow" },
      { title: "يوسف رحاب — مصمم هوية بصرية في السعودية والإمارات" },
      { name: "description", content: "مصمم هوية بصرية استراتيجي لعلامات السعودية والإمارات والخليج — 8+ سنوات خبرة و250+ علامة تجارية." },
      { name: "author", content: "Youssef Rehab" },
      { name: "keywords", content: "مصمم هوية بصرية, تصميم شعار, هوية تجارية, تصميم لوجو, السعودية, الرياض, جدة, الإمارات, دبي, أبوظبي, الخليج, brand identity designer Saudi Arabia, logo designer UAE, visual identity Riyadh Dubai" },
      { name: "geo.region", content: "SA" },
      { name: "geo.placename", content: "Riyadh; Jeddah; Dubai; Abu Dhabi" },
      { name: "target", content: "SA, AE" },
      { property: "og:title", content: "يوسف رحاب — مصمم هوية بصرية في السعودية والإمارات" },
      { property: "og:description", content: "مصمم هوية بصرية استراتيجي لعلامات السعودية والإمارات والخليج — 8+ سنوات خبرة و250+ علامة تجارية." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_SA" },
      { property: "og:locale:alternate", content: "ar_AE" },
      { property: "og:locale:alternate", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "يوسف رحاب — مصمم هوية بصرية في السعودية والإمارات" },
      { name: "twitter:description", content: "مصمم هوية بصرية استراتيجي لعلامات السعودية والإمارات والخليج — 8+ سنوات خبرة و250+ علامة تجارية." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/c7PudvvpxgTNZbNywwP2DRvYmIk2/social-images/social-1783592902412-ChatGPT_Image_Jul_9,_2026,_01_28_06_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/c7PudvvpxgTNZbNywwP2DRvYmIk2/social-images/social-1783592902412-ChatGPT_Image_Jul_9,_2026,_01_28_06_PM.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "style", href: "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Youssef Rehab",
          alternateName: "يوسف رحاب",
          jobTitle: "Visual Identity Designer",
          description: "Strategic visual identity and logo designer serving Saudi Arabia, UAE and the Gulf.",
          email: "mailto:info@yrstudio.art",
          telephone: "+201030365405",
          sameAs: ["https://www.linkedin.com/in/youssef-rehab/"],
          areaServed: [
            { "@type": "Country", name: "Saudi Arabia" },
            { "@type": "Country", name: "United Arab Emirates" },
            { "@type": "Country", name: "Egypt" },
          ],
          knowsAbout: ["Visual Identity", "Logo Design", "Brand Guidelines", "Company Profile", "Social Media Design"],
          knowsLanguage: ["ar", "en"],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang = detectLang(pathname);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const themeInit = `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`;
  return (
    <html lang={lang} dir={dir}>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

function LangSync() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const lang = detectLang(pathname);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
    // Manage hreflang alternate links
    try {
      const isEn = pathname === "/en" || pathname.startsWith("/en/");
      const arPath = isEn ? (pathname.replace(/^\/en/, "") || "/") : pathname;
      const enPath = isEn ? pathname : `/en${pathname === "/" ? "" : pathname}`;
      const origin = "https://yrstudio.art";
      const entries: Array<[string, string]> = [
        ["ar", `${origin}${arPath}`],
        ["ar-SA", `${origin}${arPath}`],
        ["ar-AE", `${origin}${arPath}`],
        ["en", `${origin}${enPath}`],
        ["x-default", `${origin}${arPath}`],
      ];
      document.querySelectorAll('link[rel="alternate"][data-hreflang="1"]').forEach((n) => n.remove());
      for (const [hl, href] of entries) {
        const l = document.createElement("link");
        l.rel = "alternate";
        l.hreflang = hl;
        l.href = href;
        l.setAttribute("data-hreflang", "1");
        document.head.appendChild(l);
      }
    } catch {}
  }, [pathname]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { t } = useLang();
  return (
    <QueryClientProvider client={queryClient}>
      <LangSync />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t("skip_to_content")}
      </a>
      <SiteLoader />
      <LanguageWelcome />
      <Toaster position="top-center" richColors closeButton />
      <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        <SiteNav />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full min-w-0"><Outlet /></main>
        <SiteFooter />
        <WhatsAppFab />
        <BackToTop />
      </div>
    </QueryClientProvider>
  );
}

function LanguageWelcome() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem("yr_lang_chosen")) {
        const id = window.setTimeout(() => setOpen(true), 900);
        return () => window.clearTimeout(id);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first button
    const focusables = (): HTMLElement[] => {
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      return nodes ? Array.from(nodes) : [];
    };
    const first = focusables()[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const list = Array.from(focusables());
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const choose = (lang: "ar" | "en") => {
    try {
      localStorage.setItem("yr_lang_chosen", lang);
    } catch {
      /* ignore */
    }
    const path = window.location.pathname;
    const isOnEn = path === "/en" || path.startsWith("/en/");
    let target = path;
    if (lang === "en" && !isOnEn) {
      target = `/en${path === "/" ? "" : path}`;
    } else if (lang === "ar" && isOnEn) {
      target = path.replace(/^\/en/, "") || "/";
    }
    setOpen(false);
    if (target !== path) {
      window.location.assign(target + window.location.search + window.location.hash);
    }
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300 motion-reduce:animate-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-welcome-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        tabIndex={-1}
      />

      {/* Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_40px_120px_-30px_rgb(0_0_0/0.5)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 motion-reduce:animate-none">

        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative px-8 pb-8 pt-10 text-center sm:px-10 sm:pt-12">
          {/* Logo */}
          <div className="mx-auto flex items-center justify-center">
            <img
              src={logoFull.url}
              alt="YR Studio"
              className="h-10 w-auto [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]"
            />
          </div>

          <div className="mt-6 space-y-1">
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground" id="lang-welcome-title">
              أهلًا بك <span className="text-muted-foreground/70">·</span> Welcome
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              اختر لغتك المفضّلة للمتابعة
              <br />
              <span className="text-foreground/60">Please choose your preferred language</span>
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => choose("ar")}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-background/60 px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-lg"
              dir="rtl"
            >
              <span className="font-display text-lg font-semibold">العربيّة</span>
              <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">تصفّح باللغة العربية</span>
            </button>

            <button
              type="button"
              onClick={() => choose("en")}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-background/60 px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-lg"
              dir="ltr"
            >
              <span className="font-display text-lg font-semibold">English</span>
              <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">Browse in English</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const nav = typeof navigator !== "undefined" ? (navigator.language || "").toLowerCase() : "";
                const detected: "ar" | "en" = nav.startsWith("ar") ? "ar" : "en";
                choose(detected);
              }}
              className="text-[11px] text-muted-foreground/80 underline-offset-4 hover:text-accent hover:underline"
            >
              <span dir="rtl">تخطّي — استخدم لغة المتصفح</span>
              <span className="mx-2 opacity-40">·</span>
              <span>Skip — use browser language</span>
            </button>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground/70">
            <span dir="rtl">يمكنك تغيير اللغة لاحقًا من أعلى الصفحة</span>
            <span className="mx-2 opacity-40">·</span>
            <span>You can switch languages anytime from the header</span>
          </p>
        </div>
      </div>
    </div>
  );
}


function SiteLoader() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1250);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div className="site-loader" aria-hidden="true">
      <div className="site-loader-ring" />
    </div>
  );
}

function BackToTop() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label={t("back_to_top")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground ${show ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-2"}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

function WhatsAppFab() {
  const { t } = useLang();
  return (
    <a
      href="/go/wa"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 focus:outline-none"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping motion-reduce:hidden" aria-hidden="true" />
      <svg viewBox="0 0 32 32" className="relative h-8 w-8" aria-hidden="true">
        <path fill="#ffffff" d="M16.003 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.55-1.71a12.77 12.77 0 0 0 6.25 1.6h.01c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.06-3.64Zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.39a10.62 10.62 0 0 1-1.63-5.68c0-5.87 4.78-10.65 10.65-10.65 2.85 0 5.52 1.11 7.53 3.12a10.58 10.58 0 0 1 3.12 7.53c0 5.87-4.78 10.65-10.65 10.65Zm5.84-7.98c-.32-.16-1.9-.94-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55-.19-.01-.4-.01-.61-.01-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.29 3.29.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}

function LangSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { lang, altHref } = useLang();
  return (
    <Link
      to={altHref}
      onClick={onNavigate}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className={lang === "ar" ? "text-accent" : "text-muted-foreground"}>AR</span>
      <span className="text-muted-foreground/60">|</span>
      <span className={lang === "en" ? "text-accent" : "text-muted-foreground"}>EN</span>
    </Link>
  );
}

function SiteNav() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const base = lang === "ar" ? "" : "/en";
  const cmsMenu = useCmsMenu("header");
  const defaults = [
    { to: base || "/", label: t("nav_home"), external: false, newTab: false },
    { to: `${base}/projects`, label: t("nav_projects"), external: false, newTab: false },
    { to: `${base}/insights`, label: t("nav_insights"), external: false, newTab: false },
    { to: `${base}/packages`, label: t("nav_packages"), external: false, newTab: false },
    { to: `${base}/contact`, label: t("nav_contact"), external: false, newTab: false },
  ];
  const links = cmsMenu.length > 0
    ? cmsMenu.map((m) => ({
        to: m.url.startsWith("/") && !m.is_external && lang === "en" && !m.url.startsWith("/en") ? `/en${m.url === "/" ? "" : m.url}` : m.url,
        label: (lang === "en" ? m.label_en : m.label_ar) || m.label_ar,
        external: m.is_external,
        newTab: m.open_in_new_tab,
      }))
    : defaults;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to={base || "/"} className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)} aria-label={t("brand_alt")}>
          <img src={logoFull.url} alt={t("brand_alt")} className="h-7 w-auto md:h-9 [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]" />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            l.external ? (
              <a key={l.to} href={l.to} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noopener noreferrer" : undefined}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</a>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" || l.to === "/en" }}
                activeProps={{ className: "text-foreground font-semibold" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="text-sm transition-colors hover:text-foreground"
              >{l.label}</Link>
            )
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <LangSwitcher />
          <Link to={`${base}/contact`} className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">{t("cta_start_project")}</Link>
        </div>
        <div className="md:hidden flex items-center gap-1.5">
          <ThemeToggle />
          <LangSwitcher />
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent" onClick={() => setOpen(v => !v)} aria-label={t("menu_label")}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
            {links.map((l) => (
              l.external ? (
                <a key={l.to} href={l.to} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)} className="text-sm text-muted-foreground">{l.label}</a>
              ) : (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">{l.label}</Link>
              )
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function SiteFooter() {
  const { t, lang } = useLang();
  const base = lang === "ar" ? "" : "/en";
  const year = new Date().getFullYear();
  const cmsMenu = useCmsMenu("footer_primary");
  const settings = useCmsSettings();
  const phone = settings?.contact_phone || "+20 103 036 5405";
  const phoneHref = "tel:" + (settings?.contact_phone || "+201030365405").replace(/\s+/g, "");
  const email = settings?.contact_email || "info@yrstudio.art";
  const socials = settings?.socials || {};
  const defaults = [
    { to: base || "/", label: t("nav_home"), external: false, newTab: false },
    { to: `${base}/projects`, label: t("nav_projects"), external: false, newTab: false },
    { to: `${base}/insights`, label: t("nav_insights"), external: false, newTab: false },
    { to: `${base}/packages`, label: t("nav_packages"), external: false, newTab: false },
    { to: `${base}/contact`, label: t("nav_contact"), external: false, newTab: false },
  ];
  const footerLinks = cmsMenu.length > 0
    ? cmsMenu.map((m) => ({
        to: m.url.startsWith("/") && !m.is_external && lang === "en" && !m.url.startsWith("/en") ? `/en${m.url === "/" ? "" : m.url}` : m.url,
        label: (lang === "en" ? m.label_en : m.label_ar) || m.label_ar,
        external: m.is_external,
        newTab: m.open_in_new_tab,
      }))
    : defaults;

  return (
    <footer className="mt-auto bg-ink text-white/70 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-12">
        <div className="md:col-span-5 space-y-5">
          <Link to={base || "/"} className="inline-flex items-center" aria-label={t("brand_alt")}>
            <img src={logoFull.url} alt={t("brand_alt")} className="h-10 w-auto invert" />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">{t("footer_bio")}</p>
          <NewsletterForm />
        </div>
        <div className="md:col-span-3">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">{t("explore")}</div>
          <ul className="space-y-2 text-sm">
            {footerLinks.map((l) => (
              <li key={l.to}>
                {l.external ? (
                  <a href={l.to} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noopener noreferrer" : undefined} className="hover:text-accent transition-colors">{l.label}</a>
                ) : (
                  <Link to={l.to} className="hover:text-accent transition-colors">{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">{t("contact")}</div>
          <ul className="space-y-2 text-sm">
            <li><a href={phoneHref} className="hover:text-accent transition-colors" dir="ltr">{phone}</a></li>
            <li><a href={`mailto:${email}`} className="hover:text-accent transition-colors">{email}</a></li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            {socials.linkedin ? (
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={t("linkedin")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
              </a>
            ) : (
              <a href="/go/li" target="_blank" rel="noopener noreferrer" aria-label={t("linkedin")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            )}
            {socials.behance && (
              <a href={socials.behance} target="_blank" rel="noopener noreferrer" aria-label="Behance"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M7.44 6.5c1.28 0 2.24.24 2.88.72.64.48.96 1.2.96 2.16 0 .58-.13 1.07-.4 1.47-.26.39-.65.7-1.16.94.7.2 1.22.55 1.58 1.04.36.5.53 1.12.53 1.86 0 1.13-.38 1.99-1.14 2.58-.76.59-1.83.88-3.22.88H2V6.5h5.44Zm-.14 3.9c.48 0 .85-.11 1.11-.33.26-.22.39-.55.39-.98 0-.42-.13-.73-.4-.93-.26-.2-.63-.3-1.1-.3H4.55v2.54H7.3Zm.12 4.72c1.15 0 1.72-.5 1.72-1.5 0-.51-.14-.88-.42-1.11-.28-.24-.72-.35-1.31-.35H4.55v2.96h2.87Zm10.35-3.66c1.03 0 1.62-.55 1.75-1.66h-3.5c.15 1.1.73 1.66 1.75 1.66Zm4.19.71h-5.94c.05.72.28 1.24.69 1.55.4.32.94.48 1.62.48.86 0 1.52-.32 2-.96l1.4.94c-.79 1.2-2 1.8-3.62 1.8-1.35 0-2.42-.4-3.22-1.19-.8-.79-1.2-1.87-1.2-3.24 0-1.31.4-2.36 1.2-3.14.8-.79 1.85-1.18 3.14-1.18 1.24 0 2.24.38 3 1.14.76.76 1.14 1.79 1.14 3.09 0 .28-.02.51-.05.71ZM19.94 8.9h-4.13V7.36h4.13V8.9Z"/></svg>
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M18.244 2H21l-6.564 7.5L22 22h-6.828l-4.75-6.203L4.8 22H2l7.02-8.02L2 2h6.914l4.3 5.68L18.244 2Zm-2.394 18h1.65L8.24 4H6.5l9.35 16Z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 md:flex-row">
          <div className="text-xs text-white/50">© {year} {t("brand_alt")}® — {t("rights")}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{t("built_with_care")}</div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [hp, setHp] = useState("");
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hp) return;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) { setStatus("error"); return; }
    try {
      const list = JSON.parse(localStorage.getItem("nl_subs") || "[]");
      if (!list.includes(email.trim())) list.push(email.trim());
      localStorage.setItem("nl_subs", JSON.stringify(list));
    } catch {}
    setStatus("ok");
    setEmail("");
  };
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">{t("newsletter")}</div>
      <p className="mb-3 text-sm text-white/60">{t("newsletter_sub")}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate dir={lang === "ar" ? "rtl" : "ltr"}>
        <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
        <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder={t("newsletter_placeholder")} dir="ltr"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none" />
        <button type="submit" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">{t("newsletter_subscribe")}</button>
      </form>
      {status === "ok" && <p className="mt-2 text-xs text-accent">{t("newsletter_ok")}</p>}
      {status === "error" && <p className="mt-2 text-xs text-red-400">{t("newsletter_err")}</p>}
    </div>
  );
}
