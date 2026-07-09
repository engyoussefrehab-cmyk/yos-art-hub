import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logoFull from "@/assets/logo-full.png.asset.json";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">حدث خطأ ما</h1>
        <p className="mt-2 text-sm text-muted-foreground">يمكنك إعادة المحاولة أو العودة للرئيسية.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >إعادة المحاولة</button>
          <a href="/" className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground">الرئيسية</a>
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
      { title: "يوسف رحاب — مصمم هوية بصرية" },
      { name: "description", content: "يوسف رحاب — مصمم هوية بصرية استراتيجي بخبرة 8+ سنوات. أكثر من 250 علامة تجارية في الخليج ومصر." },
      { name: "author", content: "Youssef Rehab" },
      { property: "og:title", content: "يوسف رحاب — مصمم هوية بصرية" },
      { property: "og:description", content: "8+ سنوات خبرة في تصميم الهويات البصرية والشعارات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteNav />
        <main className="flex-1"><Outlet /></main>
        <SiteFooter />
        <WhatsAppFab />
      </div>
    </QueryClientProvider>
  );
}

function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/201030365405"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="واتساب"
      className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 focus:outline-none"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden="true" />
      <svg viewBox="0 0 32 32" className="relative h-8 w-8" aria-hidden="true">
        <path
          fill="#ffffff"
          d="M16.003 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.55-1.71a12.77 12.77 0 0 0 6.25 1.6h.01c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.06-3.64Zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.39a10.62 10.62 0 0 1-1.63-5.68c0-5.87 4.78-10.65 10.65-10.65 2.85 0 5.52 1.11 7.53 3.12a10.58 10.58 0 0 1 3.12 7.53c0 5.87-4.78 10.65-10.65 10.65Zm5.84-7.98c-.32-.16-1.9-.94-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55-.19-.01-.4-.01-.61-.01-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.29 3.29.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>
    </a>
  );
}

function SiteNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "الرئيسية" },
    { to: "/projects", label: "المشاريع" },
    { to: "/contact", label: "تواصل" },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)} aria-label="يوسف رحاب">
          <img src={logoFull.url} alt="يوسف رحاب" className="h-8 w-auto md:h-9" style={{ filter: "brightness(0)" }} />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground font-semibold" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="text-sm transition-colors hover:text-foreground"
            >{l.label}</Link>
          ))}
        </nav>
        <Link to="/contact" className="hidden md:inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">ابدأ مشروعك</Link>
        <button className="md:hidden rounded-md border border-border p-2" onClick={() => setOpen(v => !v)} aria-label="القائمة">
          <span className="block h-0.5 w-5 bg-foreground mb-1" />
          <span className="block h-0.5 w-5 bg-foreground mb-1" />
          <span className="block h-0.5 w-5 bg-foreground" />
        </button>
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
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-ink text-white/70 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-12">
        <div className="md:col-span-5 space-y-5">
          <Link to="/" className="inline-flex items-center" aria-label="يوسف رحاب">
            <img src={logoFull.url} alt="يوسف رحاب" className="h-10 w-auto invert" />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">
            مصمم هوية بصرية استراتيجي، أُحوّل أفكار العلامات إلى أنظمة بصرية جريئة وخالدة تتحدث بوضوح في أسواق تنافسية.
          </p>
          <NewsletterForm />
        </div>
        <div className="md:col-span-3">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">استكشف</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-accent transition-colors">الرئيسية</Link></li>
            <li><Link to="/projects" className="hover:text-accent transition-colors">المشاريع</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-colors">تواصل</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">تواصل</div>
          <ul className="space-y-2 text-sm">
            <li><a href="tel:+201030365405" className="hover:text-accent transition-colors" dir="ltr">+20 103 036 5405</a></li>
            <li><a href="mailto:youssefrehab@yrstudio.art" className="hover:text-accent transition-colors">youssefrehab@yrstudio.art</a></li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/youssef-rehab/"
              target="_blank" rel="noopener noreferrer" aria-label="لينكدإن"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 md:flex-row">
          <div className="text-xs text-white/50">© {year} يوسف رحاب® — جميع الحقوق محفوظة</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Designed & Built with care</div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [hp, setHp] = useState("");
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hp) return; // honeypot filled → bot
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
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">النشرة البريدية</div>
      <p className="mb-3 text-sm text-white/60">اشترك لتصلك آخر المشاريع والدروس الإبداعية.</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <input
          type="text" tabIndex={-1} autoComplete="off" value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden" aria-hidden="true"
        />
        <input
          type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="بريدك الإلكتروني" dir="ltr"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
        />
        <button type="submit" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">
          اشترك
        </button>
      </form>
      {status === "ok" && <p className="mt-2 text-xs text-accent">تم الاشتراك بنجاح ✓</p>}
      {status === "error" && <p className="mt-2 text-xs text-red-400">بريد إلكتروني غير صحيح</p>}
    </div>
  );
}
