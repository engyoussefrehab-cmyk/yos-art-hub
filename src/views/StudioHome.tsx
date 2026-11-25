import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { YRLockup, YRMark } from "@/components/yr-logo";
import clientLogos from "@/data/snapshot/client_logos.json";
import { testimonials as staticTestimonials, testimonialStats } from "@/lib/testimonials";
import { fetchLiveReviews, type LiveReview } from "@/lib/reviews";
import contact from "@/content/contact.json";

/* Arabic homepage, studio layout: one statement, a 5-project slider, the studio line,
   client logos, client reviews, latest articles, contact. Ivory / wine / brand red. */

const WA = contact.whatsapp_url;
const EMAIL = contact.cta_email;

const WORKS = [
  { img: "/portfolio/nook-cafe/01.webp", name: "Nook Café", desc: "مقهى مختص في الرياض", meta: "هوية بصرية، ٢٠٢٦", to: "/projects/branding/nook-cafe" },
  { img: "/portfolio/sinosynq/02.webp", name: "SinoSynq", desc: "تجارة دولية", meta: "هوية بصرية", to: "/projects/branding/sinosynq" },
  { img: "/portfolio/amn-global-law-firm/01.webp", name: "AMN للمحاماة", desc: "مكتب محاماة سعودي", meta: "هوية ودليل، ٢٠٢٤", to: "/projects/branding/amn-global-law-firm" },
  { img: "/portfolio/rakeeb/01.webp", name: "ركيب", desc: "التراث على الطريق", meta: "هوية بصرية", to: "/projects/branding/rakeeb" },
  { img: "/portfolio/muwajada/01.webp", name: "مواجدة", desc: "مركز استشارات نفسية", meta: "هوية بصرية، ٢٠٢٥", to: "/projects/branding/muwajada" },
];

const POSTS = [
  { title: "ملفات تسليم الشعار: ماذا يستلم العميل، وفيمَ تُستخدم كل صيغة", to: "/insights/resources/logo-delivery-files-guide" },
  { title: "ردود جاهزة للعميل: أكثر من ١٠٠ موقف ورد للمصمم", to: "/insights/resources/client-replies-guide" },
  { title: "نظام ترتيب المجلدات للمصممين: أي ملف تجده في ١٠ ثوانٍ", to: "/insights/resources/folder-organization-system" },
];

/* Client logos come from the dashboard (العملاء). Width/height ratio of each trimmed logo
   file keeps their sizes balanced; a new logo falls back to 2.8. */
const LOGO_RATIO: Record<string, number> = {
 "/media/uploads/2026/10/clients/mewa.svg": 4.04,
 "/media/uploads/2026/10/clients/logo-01.svg": 3.02,
 "/media/uploads/2026/10/clients/logo-02.svg": 2.28,
 "/media/uploads/2026/10/clients/logo-03.svg": 1.68,
 "/media/uploads/2026/10/clients/logo-04.svg": 2.51,
 "/media/uploads/2026/10/clients/logo-05.svg": 4.29,
 "/media/uploads/2026/10/clients/logo-06.svg": 5.14,
 "/media/uploads/2026/10/clients/logo-07.svg": 1.95,
 "/media/uploads/2026/10/clients/logo-08.svg": 3.12,
 "/media/uploads/2026/10/clients/logo-09.svg": 4.14,
 "/media/uploads/2026/10/clients/logo-10.svg": 3.28,
 "/media/uploads/2026/10/clients/logo-11.svg": 2.16,
 "/media/uploads/2026/10/clients/logo-12.svg": 2.33,
 "/media/uploads/2026/10/clients/logo-13.svg": 2.79,
 "/media/uploads/2026/10/clients/logo-14.svg": 2.66,
 "/media/uploads/2026/10/clients/logo-15.svg": 1.44,
 "/media/uploads/2026/10/clients/logo-16.svg": 2.95,
 "/media/uploads/2026/10/clients/logo-17.svg": 2.95,
 "/media/uploads/2026/10/clients/logo-18.svg": 3.51,
 "/media/uploads/2026/10/clients/logo-19.svg": 2.05,
 "/media/uploads/2026/10/clients/logo-20.svg": 2.9
};
const CLIENT_LOGOS = (clientLogos as { name: string; logo_url: string | null; is_visible: boolean; sort_order: number }[])
  .filter((l) => l.is_visible && l.logo_url)
  .sort((a, b) => a.sort_order - b.sort_order)
  .map((l) => ({ file: l.logo_url as string, name: l.name, ratio: LOGO_RATIO[l.logo_url as string] ?? 2.8 }));

