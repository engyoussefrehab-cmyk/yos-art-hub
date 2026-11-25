import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { YRLockup, YRMark } from "@/components/yr-logo";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useCmsMenu, useCmsSettings } from "@/hooks/use-cms-data";
import type { studioSurface } from "@/lib/studio-pages";
import contact from "@/content/contact.json";

/* Shared frame for the redesigned pages (ivory / wine / brand red):
   header with the YR lockup, mobile menu, contact footer, WhatsApp button,
   scroll-in reveal and the base styles. Each page adds its own CSS. */

export const WA = contact.whatsapp_url;
export const EMAIL = contact.cta_email;
export const AR = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

type MenuLink = { href: string; label: string; newTab?: boolean };
const toolsLink: MenuLink = { href: "/tools", label: "الأدوات" };
const headerLinks: MenuLink[] = [
  { href: "/projects", label: "الأعمال" },
  { href: "/#studio", label: "الاستوديو" },
  { href: "/insights", label: "المقالات" },
  toolsLink,
  { href: "/contact", label: "تواصل" },
];
const footerLinks: MenuLink[] = [
  { href: "/projects", label: "الأعمال" },
  { href: "/#services", label: "الخدمات" },
  toolsLink,
];

function useStudioMenu(location: string, defaults: MenuLink[]) {
  const configured = useCmsMenu(location);
  if (!configured.length) return defaults;
  const links: MenuLink[] = [];
  const seen = new Set<string>();
  for (const item of configured) {
    const href = item.url.replace(/\/$/, "") || "/";
    if (seen.has(href)) continue;
    seen.add(href);
    links.push(href === toolsLink.href ? toolsLink : {
      href: item.url,
      label: item.label_ar,
      newTab: item.open_in_new_tab,
    });
  }
  if (!seen.has(toolsLink.href)) links.push(toolsLink);
  return links;
}

export function StudioPage({ children, pathname, surface }: {
  children: ReactNode;
  pathname: string;
  surface: ReturnType<typeof studioSurface>;
}) {
  const links = useStudioMenu("footer_primary", footerLinks);
  const socials = useCmsSettings()?.socials;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="yrh" dir="rtl" lang="ar">
      <a className="studio-skip" href="#main-content" inert={menuOpen}>انتقل إلى المحتوى</a>
      <Header pathname={pathname} open={menuOpen} setOpen={setMenuOpen} showBackToTop={surface !== "custom"} />
      <main
        id="main-content"
        tabIndex={-1}
        inert={menuOpen}
        className={surface === "custom" ? undefined : `studio-content ${surface}`}
      >
        {children}
      </main>
      <footer className="contact g" id="contact" inert={menuOpen}>
        <div className="lbl rv">
          <h2>مشروع جديد؟</h2>
          <span>واتساب أو البريد الإلكتروني</span>
        </div>
        <a className="big rv" href={WA} target="_blank" rel="noopener noreferrer">
          لنعمل معًا <i aria-hidden="true">↖</i>
        </a>
        <div className="fcols">
          <div>
            <b>مشاريع جديدة</b>
            <a className="ul" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a className="ul" href={`tel:${contact.phone_e164}`} dir="ltr">{contact.phone_display}</a>
          </div>
          <div>
            <b>الاستوديو</b>
            نعمل مع عملاء في السعودية والخليج ومصر
          </div>
          <div>
            <b>تابعنا</b>
            <a className="ul" href={contact.instagram_url} target="_blank" rel="noopener noreferrer">إنستجرام</a>
            <a className="ul" href={contact.tiktok_url} target="_blank" rel="noopener noreferrer">تيك توك</a>
            <a className="ul" href={contact.youtube_url} target="_blank" rel="noopener noreferrer">يوتيوب</a>
            <a className="ul" href={socials?.linkedin || contact.linkedin_url} target="_blank" rel="noopener noreferrer">لينكدإن</a>
            {socials?.behance && <a className="ul" href={socials.behance} target="_blank" rel="noopener noreferrer">Behance</a>}
          </div>
          <div>
            <b>الموقع</b>
            {links.map((item) => <MenuAnchor key={item.href} item={item} className="ul" />)}
          </div>
        </div>
        {surface !== "custom" && <NewsletterForm />}
        <div className="fbot">
          <span className="fmk">
            <YRMark className="fm" />
            <span dir="ltr">YR<b>.</b>Studio</span> — © ٢٠٢٦ يوسف رحاب
          </span>
          <span>جميع الحقوق محفوظة</span>
        </div>
      </footer>
      <a className="wa" href={WA} target="_blank" rel="noopener noreferrer" aria-label="تواصل على واتساب" inert={menuOpen}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
        </svg>
      </a>
      <Reveal pathname={pathname} />
    </div>
  );
}

function MenuAnchor({ item, className, current, onClick }: {
  item: MenuLink;
  className?: string;
  current?: "page" | "location";
  onClick?: () => void;
}) {
  return (
    <a
      className={className}
      href={item.href}
      target={item.newTab ? "_blank" : undefined}
      rel={item.newTab ? "noopener noreferrer" : undefined}
      aria-current={current}
      onClick={onClick}
    >
      {item.label}
    </a>
  );
}

function Header({ pathname, open, setOpen, showBackToTop }: {
  pathname: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  showBackToTop: boolean;
}) {
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);
  const [farFromTop, setFarFromTop] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const links = useStudioMenu("header", headerLinks);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHide(y > last && y > 300);
      setFarFromTop(y > 400);
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    const desktop = window.matchMedia("(min-width: 1001px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    window.addEventListener("keydown", closeMenu);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeMenu);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, setOpen]);
  const close = () => setOpen(false);
  const location = pathname.replace(/\/$/, "") || "/";
  function current(href: string) {
    if (href === location) return "page";
    if (href.startsWith("/") && href !== "/" && location.startsWith(`${href}/`)) return "location";
    return undefined;
  }
  return (
    <>
      <header className={`g hd${solid ? " solid" : ""}${hide && !open ? " hide" : ""}`}>
        <Link className="logo" to="/" aria-label="يوسف رحاب، مصمم هويات بصرية" onClick={close}>
          <YRLockup className="lk" />
        </Link>
        <nav aria-label="الرئيسية">
          {links.map((item) => <MenuAnchor key={item.href} item={item} className="ul nl" current={current(item.href)} />)}
          <button ref={menuButton} className="menu" type="button" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
            {open ? "إغلاق" : "القائمة"}
          </button>
        </nav>
      </header>
      <nav className="mnav" id="mnav" aria-label="قائمة الموقع" hidden={!open}>
        {links.map((item) => <MenuAnchor key={item.href} item={item} current={current(item.href)} onClick={close} />)}
        <div className="mfoot">
          <a href={WA} dir="ltr" target="_blank" rel="noopener noreferrer">{contact.phone_display}</a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </nav>
      {showBackToTop && farFromTop && !open && (
        <button className="studio-top" type="button" aria-label="العودة للأعلى" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>↑</button>
      )}
    </>
  );
}

/* Fade sections in as they scroll into view. Content stays visible without script. */
function Reveal({ pathname }: { pathname: string }) {
  useEffect(() => {
    const root = document.querySelector(".yrh");
    if (!root || !("IntersectionObserver" in window)) return;
    root.classList.add("js");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
