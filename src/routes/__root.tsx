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
        <h1 className="font-display text-7xl font-black text-foreground">404</h1>
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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap" },
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
      rel="noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 ring-1 ring-white/10 transition-transform hover:-translate-y-0.5 focus:outline-none"
    >
      <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-70 animate-ping" aria-hidden="true" />
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M19.11 17.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM16.01 4C9.39 4 4 9.39 4 16c0 2.12.55 4.17 1.61 5.99L4 28l6.19-1.62A11.94 11.94 0 0 0 16.01 28c6.62 0 12-5.39 12-12s-5.39-12-12-12zm0 21.83c-1.86 0-3.68-.5-5.27-1.44l-.38-.22-3.67.96.98-3.58-.25-.37A9.83 9.83 0 0 1 6.18 16c0-5.42 4.41-9.83 9.83-9.83 5.42 0 9.83 4.41 9.83 9.83 0 5.42-4.41 9.83-9.83 9.83z" />
      </svg>
      <span className="hidden sm:inline text-sm font-semibold">واتساب</span>
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
          <img src={logoFull.url} alt="يوسف رحاب" className="h-8 w-auto md:h-9 [filter:brightness(0)_saturate(100%)_invert(12%)_sepia(8%)_saturate(600%)_hue-rotate(15deg)]" />
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
            <li><a href="https://wa.me/201030365405" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors" dir="ltr">+20 103 036 5405</a></li>
            <li><a href="tel:+201030365405" className="hover:text-accent transition-colors" dir="ltr">01030365405</a></li>
            <li><a href="mailto:youssefrehab@yrstudio.art" className="hover:text-accent transition-colors">youssefrehab@yrstudio.art</a></li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/youssef-rehab/"
              target="_blank" rel="noreferrer" aria-label="لينكدإن"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
            </a>
            <a
              href="https://www.behance.net/youssefrehab"
              target="_blank" rel="noreferrer" aria-label="بيهانس"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M9.5 6.5c1.4 0 2.6.3 3.4.9.8.6 1.2 1.5 1.2 2.7 0 .7-.2 1.3-.5 1.8-.3.5-.8.9-1.5 1.2 1 .3 1.7.7 2.2 1.4.5.6.7 1.4.7 2.4 0 .8-.1 1.5-.4 2.1-.3.6-.7 1.1-1.3 1.5-.5.4-1.2.7-1.9.9-.7.2-1.5.3-2.4.3H0V6.5h9.5zM9 11.4c.7 0 1.2-.2 1.6-.5.4-.3.6-.8.6-1.5 0-.4-.1-.7-.2-1-.1-.2-.3-.4-.6-.6-.2-.1-.5-.2-.8-.3-.3-.1-.6-.1-1-.1H3.6v4h5.4zm.3 7.5c.4 0 .8 0 1.1-.1.3-.1.6-.2.9-.4.3-.2.5-.4.6-.7.2-.3.2-.7.2-1.1 0-.9-.2-1.5-.7-1.9-.5-.4-1.2-.6-2-.6H3.6v4.8h5.7zm10.8-1.1c.5.5 1.2.7 2.1.7.7 0 1.2-.2 1.7-.5.5-.3.8-.7.9-1h2.9c-.5 1.4-1.2 2.5-2.1 3.1-1 .6-2.1.9-3.5.9-.9 0-1.8-.1-2.5-.4-.7-.3-1.4-.7-1.9-1.2s-.9-1.1-1.2-1.9c-.3-.7-.4-1.5-.4-2.4 0-.8.1-1.6.4-2.4.3-.7.7-1.4 1.2-1.9.5-.6 1.2-1 1.9-1.3.7-.3 1.6-.5 2.5-.5 1 0 1.9.2 2.7.6.7.4 1.4.9 1.8 1.6.5.7.8 1.4 1.1 2.3.1.9.2 1.8.1 2.7h-8.4c.1 1 .4 1.8.9 2.2zM22.2 12c-.4-.5-1.1-.7-1.9-.7-.5 0-1 .1-1.3.3-.4.2-.7.4-.9.7-.2.3-.4.5-.5.9-.1.3-.1.6-.2.9h5c0-.9-.3-1.6-.7-2.1H22.2zm-6.4-3.9h6.3V6.6h-6.3v1.5z"/></svg>
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
