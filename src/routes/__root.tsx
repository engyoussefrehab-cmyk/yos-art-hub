import { WEB3FORMS_ACCESS_KEY } from "@/lib/site";
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
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoFull from "@/assets/logo-full.png.asset.json";
import { useLang, detectLang } from "@/i18n/use-lang";
import { useCmsMenu, useCmsSettings } from "@/hooks/use-cms-data";
import { Toaster } from "@/components/ui/sonner";

import { pair } from "@/i18n/dictionary";
import seo from "@/content/seo.json";
import contact from "@/content/contact.json"; import analytics from "@/content/analytics.json";
export function NotFoundComponent() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const home ="/";
  const projects ="/projects";
  const contact ="/contact";
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
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">{t("err_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("err_desc")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">{t("err_retry")}</button>
          <a href={"/"} className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground">{t("nav_home")}</a>
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
      { title: seo.site.ar.title },
      { name: "description", content: seo.site.ar.description },
      { name: "author", content: "Youssef Rehab" },
      { name: "keywords", content: seo.site.ar.keywords },
      { name: "geo.region", content: "SA" },
      { name: "geo.placename", content: "Riyadh; Jeddah; Dubai; Abu Dhabi" },
      { name: "target", content: "SA, AE" },
      { property: "og:title", content: seo.site.ar.og_title },
      { property: "og:description", content: seo.site.ar.og_description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_SA" },
      { property: "og:locale:alternate", content: "ar_AE" },
      { property: "og:locale:alternate", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: seo.site.ar.twitter_title },
      { name: "twitter:description", content: seo.site.ar.twitter_description },
      { property: "og:image", content: seo.site.ar.og_image },
      { name: "twitter:image", content: seo.site.ar.og_image },
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
          email: `mailto:${contact.email}`,
          telephone: contact.phone_e164,
          sameAs: [contact.linkedin_url],
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
  // Dark mode only.
  return (
    <html lang={lang} dir={dir} className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
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
      const arPath = pathname;
      const origin = "https://yrstudio.art";
      const entries: Array<[string, string]> = [
        ["ar", `${origin}${arPath}`],
        ["ar-SA", `${origin}${arPath}`],
        ["ar-AE", `${origin}${arPath}`],
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const previousPage = useRef<string | undefined>(undefined);
  const measurementId = analytics.google_analytics_id.trim();

  useEffect(() => {
    if (isAdmin || !/^G-[A-Z0-9]+$/i.test(measurementId)) return;
    const gaWindow = window as Window & { dataLayer?: unknown[]; gtag?: (...args: any[]) => void };
    gaWindow.dataLayer = gaWindow.dataLayer || [];
    gaWindow.gtag = gaWindow.gtag || function (...args: any[]) { gaWindow.dataLayer!.push(args); };
    gaWindow.gtag("js", new Date());
    gaWindow.gtag("config", measurementId, { send_page_view: false });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.googleAnalytics = measurementId;
    document.head.appendChild(script);
    return () => script.remove();
  }, [isAdmin, measurementId]);

  useEffect(() => {
    if (isAdmin || !/^G-[A-Z0-9]+$/i.test(measurementId)) return;
    const gaWindow = window as Window & { gtag?: (...args: any[]) => void };
    gaWindow.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
      page_referrer: previousPage.current ?? document.referrer,
    });
    previousPage.current = window.location.href;
  }, [isAdmin, measurementId, pathname]);

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" richColors closeButton />
        <Outlet />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LangSync />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t("skip_to_content")}
      </a>
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
      className={`fixed bottom-4 right-4 md:bottom-5 md:right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground ${show ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-2"}`}
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
      className="fixed bottom-4 left-4 z-50 flex h-12 w-12 md:bottom-5 md:left-5 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 focus:outline-none"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping motion-reduce:hidden" style={{ animationIterationCount: 3 }} aria-hidden="true" />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7 md:h-8 md:w-8" aria-hidden="true">
        <path fill="#ffffff" d="M16.003 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.55-1.71a12.77 12.77 0 0 0 6.25 1.6h.01c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.06-3.64Zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.39a10.62 10.62 0 0 1-1.63-5.68c0-5.87 4.78-10.65 10.65-10.65 2.85 0 5.52 1.11 7.53 3.12a10.58 10.58 0 0 1 3.12 7.53c0 5.87-4.78 10.65-10.65 10.65Zm5.84-7.98c-.32-.16-1.9-.94-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55-.19-.01-.4-.01-.61-.01-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.29 3.29.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}


