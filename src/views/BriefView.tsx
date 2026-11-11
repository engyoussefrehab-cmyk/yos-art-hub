/*
 * Project brief (/brief): a guided, multi-step questionnaire for new clients.
 *
 * - Six steps with a sticky step rail (desktop) and a compact progress bar
 *   (mobile), inline validation, character counters, and a review step.
 * - Answers auto-save in this browser (localStorage) so a client can return.
 * - On submit: saves a lead in YR Studio OS (Supabase RPC submit_inquiry —
 *   validation, rate limit, honeypot) and emails a copy via Web3Forms.
 */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { OS_SUPABASE_ANON_KEY, OS_SUPABASE_URL, WEB3FORMS_ACCESS_KEY } from "@/lib/site";
import { SECTORS } from "@/lib/sectors";
import { Pill, container, focusRing } from "@/components/studio";
import contact from "@/content/contact.json";

/* ═════════════════════════════════════════ data model */

type Data = {
  name: string;
  role: string;
  brand: string;
  country: string;
  city: string;
  dial: string;
  phone: string;
  email: string;
  contactPref: string;
  contactTime: string;
  sector: string;
  about: string;
  stage: string;
  audience: string;
  competitors: string;
  website: string;
  services: string[];
  goals: string[];
  uses: string[];
  hasLogo: string;
  languages: string;
  decision: string;
  feel: string[];
  likeColors: string;
  avoidColors: string;
  references: string;
  avoid: string;
  budget: string;
  start: string;
  deadline: string;
  source: string;
  notes: string;
  consent: boolean;
  hp: string; // honeypot
};

const EMPTY: Data = {
  name: "", role: "", brand: "", country: "", city: "", dial: "+966", phone: "", email: "",
  contactPref: "واتساب", contactTime: "",
  sector: "", about: "", stage: "", audience: "", competitors: "", website: "",
  services: [], goals: [], uses: [], hasLogo: "", languages: "", decision: "",
  feel: [], likeColors: "", avoidColors: "", references: "", avoid: "",
  budget: "", start: "", deadline: "", source: "", notes: "", consent: false, hp: "",
};

const DRAFT_KEY = "yr-brief-draft-v1";

const COUNTRIES: [string, string][] = [
  ["السعودية", "+966"], ["الإمارات", "+971"], ["مصر", "+20"], ["الكويت", "+965"], ["قطر", "+974"],
  ["البحرين", "+973"], ["عمان", "+968"], ["الأردن", "+962"], ["العراق", "+964"], ["المغرب", "+212"],
  ["الجزائر", "+213"], ["تونس", "+216"], ["ليبيا", "+218"], ["لبنان", "+961"], ["فلسطين", "+970"],
  ["السودان", "+249"], ["اليمن", "+967"], ["دولة أخرى", ""],
];

const SERVICES: [string, string][] = [
  ["هوية بصرية كاملة", "شعار، ألوان، خطوط، دليل استخدام وتطبيقات"],
  ["تصميم شعار", "شعار بنسخه المختلفة وملفات التسليم"],
  ["ملف تعريفي", "ملف يعرض الشركة وخدماتها وأعمالها"],
  ["منشورات التواصل الاجتماعي", "تصاميم وقوالب لمنصاتك"],
  ["عرض تقديمي", "عرض للمستثمرين أو العملاء أو الفعاليات"],
  ["تغليف", "تصميم عبوات وملصقات المنتجات"],
  ["تطوير هوية قائمة", "تحديث هوية موجودة دون فقدان روحها"],
  ["غير ذلك", "اشرحه في الملاحظات"],
];

const GOALS = ["إطلاق علامة جديدة", "تحديث صورة العلامة", "زيادة الثقة والمبيعات", "دخول سوق جديد", "توحيد شكل العلامة", "جذب مستثمرين"];
const USES = ["لافتات وواجهات", "تغليف ومنتجات", "منصات التواصل", "موقع أو تطبيق", "مطبوعات وأوراق رسمية", "زي موحد", "سيارات", "عروض تقديمية"];
const FEELS = ["فاخر", "بسيط", "عصري", "كلاسيكي", "ودود", "جريء", "رسمي", "مرح", "هادئ", "تقني", "تراثي", "شبابي"];

