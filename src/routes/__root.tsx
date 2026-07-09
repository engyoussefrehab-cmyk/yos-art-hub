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
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logoFull from "@/assets/logo-full.png.asset.json";
import { useLang, detectLang } from "@/i18n/use-lang";

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
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent"
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
  }, [pathname]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LangSync />
      <SiteLoader />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteNav />
        <main className="flex-1 flex flex-col"><Outlet /></main>
        <SiteFooter />
        <WhatsAppFab />
        <BackToTop />
      </div>
    </QueryClientProvider>
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
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden="true" />
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
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent"
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
  const links = [
    { to: base || "/", label: t("nav_home") },
    { to: `${base}/projects`, label: t("nav_projects") },
    { to: `${base}/contact`, label: t("nav_contact") },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to={base || "/"} className="flex items-center gap-2" onClick={() => setOpen(false)} aria-label={t("brand_alt")}>
          <img src={logoFull.url} alt={t("brand_alt")} className="h-8 w-auto md:h-9 [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]" />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" || l.to === "/en" }}
              activeProps={{ className: "text-foreground font-semibold" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="text-sm transition-colors hover:text-foreground"
            >{l.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <LangSwitcher />
          <Link to={`${base}/contact`} className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">{t("cta_start_project")}</Link>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <LangSwitcher />
          <button className="rounded-md border border-border p-2" onClick={() => setOpen(v => !v)} aria-label={t("menu_label")}>
            <span className="block h-0.5 w-5 bg-foreground mb-1" />
            <span className="block h-0.5 w-5 bg-foreground mb-1" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground">{l.label}</Link>
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
            <li><Link to={base || "/"} className="hover:text-accent transition-colors">{t("nav_home")}</Link></li>
            <li><Link to={`${base}/projects`} className="hover:text-accent transition-colors">{t("nav_projects")}</Link></li>
            <li><Link to={`${base}/contact`} className="hover:text-accent transition-colors">{t("nav_contact")}</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">{t("contact")}</div>
          <ul className="space-y-2 text-sm">
            <li><a href="tel:+201030365405" className="hover:text-accent transition-colors" dir="ltr">+20 103 036 5405</a></li>
            <li><a href="mailto:info@yrstudio.art" className="hover:text-accent transition-colors">info@yrstudio.art</a></li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a href="/go/li" target="_blank" rel="noopener noreferrer" aria-label={t("linkedin")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
            </a>
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
