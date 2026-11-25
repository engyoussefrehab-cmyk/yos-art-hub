import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { YRLockup, YRMark } from "@/components/yr-logo";
import contact from "@/content/contact.json";

/* Shared frame for the redesigned pages (ivory / wine / brand red):
   header with the YR lockup, mobile menu, contact footer, WhatsApp button,
   scroll-in reveal and the base styles. Each page adds its own CSS. */

export const WA = contact.whatsapp_url;
export const EMAIL = contact.cta_email;
export const AR = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export function StudioPage({ children, active }: { children: ReactNode; active?: "work" }) {
  return (
    <div className="yrh" dir="rtl" lang="ar">
      <style dangerouslySetInnerHTML={{ __html: SITE_CSS }} />
      <Header active={active} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="contact g" id="contact">
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
            <a className="ul" href={WA} dir="ltr" target="_blank" rel="noopener noreferrer">{contact.phone_display}</a>
          </div>
          <div>
            <b>الاستوديو</b>
            نعمل مع عملاء في السعودية والخليج ومصر
          </div>
          <div>
            <b>تابعنا</b>
            <a className="ul" href={contact.linkedin_url} target="_blank" rel="noopener noreferrer">لينكدإن</a>
          </div>
          <div>
            <b>الموقع</b>
            <a className="ul" href="/projects">الأعمال</a>
            <Link className="ul" to="/packages">الباقات</Link>
            <Link className="ul" to="/tools">الأدوات</Link>
          </div>
        </div>
        <div className="fbot">
          <span className="fmk">
            <YRMark className="fm" />
            <span dir="ltr">YR<b>.</b>Studio</span> — © ٢٠٢٦ يوسف رحاب
          </span>
          <span>جميع الحقوق محفوظة</span>
        </div>
      </footer>
      <a className="wa" href={WA} target="_blank" rel="noopener noreferrer" aria-label="تواصل على واتساب">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" />
        </svg>
      </a>
      <Reveal />
    </div>
  );
}

function Header({ active }: { active?: "work" }) {
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHide(y > last && y > 300);
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <>
      <header className={`g hd${solid ? " solid" : ""}${hide && !open ? " hide" : ""}`}>
        <Link className="logo" to="/" aria-label="يوسف رحاب، مصمم هويات بصرية">
          <YRLockup className="lk" />
        </Link>
        <nav aria-label="الرئيسية">
          <a className="ul nl" href="/projects">الأعمال</a>
          <a className="ul nl" href="/#studio">الاستوديو</a>
          <Link className="ul nl" to="/insights">المقالات</Link>
          <Link className="ul nl" to="/contact">تواصل</Link>
          <button className="menu" type="button" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
            {open ? "إغلاق" : "القائمة"}
          </button>
        </nav>
      </header>
      <div className="mnav" id="mnav" hidden={!open}>
        <a href="/projects" onClick={close}>الأعمال</a>
        <a href="/#studio" onClick={close}>الاستوديو</a>
        <Link to="/insights" onClick={close}>المقالات</Link>
        <Link to="/contact" onClick={close}>تواصل</Link>
        <div className="mfoot">
          <a href={WA} dir="ltr" target="_blank" rel="noopener noreferrer">{contact.phone_display}</a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </div>
    </>
  );
}

/* Fade sections in as they scroll into view. Content stays visible without script. */
function Reveal() {
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
  }, []);
  return null;
}