const CAPS = ["هوية بصرية", "شعارات", "أدلة الهوية", "ملفات تعريفية", "عروض تقديمية", "تغليف"];

const AR = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const isLatin = (s: string) => !/[؀-ۿ]/.test(s);

type Review = { quote: string; name: string; project: string; source: "mostaql" | "site" };

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return reduce;
}

export function StudioHome() {
  const reduce = usePrefersReducedMotion();
  return (
    <div className="yrh" dir="rtl" lang="ar">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className="hero g">
          <h1 className="rv">
            هويات بصرية
            <br />
            لعلامات <em>طموحة.</em>
          </h1>
          <div className="hero-foot rv">
            <p>استوديو يوسف رحاب لتصميم الهويات البصرية والملفات التعريفية، للشركات في السعودية والخليج ومصر.</p>
            <a className="ul" href="#work">مختارات من الأعمال ↓</a>
          </div>
        </section>
        <WorkSlider reduce={reduce} />
        <section className="studio g" id="studio">
          <div className="lbl rv">
            <h2>الاستوديو</h2>
            <span>منذ ٢٠١٨</span>
          </div>
          <p className="studio-txt rv">نبني لكل علامة لغة بصرية تشبهها، ولا تشبه غيرها.</p>
          <div className="studio-row rv">
            <div className="caps">
              {CAPS.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <Link className="ul" to="/packages">الخدمات والباقات ←</Link>
          </div>
        </section>
        <Clients />
        <Reviews reduce={reduce} />
        <section className="latest g" id="latest">
          <div className="lbl rv">
            <h2>أحدث المقالات</h2>
            <Link className="ul" to="/insights">كل المقالات</Link>
          </div>
          {POSTS.map((p) => (
            <a className="post rv" href={p.to} key={p.to}>
              <time>أكتوبر ٢٠٢٦</time>
              <h3>{p.title}</h3>
              <span className="ar" aria-hidden="true">←</span>
            </a>
          ))}
        </section>
      </main>
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

function Header() {
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
          <a className="ul nl" href="#studio">الاستوديو</a>
          <Link className="ul nl" to="/insights">المقالات</Link>
          <Link className="ul nl" to="/contact">تواصل</Link>
          <button className="menu" type="button" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
            {open ? "إغلاق" : "القائمة"}
          </button>
        </nav>
      </header>
      <div className="mnav" id="mnav" hidden={!open}>
        <a href="/projects" onClick={close}>الأعمال</a>
        <a href="#studio" onClick={close}>الاستوديو</a>
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

function WorkSlider({ reduce }: { reduce: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const moved = useRef(false);

  const step = () => {
    const t = track.current;
    if (!t || !t.children[0]) return 0;
    const gap = parseFloat(getComputedStyle(t).columnGap) || 20;
    return (t.children[0] as HTMLElement).getBoundingClientRect().width + gap;
  };
  const update = () => {
    const t = track.current;
    if (!t) return;
    const x = Math.abs(t.scrollLeft);
    const max = t.scrollWidth - t.clientWidth;
    const s = step() || 1;
    setIdx(x > max - 4 ? WORKS.length : Math.min(WORKS.length, Math.round(x / s) + 1));
    setAtStart(x < 4);
    setAtEnd(x > max - 4);
  };
  useEffect(() => {
    update();
    const t = track.current;
    t?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !t) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 5) {
        d.moved = true;
        moved.current = true;
        t.classList.add("drag");
      }
      if (d.moved) t.scrollLeft = d.left - dx;
    };
    const up = () => {
      const d = drag.current;
      drag.current = null;
      if (!d?.moved || !t) return;
      t.classList.remove("drag");
      const s = step();
      t.scrollTo({ left: Math.round(t.scrollLeft / s) * s, behavior: "smooth" });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      t?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  // RTL: moving to the next slide scrolls toward negative scrollLeft.
  const go = (dir: 1 | -1) => track.current?.scrollBy({ left: -dir * step(), behavior: reduce ? "auto" : "smooth" });

  return (
    <section className="work g" id="work">
      <div className="lbl rv">
        <h2>أعمال مختارة</h2>
        <div className="sctl">
          <span className="scount" aria-live="polite">{AR(idx)} / {AR(WORKS.length)}</span>
          <button type="button" className="arr" aria-label="المشروع السابق" disabled={atStart} onClick={() => go(-1)}>→</button>
          <button type="button" className="arr" aria-label="المشروع التالي" disabled={atEnd} onClick={() => go(1)}>←</button>
        </div>
      </div>
      <div
        className="wtrack rv"
        ref={track}
        tabIndex={0}
        role="region"
        aria-label="أعمال مختارة، اسحب أو استخدم الأسهم"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(-1); }
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
          moved.current = false;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onClickCapture={(e) => {
          if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; }
        }}
      >
        {WORKS.map((w, i) => (
          <a className="ws" href={w.to} key={w.to} draggable={false}>
            <div className="im">
              <img src={w.img} alt={w.name} draggable={false} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
            </div>
            <div className="cap">
              <h3>{w.name}<span>{w.desc}</span></h3>
              <small>{w.meta}</small>
            </div>
          </a>
        ))}
      </div>
      <div className="wfoot rv">
        <div className="wbar" aria-hidden="true"><i style={{ width: `${(idx / WORKS.length) * 100}%` }} /></div>
        <a className="pill" href="/projects">كل الأعمال (+١٠٠) ←</a>
      </div>
    </section>
  );
}

function Clients() {
  const [paused, setPaused] = useState(false);
  const set = (hidden: boolean) => (
    <div className="mset" aria-hidden={hidden || undefined}>
      {CLIENT_LOGOS.map((l) => {
        const h = Math.min(58, 210 / l.ratio);
        return (
          <div className="lg" key={l.file} role={hidden ? undefined : "img"} aria-label={hidden ? undefined : l.name} title={l.name}>
            <i style={{ "--w": `${Math.round(h * l.ratio)}px`, "--h": `${Math.round(h)}px`, "--m": `url("${l.file}")` } as CSSProperties} />
          </div>
        );
      })}
    </div>
  );
  return (
    <section className="clients g">
      <div className="lbl rv">
        <h2>عملاء</h2>
        <button type="button" className="mpp" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? "تشغيل الحركة" : "إيقاف الحركة"}
        </button>
      </div>
      <div className={`marq rv${paused ? " paused" : ""}`}>
        <div className="mtrack">
          {set(false)}
          {set(true)}
        </div>
      </div>
    </section>
  );
}

function Reviews({ reduce }: { reduce: boolean }) {
  const [live, setLive] = useState<LiveReview[]>([]);
  useEffect(() => {
    let alive = true;
    fetchLiveReviews().then((r) => alive && setLive(r));
    return () => { alive = false; };
  }, []);
  const items = useMemo<Review[]>(() => {
    const base: Review[] = staticTestimonials.map((t) => ({ quote: t.quote, name: t.name, project: t.project, source: "mostaql" }));
    const site: Review[] = live.filter((r) => r.quote?.trim()).map((r) => ({ quote: r.quote, name: r.name, project: r.project, source: "site" }));
    // strongest two first, then the reviews left through the site, then the rest
    return [...base.slice(0, 2), ...site, ...base.slice(2)];
  }, [live]);
  const total = testimonialStats.count + live.length;

  const [q, setQ] = useState(0);
  const [show, setShow] = useState(true);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const [minH, setMinH] = useState(0);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const goTo = (n: number) => {
    const next = (n + items.length) % items.length;
    if (reduce) return setQ(next);
    setShow(false);
    window.setTimeout(() => { setQ(next); setShow(true); }, 300);
  };
  useEffect(() => {
    if (!auto || hold || reduce || items.length < 2) return;
    const t = window.setTimeout(() => goTo(q + 1), 9000);
    return () => window.clearTimeout(t);
  }, [q, auto, hold, reduce, items.length]);

  // keep the card at the height of the longest review so the page below doesn't jump
  useEffect(() => {
    const measure = () => {
      const box = measureRef.current;
      if (!box) return;
      let m = 0;
      box.querySelectorAll("blockquote").forEach((b) => { m = Math.max(m, (b as HTMLElement).offsetHeight); });
      setMinH(m);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  const cur = items[q] ?? items[0];
  if (!cur) return null;
  const qClass = (s: string) => `${s.length > 190 ? "long" : ""}`;

  return (
    <section className="voice g" id="voices">
      <div className="lbl rv">
        <h2>آراء العملاء</h2>
        <span className="vrate">
          <b>{AR(testimonialStats.averageRating).replace(".", "٫")}</b>
          <span className="stars" aria-hidden="true">★★★★★</span>
          من {AR(total)} تقييمًا
        </span>
      </div>
      <figure
        className="vcard rv"
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
        onFocus={() => setHold(true)}
        onBlur={() => setHold(false)}
      >
        <div className="vtop">
          <span className="qm" aria-hidden="true">“</span>
          <span className="stars" role="img" aria-label="تقييم ٥ من ٥">★★★★★</span>
        </div>
        <div className="vq-wrap">
          <blockquote
            ref={quoteRef}
            className={qClass(cur.quote)}
            style={{ minHeight: minH || undefined, opacity: show ? 1 : 0 }}
            lang={isLatin(cur.quote) ? "en" : "ar"}
            dir={isLatin(cur.quote) ? "ltr" : "rtl"}
          >
            {cur.quote}
          </blockquote>
          <div className="vmeasure" ref={measureRef} aria-hidden="true">
            {items.map((r, i) => (
              <blockquote key={i} className={qClass(r.quote)} lang={isLatin(r.quote) ? "en" : "ar"}>{r.quote}</blockquote>
            ))}
          </div>
        </div>
        <figcaption className="vwho">
          <div className="who">
            <span className="av" aria-hidden="true">{cur.name.trim()[0]}</span>
            <div>
              <b>{cur.name}</b>
              <small>{cur.project}</small>
            </div>
            <span className="src">{cur.source === "mostaql" ? "✓ تقييم على منصة مستقل" : "✓ تقييم عبر الموقع"}</span>
          </div>
          <div className="vnav">
            <span>{AR(q + 1)} / {AR(items.length)}</span>
            <button type="button" aria-label="الرأي السابق" onClick={() => { setAuto(false); goTo(q - 1); }}>→</button>
            <button type="button" aria-label="الرأي التالي" onClick={() => { setAuto(false); goTo(q + 1); }}>←</button>
          </div>
        </figcaption>
      </figure>
    </section>
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

const CSS = `
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

.yrh .hero{padding-top:clamp(130px,16vw,210px)}
.yrh h1{font-family:var(--display);font-weight:700;font-size:clamp(52px,9.2vw,150px);line-height:1.08;letter-spacing:-.02em}
.yrh h1 em{font-style:normal;color:var(--acc)}
.yrh .hero-foot{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;margin-top:clamp(36px,5vw,64px)}
.yrh .hero-foot p{color:var(--ink-2);max-width:44ch;font-size:clamp(16px,1.3vw,19px)}
.yrh .hero-foot a{font-size:15px;color:var(--muted);display:inline-block;padding-block:10px}

.yrh .work{padding-top:clamp(64px,7vw,110px)}
.yrh .sctl{display:flex;align-items:center;gap:8px}
.yrh .scount{font-family:var(--display);font-size:18px;color:var(--muted);min-width:64px;text-align:center}
.yrh .arr{width:48px;height:48px;border-radius:50%;border:1px solid var(--line);font-size:18px;transition:all .25s}
.yrh .arr:hover:not(:disabled){background:var(--ink);color:var(--bg);border-color:var(--ink)}
.yrh .arr:disabled{opacity:.3;cursor:default}
.yrh .wtrack{display:flex;gap:clamp(14px,1.6vw,24px);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;margin-top:clamp(24px,3vw,36px);margin-inline-end:calc(-1 * var(--gut));padding-inline-end:var(--gut);cursor:grab}
.yrh .wtrack::-webkit-scrollbar{display:none}
.yrh .wtrack.drag{cursor:grabbing;scroll-snap-type:none;user-select:none}
.yrh .ws{flex:0 0 62%;scroll-snap-align:start;display:block}
.yrh .ws .im{overflow:hidden;background:var(--bg-2);aspect-ratio:16/10}
.yrh .ws img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s cubic-bezier(.2,.7,.2,1);-webkit-user-drag:none}
.yrh .ws:hover img{transform:scale(1.03)}
.yrh .cap{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding-top:14px}
.yrh .cap h3{font-family:var(--display);font-weight:700;font-size:clamp(20px,1.7vw,24px);line-height:1.35}
.yrh .cap h3 span{font-family:var(--sans);font-weight:400;font-size:15px;color:var(--muted);margin-inline-start:6px}
.yrh .cap small{font-size:15px;color:var(--muted);white-space:nowrap}
.yrh .wfoot{display:flex;align-items:center;gap:clamp(20px,3vw,40px);margin-top:clamp(28px,3vw,40px)}
.yrh .wbar{flex:1;height:2px;background:var(--line);border-radius:2px;overflow:hidden}
.yrh .wbar i{display:block;height:100%;background:var(--ink);transition:width .3s}
.yrh .pill{display:inline-flex;align-items:center;gap:10px;height:54px;padding:0 28px;border-radius:999px;border:1px solid var(--line);font-weight:700;font-size:15px;transition:all .3s;white-space:nowrap}
.yrh .pill:hover{background:var(--ink);color:var(--bg);border-color:var(--ink)}

.yrh .studio{padding-top:clamp(110px,12vw,190px)}
.yrh .studio-txt{font-family:var(--display);font-weight:500;font-size:min(50px,4.6vw);white-space:nowrap;line-height:1.35;letter-spacing:-.01em;margin-top:clamp(28px,3vw,44px)}
.yrh .studio-row{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;margin-top:clamp(36px,4vw,56px)}
.yrh .studio-row>a{display:inline-block;padding-block:10px}
.yrh .caps{display:flex;flex-wrap:wrap;gap:8px}
.yrh .caps span{border:1px solid var(--line);border-radius:999px;padding:6px 16px;font-size:14px;color:var(--ink-2)}

.yrh .clients{padding-top:clamp(100px,11vw,170px)}
.yrh .mpp{font-size:14px;color:var(--muted);padding:10px 0}
.yrh .mpp:hover{color:var(--ink)}
.yrh .marq{overflow:hidden;border-bottom:1px solid var(--line);-webkit-mask:linear-gradient(to left,transparent,#000 6%,#000 94%,transparent);mask:linear-gradient(to left,transparent,#000 6%,#000 94%,transparent)}
.yrh .mtrack{display:flex;width:max-content;animation:yrh-marq 60s linear infinite}
.yrh .marq:hover .mtrack,.yrh .marq.paused .mtrack{animation-play-state:paused}
.yrh .mset{display:flex}
@keyframes yrh-marq{to{transform:translateX(50%)}}
.yrh .lg{flex:0 0 auto;display:grid;place-items:center;height:150px;padding:0 clamp(28px,3.4vw,52px)}
.yrh .lg i{display:block;width:var(--w);height:var(--h);background:var(--ink);-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;opacity:.82;transition:opacity .3s,background .3s}
.yrh .lg:hover i{opacity:1;background:var(--acc)}

.yrh .voice{padding-top:clamp(100px,11vw,170px)}
.yrh .vrate{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--muted)}
.yrh .vrate b{font-family:var(--display);font-size:24px;line-height:1;color:var(--ink)}
.yrh .stars{color:var(--red);letter-spacing:3px;font-size:16px}
.yrh .vcard{margin-top:clamp(28px,3vw,44px);background:var(--bg-2);border-radius:28px;padding:clamp(28px,4.4vw,64px)}
.yrh .vtop{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
.yrh .qm{font-family:var(--display);font-weight:700;font-size:clamp(110px,11vw,170px);line-height:1;height:.5em;color:var(--red);display:block;margin-top:-.08em}
.yrh .vq-wrap{position:relative}
.yrh blockquote{font-family:var(--display);font-weight:500;font-size:clamp(22px,2.5vw,38px);line-height:1.55;max-width:38ch;margin-top:clamp(16px,2vw,28px);transition:opacity .3s}
.yrh blockquote.long{font-size:clamp(19px,2vw,30px);max-width:46ch}
.yrh blockquote[lang="en"]{font-family:var(--sans);font-weight:400;text-align:left}
.yrh .vmeasure{position:absolute;inset:0 0 auto;visibility:hidden;pointer-events:none;height:0;overflow:hidden}
.yrh .vmeasure blockquote{position:absolute;inset-inline:0;top:0}
.yrh .vwho{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;margin-top:clamp(24px,3vw,40px);padding-top:clamp(20px,2.4vw,28px);border-top:1px solid var(--line)}
.yrh .who{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.yrh .av{width:54px;height:54px;border-radius:50%;background:var(--ink);color:var(--bg);display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:24px;flex:none}
.yrh .who b{display:block;font-weight:700;font-size:17px}
.yrh .who small{display:block;color:var(--muted);font-size:14px}
.yrh .src{font-size:13px;color:var(--acc-text);border:1px solid color-mix(in srgb,var(--acc-text) 45%,transparent);border-radius:999px;padding:5px 12px;white-space:nowrap}
.yrh .vnav{display:flex;align-items:center;gap:8px}
.yrh .vnav span{font-family:var(--display);font-size:18px;color:var(--muted);min-width:56px;text-align:center}
.yrh .vnav button{width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:var(--bg);font-size:18px;transition:all .25s}
.yrh .vnav button:hover{background:var(--ink);color:var(--bg)}

.yrh .latest{padding-top:clamp(100px,11vw,170px)}
.yrh .post{display:grid;grid-template-columns:140px 1fr auto;gap:24px;align-items:baseline;padding:24px 0;border-bottom:1px solid var(--line);transition:padding .3s}
.yrh .post:hover{padding-inline-start:12px}
.yrh .post time{font-size:14px;color:var(--muted)}
.yrh .post h3{font-family:var(--display);font-weight:500;font-size:clamp(21px,2vw,28px);line-height:1.35}
.yrh .post .ar{font-size:20px;transition:transform .3s}
.yrh .post:hover .ar{transform:translateX(-6px);color:var(--acc-text)}

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
  .yrh .mtrack{animation:none}.yrh .marq{overflow-x:auto}.yrh .mset[aria-hidden]{display:none}.yrh .mpp{display:none}
}
@media (max-width:1000px){
  .yrh .hd nav .nl{display:none}
  .yrh .menu{display:block}
  .yrh .ws{flex-basis:78%}
  .yrh .fcols{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .yrh{font-size:16px}
  .yrh .logo .lk{height:38px}
  .yrh .hero-foot,.yrh .studio-row{grid-template-columns:1fr}
  .yrh .ws{flex-basis:88%}
  .yrh .ws .im{aspect-ratio:4/3}
  .yrh .cap{flex-direction:column;gap:2px}
  .yrh .wfoot{flex-direction:column;align-items:stretch}
  .yrh .wfoot .pill{justify-content:center}
  .yrh .scount{min-width:48px}
  .yrh .lg{height:104px;padding:0 24px}
  .yrh .lg i{width:calc(var(--w) * .66);height:calc(var(--h) * .66)}
  .yrh .vwho{flex-direction:column;align-items:flex-start}
  .yrh .vnav{align-self:stretch}
  .yrh .vnav span{margin-inline-end:auto;text-align:start}
  .yrh .lbl .vrate .stars{display:none}
  .yrh .post{grid-template-columns:1fr auto}
  .yrh .post time{grid-column:1/-1}
  .yrh .wa{width:52px;height:52px}
}
`;
