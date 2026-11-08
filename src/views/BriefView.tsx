/*
 * Project brief form (/brief): a step-by-step questionnaire for new clients.
 * Each submission is saved as a lead in YR Studio OS (Supabase RPC
 * submit_inquiry, which validates, rate-limits and drops bots) and a copy is
 * emailed through Web3Forms.
 */
import { useId, useState, type ReactNode } from "react";
import { OS_SUPABASE_ANON_KEY, OS_SUPABASE_URL, WEB3FORMS_ACCESS_KEY } from "@/lib/site";
import { SECTORS } from "@/lib/sectors";
import { PageHero, container, focusRing } from "@/components/studio";

type Data = {
  name: string;
  brand: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  contactPref: string;
  sector: string;
  about: string;
  stage: string;
  audience: string;
  competitors: string;
  services: string[];
  hasLogo: string;
  languages: string;
  feel: string[];
  likeColors: string;
  avoidColors: string;
  references: string;
  budget: string;
  start: string;
  deadline: string;
  source: string;
  notes: string;
  website: string; // honeypot
};

const EMPTY: Data = {
  name: "",
  brand: "",
  country: "",
  city: "",
  phone: "",
  email: "",
  contactPref: "واتساب",
  sector: "",
  about: "",
  stage: "",
  audience: "",
  competitors: "",
  services: [],
  hasLogo: "",
  languages: "",
  feel: [],
  likeColors: "",
  avoidColors: "",
  references: "",
  budget: "",
  start: "",
  deadline: "",
  source: "",
  notes: "",
  website: "",
};

const SERVICES = [
  "هوية بصرية كاملة",
  "تصميم شعار",
  "ملف تعريفي",
  "منشورات التواصل الاجتماعي",
  "عرض تقديمي",
  "تغليف",
  "غير ذلك",
];
const FEELS = ["فاخر", "بسيط", "عصري", "كلاسيكي", "ودود", "جريء", "رسمي", "مرح", "هادئ", "تقني"];
const BUDGETS = ["أقل من ١٥٠ $", "١٥٠ – ٥٠٠ $", "٥٠٠ – ١٥٠٠ $", "أكثر من ١٥٠٠ $", "لم أحددها بعد"];
const SOURCES: [string, string][] = [
  ["إنستجرام", "instagram"],
  ["تيك توك", "tiktok"],
  ["واتساب", "whatsapp"],
  ["توصية من شخص", "referral"],
  ["جوجل أو الموقع", "website"],
  ["غير ذلك", "other"],
];

const STEPS = ["عنك", "نشاطك", "الخدمة", "الذوق", "الميزانية والوقت"];

/* ───────────────────────── small form controls */

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** A labelled group of choice buttons (a <label> must not wrap buttons). */
function Group({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <span id={id} className="mb-2 block text-sm font-semibold">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {hint && <span className="-mt-1 mb-2 block text-xs text-muted-foreground">{hint}</span>}
      {children}
    </div>
  );
}