const SITE_CSS = `
@font-face{font-family:"YR Display";font-weight:400;font-display:swap;src:local("Thmanyah Serif Display Regular"),local("ThmanyahSerifDisplay-Regular"),local("thmanyahserifdisplay-Regular")}
@font-face{font-family:"YR Display";font-weight:500;font-display:swap;src:local("Thmanyah Serif Display Medium"),local("ThmanyahSerifDisplay-Medium"),local("thmanyahserifdisplay-Medium")}
@font-face{font-family:"YR Display";font-weight:700;font-display:swap;src:local("Thmanyah Serif Display Bold"),local("ThmanyahSerifDisplay-Bold"),local("thmanyahserifdisplay-Bold")}
html:has(.yrh),body:has(.yrh){background:#F3EFE7}
.yrh{--bg:#F3EFE7;--bg-2:#EAE3D7;--ink:#3B1A1E;--ink-2:#5A3B3D;--muted:#7A625F;--red:#FF4848;--acc:#E63B3B;--acc-text:#C8292B;--acc-ink:#3B1A1E;--line:rgba(59,26,30,.15);
  --display:"YR Display","Markazi Text","Amiri",serif;--sans:"Almarai",system-ui,sans-serif;--gut:clamp(16px,3.4vw,48px);
  background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.8;-webkit-font-smoothing:antialiased;overflow-x:clip;min-height:100vh;color-scheme:light}
.yrh *{box-sizing:border-box}
.yrh a{color:inherit;text-decoration:none}
.yrh img{display:block;max-width:100%}
.yrh button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.yrh h1,.yrh h2,.yrh h3,.yrh p,.yrh blockquote,.yrh figure{margin:0}
.yrh .g{padding-inline:var(--gut)}
.yrh :focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:4px}
.yrh .lbl{font-size:15px;color:var(--muted);display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.yrh .lbl h2{font-family:var(--sans);font-size:15px;font-weight:700;color:var(--ink);line-height:1.6}
.yrh .lbl a{display:inline-block;padding-block:10px}
.yrh .lbl a:hover{color:var(--acc-text)}
.yrh .ul{background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .35s}
.yrh .ul:hover{background-size:100% 1px}
.yrh .hd{position:fixed;top:0;inset-inline:0;z-index:45;display:flex;justify-content:space-between;align-items:center;height:72px;transition:background .4s,transform .4s}
.yrh .hd.solid{background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.yrh .hd.hide{transform:translateY(-100%)}
.yrh .logo{display:flex;align-items:center;color:var(--ink)}
.yrh .logo .lk{height:46px;width:auto;display:block}
.yrh .logo .yr-mark{transition:fill .3s}
.yrh .logo:hover .yr-mark{fill:var(--red)}
.yrh .hd nav{display:flex;gap:28px;font-size:15px;align-items:center}
.yrh .hd nav .nl{color:var(--ink-2)}
.yrh .hd nav .nl:hover{color:var(--ink)}
.yrh .menu{display:none;font-weight:700;min-height:44px;padding:0 6px}
.yrh .mnav{position:fixed;inset:0;z-index:35;background:var(--bg);padding:110px var(--gut) 40px;display:flex;flex-direction:column;gap:6px}
.yrh .mnav[hidden]{display:none}
.yrh .mnav>a{font-family:var(--display);font-weight:700;font-size:44px;line-height:1.35;border-bottom:1px solid var(--line);padding-bottom:6px}
.yrh .mfoot{margin-top:auto;display:flex;flex-direction:column;gap:6px;color:var(--ink-2)}
.yrh .pill{display:inline-flex;align-items:center;gap:10px;height:54px;padding:0 28px;border-radius:999px;border:1px solid var(--line);font-weight:700;font-size:15px;transition:all .3s;white-space:nowrap}
.yrh .pill:hover{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.yrh .contact{padding-top:clamp(120px,13vw,200px)}
.yrh .big{display:block;font-family:var(--display);font-weight:700;font-size:clamp(64px,13vw,220px);line-height:1;letter-spacing:-.03em;padding-bottom:.12em;transition:color .3s}
.yrh .big:hover{color:var(--acc)}
.yrh .big i{font-style:normal;display:inline-block;transition:transform .4s}
.yrh .big:hover i{transform:translate(-10px,-10px)}
.yrh .fcols{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:36px 0;border-top:1px solid var(--line);margin-top:clamp(28px,3vw,44px);font-size:15px}
.yrh .fcols b{display:block;font-size:14px;color:var(--muted);font-weight:400;margin-bottom:8px}
.yrh .fcols a{display:block;width:fit-content;padding-block:7px}
.yrh .fbot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:20px 0 32px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
.yrh .fmk{display:inline-flex;align-items:center;gap:10px}
.yrh .fmk .fm{width:26px;height:auto;color:var(--ink)}
.yrh .fmk b{color:var(--red)}
.yrh .wa{position:fixed;right:18px;bottom:18px;z-index:55;width:56px;height:56px;border-radius:50%;background:var(--red);color:var(--acc-ink);display:grid;place-items:center;box-shadow:0 10px 26px rgba(59,26,30,.28);transition:transform .25s}
.yrh .wa:hover{transform:scale(1.08)}
.yrh .wa svg{width:28px;height:28px}
.yrh.js .rv{opacity:0;transform:translateY(28px);transition:opacity 1s ease,transform 1s cubic-bezier(.2,.7,.2,1)}
.yrh.js .rv.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){
  .yrh.js .rv{opacity:1;transform:none;transition:none}
}
@media (max-width:1000px){
  .yrh .hd nav .nl{display:none}
  .yrh .menu{display:block}
  .yrh .fcols{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .yrh{font-size:16px}
  .yrh .logo .lk{height:38px}
  .yrh .wa{width:52px;height:52px}
}
.yrh .hd nav .nl[aria-current="page"]{color:var(--ink);background-size:100% 1px}
`;