const STAGES: [string, string][] = [
  ["فكرة جديدة", "لم يبدأ النشاط بعد"],
  ["بدأ حديثا", "أقل من سنة في السوق"],
  ["نشاط قائم", "أريد تطوير صورته"],
];
const BUDGETS: [string, string][] = [
  ["أقل من ١٥٠ $", "شعار أو منشورات"],
  ["١٥٠ – ٥٠٠ $", "هوية أساسية"],
  ["٥٠٠ – ١٥٠٠ $", "هوية متكاملة"],
  ["أكثر من ١٥٠٠ $", "هوية شاملة وتطبيقات"],
  ["لم أحددها بعد", "نحددها معا"],
];
const SOURCES: [string, string][] = [
  ["إنستجرام", "instagram"], ["تيك توك", "tiktok"], ["واتساب", "whatsapp"],
  ["توصية من شخص", "referral"], ["جوجل أو الموقع", "website"], ["غير ذلك", "other"],
];

const STEPS = [
  { title: "بياناتك", desc: "كيف نتواصل معك" },
  { title: "نشاطك", desc: "ماذا تقدم ولمن" },
  { title: "المشروع", desc: "ما الذي تحتاجه" },
  { title: "الذوق", desc: "الإحساس والألوان" },
  { title: "الميزانية والوقت", desc: "الإطار العام" },
  { title: "المراجعة", desc: "تأكيد وإرسال" },
];
const INTROS = [
  "نبدأ بالأساسيات. نستخدم هذه البيانات للتواصل معك بخصوص طلبك فقط.",
  "كلما فهمت نشاطك وجمهورك أكثر، كان التصميم أقرب لما تحتاجه فعلا.",
  "حدد الخدمات المطلوبة وأين ستستخدم الهوية، لنقدر حجم العمل بدقة.",
  "لا توجد إجابات خاطئة هنا. اختر ما يعبر عن علامتك كما تتخيلها.",
  "هذه المعلومات تساعدني على اقتراح الحل الأنسب لميزانيتك ووقتك.",
  "راجع إجاباتك قبل الإرسال. يمكنك تعديل أي قسم.",
];

type Errors = Partial<Record<keyof Data, string>>;

/* ═════════════════════════════════════════ form controls */

const inputBase =
  "w-full rounded-2xl border bg-white/[0.03] px-4 py-3.5 text-[15px] text-white placeholder:text-white/30 transition-colors focus:bg-white/[0.05] focus:outline-none";
const inputCls = (err?: string) =>
  `${inputBase} ${err ? "border-accent/70 focus:border-accent" : "border-white/10 hover:border-white/20 focus:border-white/50"}`;

function Label({ htmlFor, id, children, required, optional }: { htmlFor?: string; id?: string; children: ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} id={id} className="mb-2.5 flex items-baseline gap-2 text-[15px] font-semibold text-white">
      {children}
      {required && <span className="text-accent" aria-hidden>*</span>}
      {optional && <span className="text-xs font-normal text-white/40">اختياري</span>}
    </label>
  );
}

function Help({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  if (error)
    return (
      <p id={id} className="mt-2 text-sm text-accent">
        {error}
      </p>
    );
  if (hint)
    return (
      <p id={id} className="mt-2 text-xs leading-relaxed text-white/45">
        {hint}
      </p>
    );
  return null;
}

function TextField({
  label, value, onChange, error, hint, required, optional, type = "text", dir, placeholder, max, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string;
  required?: boolean; optional?: boolean; type?: string; dir?: "ltr" | "rtl"; placeholder?: string; max?: number; autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <input
        id={id}
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        maxLength={max}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={`${id}-h`}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls(error)}
      />
      <Help id={`${id}-h`} hint={hint} error={error} />
    </div>
  );
}

function AreaField({
  label, value, onChange, hint, optional, max = 800, placeholder, rows = 4,
}: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; optional?: boolean; max?: number; placeholder?: string; rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        aria-describedby={`${id}-h`}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls()} resize-y leading-relaxed`}
      />
      <div className="mt-2 flex items-start justify-between gap-4">
        {hint ? (
          <p id={`${id}-h`} className="text-xs leading-relaxed text-white/45">
            {hint}
          </p>
        ) : (
          <span id={`${id}-h`} />
        )}
        <span className="shrink-0 text-xs tabular-nums text-white/30" dir="ltr">
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options, error, required, optional, placeholder = "اختر…",
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; error?: string; required?: boolean; optional?: boolean; placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls(error)} appearance-none pe-10`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#111]">
              {o}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-white/40">
          ▾
        </span>
      </div>
      <Help id={`${id}-h`} error={error} />
    </div>
  );
}

