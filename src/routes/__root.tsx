import { StudioPage } from "@/components/studio-site";
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
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import studioCss from "@/components/studio-site.css?url";
import { useLang, detectLang } from "@/i18n/use-lang";
import { Toaster } from "@/components/ui/sonner";
import { isAdminPath, isStandalonePath, studioSurface, STUDIO_FONTS, STUDIO_FONT_PRELOAD } from "@/lib/studio-pages";

import seo from "@/content/seo.json";
import contact from "@/content/contact.json";
import analytics from "@/content/analytics.json";
export function NotFoundComponent() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const home ="/";
  const projects ="/projects";
  const contact ="/contact";
  const arrow = isAr ? "←" : "→";
  return (
    <div className="px-3 pt-3 sm:px-6" dir={isAr ? "rtl" : "ltr"}>
    <div className="mx-auto flex min-h-[65svh] max-w-[1400px] items-center justify-center rounded-xl border border-border bg-card px-6 py-14 md:py-20">

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
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-110"
          >
            {t("nf_back")}
            <span className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">{arrow}</span>
          </Link>
          <a
            href={projects}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/60 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            {t("nf_explore_projects")}
          </a>
          <Link
            to={contact}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nf_contact")}
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
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
      { rel: "stylesheet", href: studioCss },
      STUDIO_FONTS,
      ...STUDIO_FONT_PRELOAD,
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
  const admin = isAdminPath(pathname);
  const scheme = admin ? "dark" : "only light";
  return (
    <html lang={lang} dir={dir} className={admin ? "dark" : "studio-light"} style={{ colorScheme: scheme }}>
      <head>
        <meta name="color-scheme" content={scheme} />
        <meta name="theme-color" content={admin ? "#161616" : "#f3efe7"} />
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = isAdminPath(pathname);
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

  const content = isStandalonePath(pathname) ? <Outlet /> : (
    <StudioPage pathname={pathname} surface={studioSurface(pathname)}>
      <Outlet />
    </StudioPage>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {!isAdmin && <LangSync />}
      <Toaster position="top-center" richColors closeButton />
      {content}
    </QueryClientProvider>
  );
}