function SiteNav() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const base ="";
  const cmsMenu = useCmsMenu("header");
  const defaults = [
    { to: base || "/", label: t("nav_home"), external: false, newTab: false },
    { to: `${base}/projects`, label: t("nav_projects"), external: false, newTab: false },
    { to: `${base}/insights`, label: t("nav_insights"), external: false, newTab: false },
    { to: `${base}/tools`, label: t("nav_tools"), external: false, newTab: false },
    { to: `${base}/contact`, label: t("nav_contact"), external: false, newTab: false },
  ];
  const cmsLinks = cmsMenu.map((m) => ({
        to: m.url.startsWith("/") && !m.is_external && lang === "en" && !m.url.startsWith("/en") ? `/en${m.url === "/" ? "" : m.url}` : m.url,
        label: (lang === "en" ? m.label_en : m.label_ar) || m.label_ar,
        external: m.is_external,
        newTab: m.open_in_new_tab,
      }));
  const toolLink = { to: `${base}/tools`, label: t("nav_tools"), external: false, newTab: false };
  const links = cmsMenu.length > 0
    ? [...cmsLinks.filter((link) => link.to !== `${base}/tools/color-brief`), ...(cmsLinks.some((link) => link.to === toolLink.to) ? [] : [toolLink])]
    : defaults;
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-white/10 bg-black/70 py-2 pe-2 ps-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <Link to={base || "/"} className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)} aria-label={t("brand_alt")}>
          <img src={logoFull.url} alt={t("brand_alt")} className="h-7 w-auto md:h-9 [filter:brightness(0)] dark:[filter:brightness(0)_invert(1)]" />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
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
                className="rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/5 hover:text-foreground"
              >{l.label}<span aria-hidden className="ms-1 text-accent">+</span></Link>
            )
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to={`${base}/contact`} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground transition hover:brightness-110">{t("cta_start_project")} <span aria-hidden>←</span></Link>
        </div>
        <div className="md:hidden flex items-center gap-1.5">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setOpen(v => !v)} aria-label={t("menu_label")} aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-black/95 backdrop-blur-md">
          <div className="flex flex-col gap-1 p-3">
            {links.map((l) => (
              l.external ? (
                <a key={l.to} href={l.to} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-display text-lg text-foreground hover:bg-white/5">{l.label}</a>
              ) : (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-display text-lg text-foreground hover:bg-white/5">{l.label}</Link>
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
  const base ="";
  const year = new Date().getFullYear();
  const cmsMenu = useCmsMenu("footer_primary");
  const settings = useCmsSettings();
  const phone = contact.phone_footer;
  const phoneHref = "tel:" + contact.phone_e164.replace(/\s+/g, "");
  const email = contact.email;
  const socials = settings?.socials || {};
  const defaults = [
    { to: base || "/", label: t("nav_home"), external: false, newTab: false },
    { to: `${base}/projects`, label: t("nav_projects"), external: false, newTab: false },
    { to: `${base}/insights`, label: t("nav_insights"), external: false, newTab: false },
    { to: `${base}/tools`, label: t("nav_tools"), external: false, newTab: false },
    { to: `${base}/contact`, label: t("nav_contact"), external: false, newTab: false },
  ];
  const cmsLinks = cmsMenu.map((m) => ({
        to: m.url.startsWith("/") && !m.is_external && lang === "en" && !m.url.startsWith("/en") ? `/en${m.url === "/" ? "" : m.url}` : m.url,
        label: (lang === "en" ? m.label_en : m.label_ar) || m.label_ar,
        external: m.is_external,
        newTab: m.open_in_new_tab,
      }));
  const toolLink = { to: `${base}/tools`, label: t("nav_tools"), external: false, newTab: false };
  const footerLinks = cmsMenu.length > 0
    ? [...cmsLinks.filter((link) => link.to !== `${base}/tools/color-brief`), ...(cmsLinks.some((link) => link.to === toolLink.to) ? [] : [toolLink])]
    : defaults;

  const bigLink = "block font-display text-4xl font-bold leading-[1.25] transition-colors hover:text-accent md:text-5xl";
  const card = "rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-6 md:p-8";
  return (
    <footer className="mt-auto px-3 pb-3 pt-3 sm:px-6">
      <div className="mx-auto grid max-w-[1400px] gap-3 md:grid-cols-12">
        {/* Navigation — big type */}
        <nav className={`${card} md:col-span-5`} aria-label={t("explore")}>
          <ul className="space-y-1">
            {footerLinks.map((l) => (
              <li key={l.to}>
                {l.external ? (
                  <a href={l.to} target={l.newTab ? "_blank" : undefined} rel={l.newTab ? "noopener noreferrer" : undefined} className={bigLink}>{l.label}</a>
                ) : (
                  <Link to={l.to} className={bigLink}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
          {/* Contact */}
          <div className={card}>
            <div className="font-display text-2xl font-bold">{t("contact")}</div>
            <ul className="mt-5 space-y-3 text-white/80">
              <li><a href={contact.whatsapp_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">واتساب ↖</a></li>
              <li><a href={phoneHref} className="hover:text-accent" dir="ltr">{phone}</a></li>
              <li><a href={`mailto:${email}`} className="hover:text-accent">{email}</a></li>
              <li><a href={socials.linkedin || "/go/li"} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{t("linkedin")} ↖</a></li>
              {socials.instagram && <li><a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent">إنستجرام ↖</a></li>}
              {socials.behance && <li><a href={socials.behance} target="_blank" rel="noopener noreferrer" className="hover:text-accent">Behance ↖</a></li>}
            </ul>
          </div>

          {/* Big CTA card */}
          <Link to="/contact" className="group flex flex-col justify-between rounded-[2rem] bg-accent p-6 text-black md:p-8">
            <span className="font-display text-3xl font-bold leading-tight md:text-4xl">{t("cta_start_project")}</span>
            <span className="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl text-white transition-transform group-hover:-rotate-45" aria-hidden>↖</span>
          </Link>

          {/* Brand + newsletter */}
          <div className={`${card} md:col-span-2`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-sm">
                <Link to="/" className="inline-flex" aria-label={t("brand_alt")}>
                  <img src={logoFull.url} alt={t("brand_alt")} className="h-9 w-auto invert" />
                </Link>
                <p className="mt-4 text-sm leading-relaxed text-white/60">{t("footer_bio")}</p>
              </div>
              <div className="w-full md:max-w-sm"><NewsletterForm /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-3 py-5 text-xs text-white/40 md:flex-row">
        <div>© {year} {t("brand_alt")} — {t("rights")}</div>
        <div>{t("built_with_care")}</div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [hp, setHp] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hp) return;
    const value = email.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) { setStatus("error"); return; }
    try {
      // Each new subscriber arrives as an email at the site inbox.
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          from_name: "yrstudio.art",
          subject: "[yrstudio.art] اشتراك جديد في النشرة البريدية",
          email: value,
          replyto: value,
          message: `اشتراك جديد في النشرة البريدية: ${value} (${lang === "ar" ? pair("ui_root_1")[0] : pair("ui_root_1")[1]})`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(String(res.status));
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">{t("newsletter")}</div>
      <p className="mb-3 text-sm text-white/60">{t("newsletter_sub")}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate dir={lang === "ar" ? "rtl" : "ltr"}>
        <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
        <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder={t("newsletter_placeholder")} dir="ltr"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none" />
        <button type="submit" className="shrink-0 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">{t("newsletter_subscribe")}</button>
      </form>
      {status === "ok" && <p className="mt-2 text-xs text-accent">{t("newsletter_ok")}</p>}
      {status === "error" && <p className="mt-2 text-xs text-red-400">{t("newsletter_err")}</p>}
    </div>
  );
}