function Choice({
  options,
  value,
  onChange,
  multi,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const isOn = (o: string) => (multi ? (value as string[]).includes(o) : value === o);
  const toggle = (o: string) => {
    if (!multi) return onChange(value === o ? "" : o);
    const list = value as string[];
    onChange(list.includes(o) ? list.filter((x) => x !== o) : [...list, o]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={isOn(o)}
          onClick={() => toggle(o)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${focusRing} ${
            isOn(o)
              ? "border-accent bg-accent font-semibold text-accent-foreground"
              : "border-white/15 text-white/80 hover:border-white/50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── the form */

export function BriefView() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((s) => ({ ...s, [k]: v }));

  // What must be filled before leaving each step.
  const check = (i: number): string | null => {
    if (i === 0) {
      if (d.name.trim().length < 2) return "اكتب اسمك من فضلك.";
      if (!d.phone.trim() && !d.email.trim())
        return "أضف رقم واتساب أو بريدا إلكترونيا لنتواصل معك.";
      if (d.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim()))
        return "تأكد من البريد الإلكتروني.";
    }
    if (i === 2 && d.services.length === 0) return "اختر خدمة واحدة على الأقل.";
    return null;
  };

  const next = () => {
    const e = check(step);
    setError(e);
    if (!e) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Everything the client wrote, as readable text for the lead and the email. */
  const summary = () => {
    const rows: [string, string][] = [
      ["الاسم", d.name],
      ["العلامة / الشركة", d.brand],
      ["الدولة والمدينة", [d.country, d.city].filter(Boolean).join(" – ")],
      ["واتساب", d.phone],
      ["البريد", d.email],
      ["يفضل التواصل عبر", d.contactPref],
      ["المجال", SECTORS.find((s) => s.key === d.sector)?.ar ?? d.sector],
      ["عن النشاط", d.about],
      ["مرحلة النشاط", d.stage],
      ["الجمهور المستهدف", d.audience],
      ["المنافسون", d.competitors],
      ["الخدمات المطلوبة", d.services.join("، ")],
      ["هل يوجد شعار حالي", d.hasLogo],
      ["لغة الهوية", d.languages],
      ["الإحساس المطلوب", d.feel.join("، ")],
      ["ألوان يحبها", d.likeColors],
      ["ألوان لا يريدها", d.avoidColors],
      ["أمثلة تعجبه", d.references],
      ["الميزانية", d.budget],
      ["موعد البدء", d.start],
      ["موعد التسليم", d.deadline],
      ["عرفني من", SOURCES.find(([, v]) => v === d.source)?.[0] ?? ""],
      ["ملاحظات", d.notes],
    ];
    return rows
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v.trim()}`)
      .join("\n");
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const e = check(i);
      if (e) {
        setStep(i);
        setError(e);
        return;
      }
    }
    setSending(true);
    setError(null);
    const text = summary();
    const payload = {
      name: d.name.trim(),
      brand: d.brand.trim(),
      email: d.email.trim(),
      phone: d.phone.trim(),
      country: [d.country, d.city]
        .filter((x) => x.trim())
        .join(" – ")
        .slice(0, 100),
      service: d.services.join("، ").slice(0, 200),
      brief: ("نموذج المشروع من الموقع\n\n" + text).slice(0, 4000),
      currency: "USD",
      desired_start: d.start || "",
      source: d.source || "website",
      language: "ar",
      website: d.website,
    };

    const saveLead = fetch(`${OS_SUPABASE_URL}/rest/v1/rpc/submit_inquiry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: OS_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${OS_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ payload }),
    }).then(async (r) => {
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(String(j.message || r.status));
      }
    });
    const sendEmail = fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        from_name: "yrstudio.art",
        subject: `[yrstudio.art] نموذج مشروع جديد — ${d.name.trim()}${d.brand.trim() ? ` (${d.brand.trim()})` : ""}`,
        replyto: d.email.trim() || undefined,
        message: text,
        botcheck: d.website,
      }),
    }).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
    });

    const [lead, mail] = await Promise.allSettled([saveLead, sendEmail]);
    setSending(false);
    if (lead.status === "fulfilled" || mail.status === "fulfilled") {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const msg = lead.status === "rejected" ? String((lead.reason as Error)?.message ?? "") : "";
    setError(
      /Too many/i.test(msg)
        ? "أرسلت طلبات كثيرة خلال وقت قصير. حاول بعد قليل أو راسلني على واتساب."
        : "لم يتم الإرسال. تأكد من الاتصال بالإنترنت وحاول مرة أخرى، أو راسلني على واتساب.",
    );
  };

  if (done)
    return (
      <>
        <PageHero
          kicker="تم الإرسال"
          title="شكرا لك، وصلني طلبك."
          lede="سأراجع تفاصيل مشروعك وأرد عليك خلال ٢٤ ساعة على الواتساب أو البريد."
        />
        <div className="h-24" />
      </>
    );

  return (
    <>
      <PageHero
        kicker="نموذج المشروع"
        title="أخبرني عن مشروعك"
        lede="خمس خطوات قصيرة، تأخذ حوالي ٥ دقائق. كلما كانت إجاباتك أوضح، كان عرض السعر أدق."
      />

      <section className={`${container} pb-28 pt-12 md:pb-40 md:pt-16`}>
        {/* Progress */}
        <ol className="flex gap-2" aria-label="خطوات النموذج">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`w-full text-start ${focusRing} rounded`}
                aria-current={i === step ? "step" : undefined}
              >
                <span
                  className={`block h-1.5 rounded-full ${i <= step ? "bg-accent" : "bg-white/10"}`}
                />
                <span
                  className={`mt-2 hidden text-xs sm:block ${i === step ? "text-white" : "text-muted-foreground"}`}
                >
                  {i + 1}. {s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < STEPS.length - 1) next();
            else void submit();
          }}
          noValidate
          className="mt-8 rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-6 md:p-12"
        >
          {/* Honeypot: hidden from people */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
            value={d.website}
            onChange={(e) => set("website", e.target.value)}
          />

          <div className="mb-8">
            <div className="text-sm text-muted-foreground">
              الخطوة {step + 1} من {STEPS.length}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold md:text-[2rem]">{STEPS[step]}</h2>
          </div>

          {step === 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="الاسم" required>
                <input
                  className={inputCls}
                  value={d.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  maxLength={120}
                />
              </Field>
              <Field label="اسم العلامة أو الشركة">
                <input
                  className={inputCls}
                  value={d.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  autoComplete="organization"
                  maxLength={200}
                />
              </Field>
              <Field label="رقم الواتساب" hint="أضف الواتساب أو البريد، أو الاثنين.">
                <input
                  className={inputCls}
                  dir="ltr"
                  type="tel"
                  value={d.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+966 5x xxx xxxx"
                  autoComplete="tel"
                  maxLength={25}
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  className={inputCls}
                  dir="ltr"
                  type="email"
                  value={d.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  maxLength={200}
                />
              </Field>
              <Field label="الدولة">
                <input
                  className={inputCls}
                  value={d.country}
                  onChange={(e) => set("country", e.target.value)}
                  autoComplete="country-name"
                  maxLength={60}
                />
              </Field>
              <Field label="المدينة">
                <input
                  className={inputCls}
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                  maxLength={40}
                />
              </Field>
              <div className="md:col-span-2">
                <Group label="تفضل نتواصل عبر">
                  <Choice
                    options={["واتساب", "البريد", "مكالمة"]}
                    value={d.contactPref}
                    onChange={(v) => set("contactPref", v as string)}
                  />
                </Group>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6">
              <Group label="مجال نشاطك">
                <Choice
                  options={[...SECTORS.map((s) => s.ar), "مجال آخر"]}
                  value={
                    SECTORS.find((s) => s.key === d.sector)?.ar ?? (d.sector ? "مجال آخر" : "")
                  }
                  onChange={(v) =>
                    set("sector", SECTORS.find((s) => s.ar === v)?.key ?? (v ? "مجال آخر" : ""))
                  }
                />
              </Group>
              <Field label="عرّفني بنشاطك" hint="ماذا تقدم؟ وما الذي يميزك عن غيرك؟">
                <textarea
                  className={`${inputCls} min-h-28`}
                  value={d.about}
                  onChange={(e) => set("about", e.target.value)}
                  maxLength={1200}
                />
              </Field>
              <Group label="مرحلة النشاط">
                <Choice
                  options={["فكرة جديدة لم تبدأ", "بدأت حديثا", "نشاط قائم أريد تطويره"]}
                  value={d.stage}
                  onChange={(v) => set("stage", v as string)}
                />
              </Group>
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="جمهورك المستهدف"
                  hint="مثال: شباب ٢٠–٣٥ في الرياض، أو الشركات الصغيرة."
                >
                  <textarea
                    className={`${inputCls} min-h-24`}
                    value={d.audience}
                    onChange={(e) => set("audience", e.target.value)}
                    maxLength={500}
                  />
                </Field>
                <Field label="أبرز المنافسين" hint="أسماء أو روابط، إن وجدت.">
                  <textarea
                    className={`${inputCls} min-h-24`}
                    value={d.competitors}
                    onChange={(e) => set("competitors", e.target.value)}
                    maxLength={500}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <Group label="ماذا تحتاج؟" required hint="يمكنك اختيار أكثر من خدمة.">
                <Choice
                  options={SERVICES}
                  value={d.services}
                  onChange={(v) => set("services", v as string[])}
                  multi
                />
              </Group>
              <Group label="هل لديك شعار حاليا؟">
                <Choice
                  options={["لا، أحتاج شعارا جديدا", "نعم، أريد تطويره", "نعم، وأريد الحفاظ عليه"]}
                  value={d.hasLogo}
                  onChange={(v) => set("hasLogo", v as string)}
                />
              </Group>
              <Group label="لغة الهوية">
                <Choice
                  options={["عربي", "إنجليزي", "عربي وإنجليزي"]}
                  value={d.languages}
                  onChange={(v) => set("languages", v as string)}
                />
              </Group>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              <Group label="ما الإحساس الذي تريد أن تعطيه علامتك؟" hint="اختر ٢ أو ٣.">
                <Choice
                  options={FEELS}
                  value={d.feel}
                  onChange={(v) => set("feel", v as string[])}
                  multi
                />
              </Group>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="ألوان تحبها">
                  <input
                    className={inputCls}
                    value={d.likeColors}
                    onChange={(e) => set("likeColors", e.target.value)}
                    maxLength={200}
                  />
                </Field>
                <Field label="ألوان لا تريدها">
                  <input
                    className={inputCls}
                    value={d.avoidColors}
                    onChange={(e) => set("avoidColors", e.target.value)}
                    maxLength={200}
                  />
                </Field>
              </div>
              <Field
                label="علامات أو تصاميم تعجبك"
                hint="ضع روابط أو أسماء، واكتب ما الذي يعجبك فيها."
              >
                <textarea
                  className={`${inputCls} min-h-28`}
                  value={d.references}
                  onChange={(e) => set("references", e.target.value)}
                  maxLength={800}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6">
              <Group label="الميزانية المتوقعة">
                <Choice
                  options={BUDGETS}
                  value={d.budget}
                  onChange={(v) => set("budget", v as string)}
                />
              </Group>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="متى تريد البدء؟">
                  <input
                    className={inputCls}
                    type="date"
                    value={d.start}
                    onChange={(e) => set("start", e.target.value)}
                  />
                </Field>
                <Field label="موعد التسليم المطلوب (إن وجد)">
                  <input
                    className={inputCls}
                    type="date"
                    value={d.deadline}
                    onChange={(e) => set("deadline", e.target.value)}
                  />
                </Field>
              </div>
              <Group label="كيف عرفتني؟">
                <Choice
                  options={SOURCES.map(([l]) => l)}
                  value={SOURCES.find(([, v]) => v === d.source)?.[0] ?? ""}
                  onChange={(v) => set("source", SOURCES.find(([l]) => l === v)?.[1] ?? "")}
                />
              </Group>
              <Field label="أي شيء آخر تريد إضافته؟">
                <textarea
                  className={`${inputCls} min-h-24`}
                  value={d.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  maxLength={800}
                />
              </Field>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
            >
              {error}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className={`rounded-full px-5 py-3 text-sm text-muted-foreground hover:text-white ${focusRing}`}
              >
                → السابق
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={sending}
              className={`group inline-flex items-center gap-3 rounded-full bg-accent py-1.5 pe-1.5 ps-6 text-sm font-bold text-accent-foreground transition hover:brightness-110 disabled:opacity-60 ${focusRing}`}
            >
              {step < STEPS.length - 1 ? "التالي" : sending ? "جار الإرسال…" : "أرسل الطلب"}
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:-rotate-45"
              >
                ↖
              </span>
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
