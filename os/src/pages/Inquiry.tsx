import { useEffect, useState } from "react";
import { configured, supabase } from "../lib/supabase";
import { CURRENCIES } from "../lib/format";
import { Button } from "../ui";

/*
 * Public inquiry form (no sign-in). Link it from Instagram/TikTok bios and
 * WhatsApp. It can only call the submit_inquiry() database function, which
 * validates, rate-limits and saves the lead. Bilingual: ?lang=ar for Arabic.
 */

const T = {
  en: {
    title: "Start a project",
    sub: "Tell me a little about your brand and what you need. I'll reply within 24 hours.",
    name: "Your name",
    brand: "Brand / business name",
    email: "Email",
    phone: "WhatsApp number",
    contactHint: "Add at least one: email or WhatsApp.",
    country: "Country",
    service: "What do you need?",
    choose: "Choose…",
    brief: "Tell me about the project",
    budget: "Budget (optional)",
    start: "When would you like to start?",
    send: "Send inquiry",
    sending: "Sending…",
    thanks: "Thank you! Your inquiry has been received.",
    thanksSub: "I'll get back to you within 24 hours.",
    switch: "عربي",
  },
  ar: {
    title: "ابدأ مشروعك",
    sub: "أخبرني قليلًا عن علامتك التجارية وما تحتاجه، وسأردّ عليك خلال ٢٤ ساعة.",
    name: "الاسم",
    brand: "اسم العلامة / النشاط",
    email: "البريد الإلكتروني",
    phone: "رقم الواتساب",
    contactHint: "أضف واحدًا على الأقل: البريد أو الواتساب.",
    country: "الدولة",
    service: "ما الخدمة التي تحتاجها؟",
    choose: "اختر…",
    brief: "حدّثني عن المشروع",
    budget: "الميزانية (اختياري)",
    start: "متى تودّ البدء؟",
    send: "إرسال",
    sending: "جارٍ الإرسال…",
    thanks: "شكرًا لك! وصلني طلبك.",
    thanksSub: "سأردّ عليك خلال ٢٤ ساعة.",
    switch: "English",
  },
};

export function Inquiry() {
  const params = new URLSearchParams(location.search);
  const [lang, setLang] = useState<"en" | "ar">(params.get("lang") === "ar" ? "ar" : "en");
  const t = T[lang];
  const [services, setServices] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "YR Studio — Start a project";
    if (configured) supabase.rpc("public_services").then(({ data }) => setServices(((data ?? []) as { name: string }[]).map((s) => s.name)));
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!f.email?.trim() && !f.phone?.trim()) return setError(t.contactHint);
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("submit_inquiry", { payload: { ...f, language: lang, source: params.get("source") ?? "website" } });
    setBusy(false);
    if (error) setError(error.message);
    else setDone(true);
  };

  const label = "mb-1.5 block text-xs font-medium text-muted";
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <a href="https://yrstudio.art">
            <img src="/brand/logo-full.png" alt="YR Studio" className="h-8 w-auto invert" />
          </a>
          <button type="button" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-fg">
            {t.switch}
          </button>
        </div>

        {done ? (
          <div className="mt-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-accent-fg">✓</div>
            <h1 className="mt-6 text-2xl font-semibold">{t.thanks}</h1>
            <p className="mt-2 text-muted">{t.thanksSub}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10">
            <h1 className="text-3xl font-semibold">{t.title}</h1>
            <p className="mt-2 text-muted">{t.sub}</p>

            {/* Honeypot: hidden from people, bots fill it. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="name">{t.name} <span className="text-accent">*</span></label>
                <input id="name" name="name" required minLength={2} maxLength={120} className="input" autoComplete="name" />
              </div>
              <div>
                <label className={label} htmlFor="phone">{t.phone}</label>
                <input id="phone" name="phone" type="tel" dir="ltr" maxLength={25} className="input" autoComplete="tel" placeholder="+966…" />
              </div>
              <div>
                <label className={label} htmlFor="email">{t.email}</label>
                <input id="email" name="email" type="email" dir="ltr" maxLength={200} className="input" autoComplete="email" />
              </div>
              <div>
                <label className={label} htmlFor="brand">{t.brand}</label>
                <input id="brand" name="brand" maxLength={200} className="input" autoComplete="organization" />
              </div>
              <div>
                <label className={label} htmlFor="country">{t.country}</label>
                <input id="country" name="country" maxLength={100} className="input" autoComplete="country-name" />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="service">{t.service}</label>
                <select id="service" name="service" className="input" defaultValue="">
                  <option value="">{t.choose}</option>
                  {services.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="brief">{t.brief}</label>
                <textarea id="brief" name="brief" rows={5} maxLength={4000} className="input" />
              </div>
              <div className="grid grid-cols-[1fr_6rem] gap-2">
                <div>
                  <label className={label} htmlFor="budget">{t.budget}</label>
                  <input id="budget" name="budget" type="number" min="0" step="1" className="input" />
                </div>
                <div>
                  <label className={label} htmlFor="currency">&nbsp;</label>
                  <select id="currency" name="currency" className="input" defaultValue="USD" aria-label="Currency">
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={label} htmlFor="desired_start">{t.start}</label>
                <input id="desired_start" name="desired_start" type="date" className="input" />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-accent">{error}</p>}
            <Button kind="primary" type="submit" disabled={busy || !configured} className="mt-6 w-full py-3">
              {busy ? t.sending : t.send}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