/** Option cards (single or multiple choice) inside a labelled group. */
function Options({
  label, hint, required, optional, error, items, value, onChange, multi, cols = 2,
}: {
  label: string; hint?: string; required?: boolean; optional?: boolean; error?: string;
  items: [string, string?][]; value: string | string[]; onChange: (v: string | string[]) => void; multi?: boolean; cols?: 2 | 3 | 4;
}) {
  const id = useId();
  const on = (o: string) => (multi ? (value as string[]).includes(o) : value === o);
  const toggle = (o: string) => {
    if (!multi) return onChange(value === o ? "" : o);
    const list = value as string[];
    onChange(list.includes(o) ? list.filter((x) => x !== o) : [...list, o]);
  };
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <div role="group" aria-labelledby={id} aria-describedby={`${id}-h`}>
      <Label id={id} required={required} optional={optional}>
        {label}
      </Label>
      {hint && !error && <p className="-mt-1 mb-3 text-xs text-white/45">{hint}</p>}
      <div className={`grid grid-cols-1 gap-2.5 ${grid}`}>
        {items.map(([title, desc]) => {
          const active = on(title);
          return (
            <button
              key={title}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={active}
              onClick={() => toggle(title)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-start transition-colors ${focusRing} ${
                active ? "border-accent bg-accent/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/25"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] ${
                  multi ? "rounded-md" : "rounded-full"
                } ${active ? "border-accent bg-accent text-black" : "border-white/30"}`}
              >
                {active ? "✓" : ""}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-white">{title}</span>
                {desc && <span className="mt-0.5 block text-xs leading-relaxed text-white/50">{desc}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <Help id={`${id}-h`} error={error} />
    </div>
  );
}

/** Compact chips for many short options. */
function Chips({
  label, hint, optional, items, value, onChange,
}: {
  label: string; hint?: string; optional?: boolean; items: string[]; value: string[]; onChange: (v: string[]) => void;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <Label id={id} optional={optional}>
        {label}
      </Label>
      {hint && <p className="-mt-1 mb-3 text-xs text-white/45">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {items.map((o) => {
          const active = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onChange(active ? value.filter((x) => x !== o) : [...value, o])}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${focusRing} ${
                active ? "border-accent bg-accent font-semibold text-black" : "border-white/15 text-white/75 hover:border-white/40"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <span className="shrink-0 text-xs font-semibold text-white/40">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

/* ═════════════════════════════════════════ page */

export function BriefView() {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [d, setD] = useState<Data>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);

  // Restore a saved draft (this browser only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { d: Data; step: number; maxStep: number };
        setD({ ...EMPTY, ...saved.d, hp: "", consent: false });
        setStep(Math.min(saved.step ?? 0, STEPS.length - 1));
        setMaxStep(Math.min(saved.maxStep ?? 0, STEPS.length - 1));
        setRestored(true);
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    if (done) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ d: { ...d, hp: "" }, step, maxStep }));
    } catch {
      /* ignore */
    }
  }, [d, step, maxStep, done]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setD((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (i: number): Errors => {
    const e: Errors = {};
    if (i === 0) {
      if (d.name.trim().length < 2) e.name = "اكتب اسمك.";
      const phoneDigits = d.phone.replace(/\D/g, "");
      if (!phoneDigits && !d.email.trim()) e.phone = "أضف رقم واتساب أو بريدا إلكترونيا على الأقل.";
      if (phoneDigits && phoneDigits.length < 7) e.phone = "تأكد من رقم الهاتف.";
      if (d.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = "تأكد من البريد الإلكتروني.";
    }
    if (i === 1 && !d.sector) e.sector = "اختر مجال نشاطك.";
    if (i === 2 && d.services.length === 0) e.services = "اختر خدمة واحدة على الأقل.";
    if (i === 5 && !d.consent) e.consent = "يلزم الموافقة لإرسال الطلب.";
    return e;
  };

  /** Tell the studio (Telegram, via a rate-limited RPC) that a visitor got stuck. Once per reason per visit. */
  const reported = useRef(new Set<string>());
  const report = (reason: string, stepIdx: number) => {
    const key = `${stepIdx}:${reason}`;
    if (reported.current.has(key)) return;
    reported.current.add(key);
    try {
      void fetch(`${OS_SUPABASE_URL}/rest/v1/rpc/report_inquiry_problem`, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", apikey: OS_SUPABASE_ANON_KEY, Authorization: `Bearer ${OS_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          payload: {
            reason: reason.slice(0, 300),
            step: STEPS[stepIdx]?.title ?? "",
            name: d.name.trim().slice(0, 100),
            brand: d.brand.trim().slice(0, 100),
            phone: d.phone.trim().slice(0, 30),
            email: d.email.trim().slice(0, 150),
            website: d.hp,
          },
        }),
      }).catch(() => {});
    } catch {
      /* reporting must never disturb the form */
    }
  };

  const go = (i: number) => {
    setStep(i);
    setSendError(null);
    if (typeof window !== "undefined") document.getElementById("brief-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) {
      report("لم يستطع المتابعة: " + Object.values(e).filter(Boolean).join(" / "), step);
      return;
    }
    const n = Math.min(step + 1, STEPS.length - 1);
    setMaxStep((m) => Math.max(m, n));
    go(n);
  };

  const fullPhone = d.phone.trim() ? `${d.dial} ${d.phone.trim()}`.trim() : "";

  /** Answers grouped by step, for the review screen, the lead and the email. */
  const sections = useMemo(() => {
    const sectorLabel = SECTORS.find((s) => s.key === d.sector)?.ar ?? (d.sector === "other" ? "مجال آخر" : "");
    return [
      [
        ["الاسم", d.name], ["المنصب", d.role], ["العلامة / الشركة", d.brand],
        ["الدولة والمدينة", [d.country, d.city].filter(Boolean).join(" – ")], ["واتساب / هاتف", fullPhone],
        ["البريد", d.email], ["التواصل المفضل", d.contactPref], ["أفضل وقت للتواصل", d.contactTime],
      ],
      [
        ["المجال", sectorLabel], ["عن النشاط", d.about], ["مرحلة النشاط", d.stage],
        ["الجمهور المستهدف", d.audience], ["المنافسون", d.competitors], ["الموقع أو الحسابات", d.website],
      ],
      [
        ["الخدمات المطلوبة", d.services.join("، ")], ["أهداف المشروع", d.goals.join("، ")],
        ["أين ستستخدم الهوية", d.uses.join("، ")], ["الشعار الحالي", d.hasLogo], ["لغة الهوية", d.languages],
        ["صاحب القرار", d.decision],
      ],
      [
        ["الإحساس المطلوب", d.feel.join("، ")], ["ألوان مفضلة", d.likeColors], ["ألوان مرفوضة", d.avoidColors],
        ["أمثلة تعجبه", d.references], ["أشياء يتجنبها", d.avoid],
      ],
      [
        ["الميزانية", d.budget], ["موعد البدء", d.start], ["موعد التسليم", d.deadline],
        ["عرفني من", SOURCES.find(([, v]) => v === d.source)?.[0] ?? ""], ["ملاحظات", d.notes],
      ],
    ] as [string, string][][];
  }, [d, fullPhone]);

  const summaryText = () =>
    sections
      .map((rows, i) => {
        const filled = rows.filter(([, v]) => v && v.trim());
        if (!filled.length) return "";
        return `— ${STEPS[i].title} —\n` + filled.map(([k, v]) => `${k}: ${v.trim()}`).join("\n");
      })
      .filter(Boolean)
      .join("\n\n");

  const submit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const e = validate(i);
      if (Object.keys(e).length) {
        setErrors(e);
        report("لم يستطع الإرسال: " + Object.values(e).filter(Boolean).join(" / "), i);
        go(i);
        return;
      }
    }
    setSending(true);
    setSendError(null);
    const text = summaryText();
    const payload = {
      name: d.name.trim(),
      brand: d.brand.trim(),
      email: d.email.trim(),
      phone: fullPhone,
      country: [d.country, d.city].filter((x) => x.trim()).join(" – ").slice(0, 100),
      service: d.services.join("، ").slice(0, 200),
      brief: ("نموذج المشروع من الموقع\n\n" + text).slice(0, 4000),
      currency: "USD",
      desired_start: d.start || "",
      source: d.source || "website",
      language: "ar",
      website: d.hp,
    };

    const saveLead = fetch(`${OS_SUPABASE_URL}/rest/v1/rpc/submit_inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: OS_SUPABASE_ANON_KEY, Authorization: `Bearer ${OS_SUPABASE_ANON_KEY}` },
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
        botcheck: d.hp,
      }),
    }).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
    });

    const [lead, mail] = await Promise.allSettled([saveLead, sendEmail]);
    setSending(false);
    if (lead.status === "rejected") {
      const why = String((lead.reason as Error)?.message ?? "").slice(0, 200);
      report(
        mail.status === "fulfilled"
          ? `الطلب لم يُحفظ في النظام (وصل بالإيميل فقط): ${why}`
          : `فشل الإرسال بالكامل: ${why}`,
        STEPS.length - 1,
      );
    } else if (mail.status === "rejected") {
      report("الطلب حُفظ لكن إرسال الإيميل فشل", STEPS.length - 1);
    }
    if (lead.status === "fulfilled" || mail.status === "fulfilled") {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setDone(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const msg = lead.status === "rejected" ? String((lead.reason as Error)?.message ?? "") : "";
    setSendError(
      /Too many/i.test(msg)
        ? "تم إرسال عدة طلبات خلال وقت قصير. حاول بعد قليل، أو راسلني على واتساب."
        : "تعذر الإرسال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى، أو راسلني على واتساب.",
    );
  };

  const reset = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setD(EMPTY);
    setErrors({});
    setStep(0);
    setMaxStep(0);
    setRestored(false);
  };

  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  /* ───────────────────────── success */
  if (done)
    return (
      <section className={`${container} pb-28 pt-10 md:pb-40 md:pt-16`}>
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-8 text-center md:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-black">✓</div>
          <h1 className="mt-6 font-display text-3xl font-bold md:text-[2.5rem]">شكرا {d.name.split(" ")[0]}، وصلني طلبك.</h1>
          <p className="mx-auto mt-4 max-w-xl leading-[1.9] text-white/70">سأراجع تفاصيل مشروعك بعناية وأعود إليك قريبا.</p>
          <ol className="mt-10 grid gap-3 text-start sm:grid-cols-3">
            {[
              ["خلال ٢٤ ساعة", "أراجع طلبك وأتواصل معك."],
              ["مكالمة قصيرة", "نناقش التفاصيل ونجيب عن أسئلتك."],
              ["عرض السعر", "يصلك عرض واضح بالمدة والتكلفة."],
            ].map(([t, x], i) => (
              <li key={t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <span className="font-display text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-2 font-semibold">{t}</div>
                <div className="mt-1 text-sm text-white/55">{x}</div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Pill href={contact.whatsapp_url} newTab variant="light">
              تواصل على واتساب
            </Pill>
            <Pill to="/projects" variant="ghost">
              تصفح الأعمال
            </Pill>
          </div>
        </div>
      </section>
    );

  /* ───────────────────────── form */
  const E = errors;
  return (
    <section id="brief-top" className={`${container} scroll-mt-24 pb-32 pt-8 md:pb-40 md:pt-14`}>
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-sm text-white/60">
            <span className="text-accent">✦</span>
            نموذج المشروع
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-[1.2] md:text-[2.75rem]">أخبرني عن مشروعك</h1>
          <p className="mt-3 leading-[1.9] text-white/60">إجاباتك تساعدني على فهم مشروعك وتقديم عرض سعر دقيق ومناسب.</p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs text-white/70">
          {["حوالي ٥ دقائق", "رد خلال ٢٤ ساعة", "بياناتك لا تشارك مع أحد"].map((x) => (
            <li key={x} className="rounded-full border border-white/10 px-3 py-1.5">
              {x}
            </li>
          ))}
        </ul>
      </div>

      {restored && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm">
          <span className="text-white/70">أكملنا من حيث توقفت آخر مرة.</span>
          <button type="button" onClick={reset} className={`text-white/50 underline-offset-4 hover:text-white hover:underline ${focusRing}`}>
            ابدأ من جديد
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Step rail (desktop) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28 rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">التقدم</span>
              <span className="font-semibold tabular-nums">{pct}٪</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <ol className="mt-6 space-y-1">
              {STEPS.map((s, i) => {
                const state = i < step ? "done" : i === step ? "current" : "todo";
                const canGo = i <= maxStep && i !== step;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      disabled={!canGo}
                      onClick={() => canGo && go(i)}
                      aria-current={state === "current" ? "step" : undefined}
                      className={`flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-start transition-colors ${focusRing} ${
                        state === "current" ? "bg-white/[0.05]" : canGo ? "hover:bg-white/[0.03]" : ""
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                          state === "done"
                            ? "border-white bg-white text-black"
                            : state === "current"
                              ? "border-accent bg-accent text-black"
                              : "border-white/15 text-white/40"
                        }`}
                      >
                        {state === "done" ? "✓" : i + 1}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold ${state === "todo" ? "text-white/45" : "text-white"}`}>{s.title}</span>
                        <span className="block text-xs text-white/40">{s.desc}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/45">
              تحفظ إجاباتك تلقائيا على هذا الجهاز، فيمكنك الإكمال لاحقا.
              <a href={contact.whatsapp_url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-white/70 hover:text-white">
                تفضل الحديث مباشرة؟ راسلني على واتساب ↖
              </a>
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="lg:col-span-8">
          {/* Mobile progress */}
          <div className="mb-5 lg:hidden">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {step + 1}. {STEPS[step].title}
              </span>
              <span className="text-white/50 tabular-nums">
                {step + 1} / {STEPS.length}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < STEPS.length - 1) next();
              else void submit();
            }}
            noValidate
            className="rounded-[2rem] border border-white/10 bg-[#0b0b0b]"
          >
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={d.hp} onChange={(e) => set("hp", e.target.value)} />

            <div className="border-b border-white/10 px-6 py-7 md:px-10 md:py-8">
              <div className="text-xs font-semibold text-accent">
                الخطوة {step + 1} من {STEPS.length}
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-[1.75rem]">{STEPS[step].title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">{INTROS[step]}</p>
            </div>

            <div className="space-y-8 px-6 py-8 md:px-10 md:py-10">
              {step === 0 && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <TextField label="الاسم الكامل" required value={d.name} onChange={(v) => set("name", v)} error={E.name} max={120} autoComplete="name" />
                    <TextField label="المنصب" optional value={d.role} onChange={(v) => set("role", v)} placeholder="مثال: المالك، مدير التسويق" max={80} />
                    <div className="md:col-span-2">
                      <TextField label="اسم العلامة أو الشركة" optional value={d.brand} onChange={(v) => set("brand", v)} max={200} autoComplete="organization" />
                    </div>
                  </div>
                  <Divider>طرق التواصل</Divider>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="brief-phone">رقم الواتساب</Label>
                      <div className="flex gap-2" dir="ltr">
                        <select
                          aria-label="رمز الدولة"
                          value={d.dial}
                          onChange={(e) => set("dial", e.target.value)}
                          className={`${inputCls().replace("w-full ", "")} w-[5.5rem] shrink-0 appearance-none px-2 text-center`}
                        >
                          {[...new Set(COUNTRIES.map(([, c]) => c).filter(Boolean))].map((c) => (
                            <option key={c} value={c} className="bg-[#111]">
                              {c}
                            </option>
                          ))}
                          <option value="" className="bg-[#111]">
                            أخرى
                          </option>
                        </select>
                        <input
                          id="brief-phone"
                          type="tel"
                          inputMode="tel"
                          value={d.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="5x xxx xxxx"
                          maxLength={20}
                          autoComplete="tel-national"
                          aria-invalid={!!E.phone}
                          aria-describedby="brief-phone-h"
                          className={`${inputCls(E.phone)} min-w-0 flex-1`}
                        />
                      </div>
                      <Help id="brief-phone-h" hint="أضف الواتساب أو البريد، أو الاثنين." error={E.phone} />
                    </div>
                    <TextField label="البريد الإلكتروني" type="email" dir="ltr" value={d.email} onChange={(v) => set("email", v)} error={E.email} max={200} autoComplete="email" />
                    <SelectField
                      label="الدولة"
                      value={d.country}
                      onChange={(v) => {
                        set("country", v);
                        const code = COUNTRIES.find(([n]) => n === v)?.[1];
                        if (code && !d.phone) set("dial", code);
                      }}
                      options={COUNTRIES.map(([n]) => n)}
                    />
                    <TextField label="المدينة" optional value={d.city} onChange={(v) => set("city", v)} max={40} />
                  </div>
                  <Options
                    label="طريقة التواصل المفضلة"
                    cols={3}
                    items={[["واتساب"], ["البريد الإلكتروني"], ["مكالمة هاتفية"]]}
                    value={d.contactPref}
                    onChange={(v) => set("contactPref", v as string)}
                  />
                  <SelectField label="أفضل وقت للتواصل" optional value={d.contactTime} onChange={(v) => set("contactTime", v)} options={["صباحا", "بعد الظهر", "مساء", "أي وقت"]} />
                </>
              )}

              {step === 1 && (
                <>
                  <Options
                    label="مجال نشاطك"
                    required
                    error={E.sector}
                    cols={3}
                    items={[...SECTORS.map((s) => [s.ar] as [string]), ["مجال آخر"]]}
                    value={SECTORS.find((s) => s.key === d.sector)?.ar ?? (d.sector === "other" ? "مجال آخر" : "")}
                    onChange={(v) => {
                      set("sector", SECTORS.find((s) => s.ar === v)?.key ?? (v ? "other" : ""));
                      if (E.sector) setErrors((e) => ({ ...e, sector: undefined }));
                    }}
                  />
                  <AreaField label="عرّفني بنشاطك" optional value={d.about} onChange={(v) => set("about", v)} max={1200} hint="ماذا تقدم؟ وما الذي يميزك عن غيرك؟" />
                  <Options label="مرحلة النشاط" optional cols={3} items={STAGES} value={d.stage} onChange={(v) => set("stage", v as string)} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <AreaField label="جمهورك المستهدف" optional rows={3} value={d.audience} onChange={(v) => set("audience", v)} max={500} hint="العمر، المكان، الاهتمامات، أو نوع الشركات." />
                    <AreaField label="أبرز المنافسين" optional rows={3} value={d.competitors} onChange={(v) => set("competitors", v)} max={500} hint="أسماء أو روابط." />
                  </div>
                  <TextField label="الموقع أو حسابات التواصل" optional dir="ltr" value={d.website} onChange={(v) => set("website", v)} placeholder="instagram.com/…" max={300} />
                </>
              )}

              {step === 2 && (
                <>
                  <Options label="الخدمات المطلوبة" required error={E.services} hint="يمكنك اختيار أكثر من خدمة." multi items={SERVICES} value={d.services} onChange={(v) => set("services", v as string[])} />
                  <Chips label="ما الهدف من المشروع؟" optional hint="اختر كل ما ينطبق." items={GOALS} value={d.goals} onChange={(v) => set("goals", v)} />
                  <Chips label="أين ستستخدم الهوية؟" optional items={USES} value={d.uses} onChange={(v) => set("uses", v)} />
                  <Options
                    label="هل لديك شعار حاليا؟"
                    optional
                    cols={3}
                    items={[["لا يوجد", "أحتاج شعارا جديدا"], ["يوجد", "أريد تطويره"], ["يوجد", "أريد الحفاظ عليه"]].map(([a, b]) => [`${a}، ${b}`]) as [string][]}
                    value={d.hasLogo}
                    onChange={(v) => set("hasLogo", v as string)}
                  />
                  <div className="grid gap-6 md:grid-cols-2">
                    <Options label="لغة الهوية" optional cols={3} items={[["عربي"], ["إنجليزي"], ["الاثنان"]]} value={d.languages} onChange={(v) => set("languages", v as string)} />
                    <SelectField label="من سيتخذ القرار النهائي؟" optional value={d.decision} onChange={(v) => set("decision", v)} options={["أنا", "أنا وشريك", "فريق أو لجنة"]} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <Chips label="ما الإحساس الذي تريد أن تعطيه علامتك؟" optional hint="اختر ٢ أو ٣ كلمات." items={FEELS} value={d.feel} onChange={(v) => set("feel", v)} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <TextField label="ألوان تحبها" optional value={d.likeColors} onChange={(v) => set("likeColors", v)} max={200} placeholder="مثال: أخضر داكن وذهبي" />
                    <TextField label="ألوان لا تريدها" optional value={d.avoidColors} onChange={(v) => set("avoidColors", v)} max={200} />
                  </div>
                  <AreaField label="علامات أو تصاميم تعجبك" optional value={d.references} onChange={(v) => set("references", v)} max={800} hint="ضع روابط أو أسماء، واكتب ما الذي يعجبك فيها." />
                  <AreaField label="أشياء تريد تجنبها" optional rows={3} value={d.avoid} onChange={(v) => set("avoid", v)} max={500} hint="أشكال أو أساليب لا تناسب علامتك." />
                </>
              )}

              {step === 4 && (
                <>
                  <Options label="الميزانية المتوقعة" optional cols={2} items={BUDGETS} value={d.budget} onChange={(v) => set("budget", v as string)} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <TextField label="متى تريد البدء؟" optional type="date" value={d.start} onChange={(v) => set("start", v)} />
                    <TextField label="موعد التسليم المطلوب" optional type="date" value={d.deadline} onChange={(v) => set("deadline", v)} />
                  </div>
                  <SelectField
                    label="كيف عرفتني؟"
                    optional
                    value={SOURCES.find(([, v]) => v === d.source)?.[0] ?? ""}
                    onChange={(v) => set("source", SOURCES.find(([l]) => l === v)?.[1] ?? "")}
                    options={SOURCES.map(([l]) => l)}
                  />
                  <AreaField label="أي شيء آخر تريد إضافته؟" optional value={d.notes} onChange={(v) => set("notes", v)} max={800} />
                </>
              )}

              {step === 5 && (
                <>
                  {sections.map((rows, i) => {
                    const filled = rows.filter(([, v]) => v && v.trim());
                    return (
                      <div key={i} className="rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
                          <span className="font-semibold">
                            <span className="text-white/40">{i + 1}. </span>
                            {STEPS[i].title}
                          </span>
                          <button type="button" onClick={() => go(i)} className={`rounded-full border border-white/15 px-3 py-1 text-xs hover:border-white/50 ${focusRing}`}>
                            تعديل
                          </button>
                        </div>
                        {filled.length ? (
                          <dl className="divide-y divide-white/5">
                            {filled.map(([k, v]) => (
                              <div key={k} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[11rem_1fr] sm:gap-4">
                                <dt className="text-white/45">{k}</dt>
                                <dd className="whitespace-pre-wrap break-words text-white/90">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="px-5 py-4 text-sm text-white/40">لم تتم الإجابة.</p>
                        )}
                      </div>
                    );
                  })}
                  <div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={d.consent}
                      aria-describedby="consent-h"
                      onClick={() => set("consent", !d.consent)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-start ${focusRing} ${
                        E.consent ? "border-accent/70" : d.consent ? "border-white/25" : "border-white/10"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
                          d.consent ? "border-accent bg-accent text-black" : "border-white/30"
                        }`}
                      >
                        {d.consent ? "✓" : ""}
                      </span>
                      <span className="text-sm leading-relaxed text-white/80">
                        أوافق على أن يتواصل معي يوسف رحاب بخصوص هذا الطلب. لن تستخدم بياناتي لأي غرض آخر.
                      </span>
                    </button>
                    <Help id="consent-h" error={E.consent} />
                  </div>
                </>
              )}

              {sendError && (
                <p role="alert" className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
                  {sendError}
                </p>
              )}
            </div>

            {/* Footer navigation (sticky on phones) */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-b-[2rem] border-t border-white/10 bg-[#0b0b0b]/95 px-6 py-4 backdrop-blur md:static md:px-10 md:py-6">
              {step > 0 ? (
                <button type="button" onClick={() => go(step - 1)} className={`rounded-full px-4 py-2.5 text-sm text-white/60 hover:text-white ${focusRing}`}>
                  → السابق
                </button>
              ) : (
                <span className="text-xs text-white/35">الحقول المعلمة بـ * مطلوبة</span>
              )}
              <button
                type="submit"
                disabled={sending}
                className={`group inline-flex items-center gap-3 rounded-full bg-accent py-1.5 pe-1.5 ps-6 text-sm font-bold text-accent-foreground transition hover:brightness-110 disabled:opacity-60 ${focusRing}`}
              >
                {step < STEPS.length - 2 ? "التالي" : step === STEPS.length - 2 ? "راجع إجاباتك" : sending ? "جار الإرسال…" : "أرسل الطلب"}
                <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:-rotate-45">
                  ↖
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
