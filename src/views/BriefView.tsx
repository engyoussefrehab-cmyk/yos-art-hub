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
import { Pill, StudioSectionHero, container, focusRing } from "@/components/studio";
import { AR } from "@/components/studio-site";
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

const asciiDigits = (value: string) => value.replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) & 15));

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
  "w-full rounded-lg border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground transition-colors focus:bg-card focus:outline-none";
const inputCls = (err?: string) =>
  `${inputBase} ${err ? "border-accent/70 focus:border-accent" : "border-border hover:border-accent/70 focus:border-accent"}`;

function Label({ htmlFor, id, children, required, optional }: { htmlFor?: string; id?: string; children: ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} id={id} className="mb-2.5 flex items-baseline gap-2 text-[15px] font-semibold text-foreground">
      {children}
      {required && <span className="text-accent" aria-hidden>*</span>}
      {optional && <span className="text-xs font-normal text-muted-foreground">اختياري</span>}
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
      <p id={id} className="mt-2 text-xs leading-relaxed text-muted-foreground">
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
        aria-required={required || undefined}
        aria-describedby={hint || error ? `${id}-h` : undefined}
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
          <p id={`${id}-h`} className="text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : (
          <span id={`${id}-h`} />
        )}
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground" dir="ltr">
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
          aria-describedby={error ? `${id}-h` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls(error)} appearance-none pe-10`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-card">
              {o}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground">
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
    <div role="group" aria-labelledby={id} aria-invalid={!!error} aria-describedby={hint || error ? `${id}-h` : undefined}>
      <Label id={id} required={required} optional={optional}>
        {label}
      </Label>
      {hint && !error && <p id={`${id}-h`} className="-mt-1 mb-3 text-xs text-muted-foreground">{hint}</p>}
      <div className={`grid grid-cols-1 gap-2.5 ${grid}`}>
        {items.map(([title, desc]) => {
          const active = on(title);
          return (
            <button
              key={title}
              type="button"
              role={multi ? "checkbox" : undefined}
              aria-checked={multi ? active : undefined}
              aria-pressed={multi ? undefined : active}
              onClick={() => toggle(title)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-start transition-colors ${focusRing} ${
                active ? "border-accent bg-accent/[0.08]" : "border-border bg-background hover:border-accent/70"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] ${
                  multi ? "rounded-md" : "rounded-full"
                } ${active ? "border-accent bg-accent text-accent-foreground" : "border-border"}`}
              >
                {active ? "✓" : ""}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-foreground">{title}</span>
                {desc && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{desc}</span>}
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
      {hint && <p className="-mt-1 mb-3 text-xs text-muted-foreground">{hint}</p>}
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
              className={`min-h-11 rounded-full border px-4 py-2 text-sm transition-colors ${focusRing} ${
                active ? "border-accent bg-accent font-semibold text-accent-foreground" : "border-border text-muted-foreground hover:border-accent"
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
      <span className="shrink-0 text-xs font-semibold text-muted-foreground">{children}</span>
      <span className="h-px flex-1 bg-cream" />
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
  const [draftReady, setDraftReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);
  const focusError = useRef(false);

  // Restore a saved draft (this browser only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { d: Data; step: number; maxStep: number };
        const draft = { ...EMPTY, ...saved.d, hp: "", consent: false };
        const current = Math.max(0, Math.min(saved.step ?? 0, STEPS.length - 1));
        const furthest = Math.max(current, Math.min(saved.maxStep ?? 0, STEPS.length - 1));
        if (furthest > 0 || JSON.stringify(draft) !== JSON.stringify(EMPTY)) {
          setD(draft);
          setStep(current);
          setMaxStep(furthest);
          setRestored(true);
        }
      }
    } catch {
      /* ignore */
    }
    setDraftReady(true);
  }, []);
  useEffect(() => {
    if (!draftReady || done) return;
    try {
      const draft = { ...d, hp: "", consent: false };
      if (step === 0 && maxStep === 0 && JSON.stringify(draft) === JSON.stringify(EMPTY)) {
        localStorage.removeItem(DRAFT_KEY);
      } else {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ d: draft, step, maxStep }));
      }
    } catch {
      /* ignore */
    }
  }, [d, step, maxStep, done, draftReady]);

  useEffect(() => {
    if (focusError.current) {
      focusError.current = false;
      focusHeading.current = false;
      formRef.current?.querySelector<HTMLElement>('input[aria-invalid="true"], select[aria-invalid="true"], button[aria-invalid="true"], [role="group"][aria-invalid="true"] button')?.focus();
    } else if (focusHeading.current) {
      focusHeading.current = false;
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [step, errors]);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setD((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (i: number): Errors => {
    const e: Errors = {};
    if (i === 0) {
      if (d.name.trim().length < 2) e.name = "اكتب اسمك.";
      const phone = asciiDigits(d.phone.trim());
      const phoneDigits = phone.replace(/\D/g, "");
      if (!phoneDigits && !d.email.trim()) e.phone = "أضف رقم واتساب أو بريدا إلكترونيا على الأقل.";
      if (phone && phoneDigits.length < 7) e.phone = "تأكد من رقم الهاتف.";
      if (d.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = "تأكد من البريد الإلكتروني.";
    }
    if (i === 1 && !d.sector) e.sector = "اختر مجال نشاطك.";
    if (i === 2 && d.services.length === 0) e.services = "اختر خدمة واحدة على الأقل.";
    if (i === 5 && !d.consent) e.consent = "يلزم الموافقة لإرسال الطلب.";
    return e;
  };

  const go = (i: number) => {
    if (i !== step) focusHeading.current = true;
    setStep(i);
    setSendError(null);
  };
  const next = () => {
    const e = validate(step);
    focusError.current = Object.keys(e).length > 0;
    setErrors(e);
    if (focusError.current) return;
    const n = Math.min(step + 1, STEPS.length - 1);
    setMaxStep((m) => Math.max(m, n));
    go(n);
  };

  const fullPhone = d.phone.trim() ? `${d.dial} ${asciiDigits(d.phone.trim())}`.trim() : "";

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
    if (sending) return;
    for (let i = 0; i < STEPS.length; i++) {
      const e = validate(i);
      if (Object.keys(e).length) {
        focusError.current = true;
        setErrors(e);
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
    go(0);
    setMaxStep(0);
    setRestored(false);
  };

  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  /* ───────────────────────── success */
  if (done)
    return (
      <section className={`${container} pb-28 pt-10 md:pb-40 md:pt-16`}>
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 text-center md:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">✓</div>
          <h1 className="mt-6 font-display text-3xl font-bold md:text-[2.5rem]">شكرا {d.name.split(" ")[0]}، وصلني طلبك.</h1>
          <p className="mx-auto mt-4 max-w-xl leading-[1.9] text-muted-foreground">سأراجع تفاصيل مشروعك بعناية وأعود إليك قريبا.</p>
          <ol className="mt-10 grid gap-3 text-start sm:grid-cols-3">
            {[
              ["خلال ٢٤ ساعة", "أراجع طلبك وأتواصل معك."],
              ["مكالمة قصيرة", "نناقش التفاصيل ونجيب عن أسئلتك."],
              ["عرض السعر", "يصلك عرض واضح بالمدة والتكلفة."],
            ].map(([t, x], i) => (
              <li key={t} className="rounded-2xl border border-border bg-background p-5">
                <span className="font-display text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-2 font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{x}</div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Pill href={contact.whatsapp_url} newTab variant="light">
              تواصل على واتساب
            </Pill>
            <a href="/projects" className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-bold text-foreground hover:border-accent">تصفح الأعمال ←</a>
          </div>
        </div>
      </section>
    );

  /* ───────────────────────── form */
  const E = errors;
  return (
    <div className="brief-page">
      <StudioSectionHero
        label="نموذج المشروع"
        title="أخبرني عن مشروعك"
        intro="إجاباتك تساعدني على فهم مشروعك وتقديم عرض سعر دقيق ومناسب. النموذج يستغرق حوالي ٥ دقائق، وتقدر تكمله لاحقًا من نفس المتصفح."
      >
        <a href={contact.whatsapp_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-accent hover:underline">تفضّل واتساب؟ راسلني ←</a>
      </StudioSectionHero>
      <section className={`${container} pb-16 pt-8 md:pb-24 md:pt-12`}>

      {restored && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-sm">
          <span className="text-muted-foreground">أكملنا من حيث توقفت آخر مرة.</span>
          <button type="button" onClick={reset} className={`text-muted-foreground underline-offset-4 hover:text-foreground hover:underline ${focusRing}`}>
            ابدأ من جديد
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Step rail (desktop) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">التقدم</span>
              <span className="font-semibold tabular-nums">{pct}٪</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream">
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
                        state === "current" ? "bg-cream" : canGo ? "hover:bg-background" : ""
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                          state === "done"
                            ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                            : state === "current"
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {state === "done" ? "✓" : AR(i + 1)}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold ${state === "todo" ? "text-muted-foreground" : "text-foreground"}`}>{s.title}</span>
                        <span className="block text-xs text-muted-foreground">{s.desc}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              تحفظ إجاباتك تلقائيا على هذا الجهاز، فيمكنك الإكمال لاحقا.
              <a href={contact.whatsapp_url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-muted-foreground hover:text-foreground">
                تفضل الحديث مباشرة؟ راسلني على واتساب ↖
              </a>
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="lg:col-span-8">
          {/* Mobile progress */}
          <progress className="brief-progress mb-4 block h-1.5 w-full overflow-hidden rounded-full lg:hidden" value={step + 1} max={STEPS.length} aria-label={`التقدم: الخطوة ${AR(step + 1)} من ${AR(STEPS.length)}`} />

          <form
            ref={formRef}
            aria-labelledby="brief-step-title"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < STEPS.length - 1) next();
              else void submit();
            }}
            noValidate
            className="rounded-xl border border-border bg-card"
          >
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={d.hp} onChange={(e) => set("hp", e.target.value)} />

            <div className="border-b border-border px-4 py-5 sm:px-6 md:px-10 md:py-8">
              <div className="text-xs font-semibold text-accent">
                الخطوة {AR(step + 1)} من {AR(STEPS.length)}
              </div>
              <h2 id="brief-step-title" ref={headingRef} tabIndex={-1} className="mt-2 scroll-mt-24 font-display text-3xl font-bold">{STEPS[step].title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{INTROS[step]}</p>
            </div>

            <div className="space-y-7 px-4 py-6 sm:px-6 md:px-10 md:py-10">
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
                            <option key={c} value={c} className="bg-card">
                              {c}
                            </option>
                          ))}
                          <option value="" className="bg-card">
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
                      <div key={i} className="rounded-2xl border border-border">
                        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                          <span className="font-semibold">
                            <span className="text-muted-foreground">{i + 1}. </span>
                            {STEPS[i].title}
                          </span>
                          <button type="button" onClick={() => go(i)} className={`rounded-full border border-border px-3 py-1 text-xs hover:border-accent ${focusRing}`}>
                            تعديل
                          </button>
                        </div>
                        {filled.length ? (
                          <dl className="divide-y divide-border">
                            {filled.map(([k, v]) => (
                              <div key={k} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[11rem_1fr] sm:gap-4">
                                <dt className="text-muted-foreground">{k}</dt>
                                <dd className="whitespace-pre-wrap break-words text-foreground">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <p className="px-5 py-4 text-sm text-muted-foreground">لم تتم الإجابة.</p>
                        )}
                      </div>
                    );
                  })}
                  <div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={d.consent}
                      aria-invalid={!!E.consent}
                      aria-describedby={E.consent ? "consent-h" : undefined}
                      onClick={() => set("consent", !d.consent)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-start ${focusRing} ${
                        E.consent ? "border-accent/70" : d.consent ? "border-border" : "border-border"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
                          d.consent ? "border-accent bg-accent text-accent-foreground" : "border-border"
                        }`}
                      >
                        {d.consent ? "✓" : ""}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground">
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
            <div className="brief-actions sticky bottom-0 z-30 flex items-center justify-between gap-2 rounded-b-xl border-t border-border bg-card px-3 pt-2 sm:px-6 md:static md:px-10 md:py-5">
              {step > 0 ? (
                <button type="button" onClick={() => go(step - 1)} className={`min-h-11 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground ${focusRing}`}>
                  → السابق
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">الحقول المعلمة بـ * مطلوبة</span>
              )}
              <button
                type="submit"
                disabled={sending}
                className={`group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-accent py-1.5 pe-1.5 ps-4 text-sm font-bold text-accent-foreground transition hover:brightness-110 disabled:opacity-60 ${focusRing}`}
              >
                {step < STEPS.length - 2 ? "التالي" : step === STEPS.length - 2 ? "راجع إجاباتك" : sending ? "جار الإرسال…" : "أرسل الطلب"}
                <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-current text-accent-foreground transition-transform group-hover:-rotate-45">
                  ↖
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
      </section>
    </div>
  );
}
