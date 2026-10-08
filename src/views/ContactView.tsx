import { useId, useRef, useState, type FormEvent } from "react";
import { WEB3FORMS_ACCESS_KEY } from "@/lib/site";
import { z } from "zod";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";

export function ContactView() {
  const { t, lang } = useLang();
  return (
    <section className="flex-1 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("contact_kicker")}</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-[1.05]">
              {t("contact_title_a")}<br /> <span className="text-accent">{t("contact_title_b")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">{t("contact_lede")}</p>
            <div className="mt-8 space-y-3">
              <ContactCard label={t("contact_wa_label")} value="+20 103 036 5405" href="/go/wa" arrow={lang === "ar" ? "←" : "→"} />
              <ContactCard label={t("contact_email_label")} value="info@yrstudio.art" href="mailto:info@yrstudio.art" arrow={lang === "ar" ? "←" : "→"} />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <Mini n={lang === "ar" ? "+٨" : "8+"} labelKey="stat_years_short" />
              <Mini n={lang === "ar" ? "+٢٥٠" : "250+"} labelKey="stat_brand_short" />
              <Mini n={lang === "ar" ? "+٢٠" : "20+"} labelKey="stat_sector_short" />
            </div>
          </div>
          <div className="md:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function Mini({ n, labelKey }: { n: string; labelKey: DictKey }) {
  const { t } = useLang();
  return <div><div className="font-display text-3xl font-bold">{n}</div><div className="mt-1 text-xs text-white/60">{t(labelKey)}</div></div>;
}

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message" | "call_date", string>>;

function ContactForm() {
  const { t, lang } = useLang();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [spamNotice, setSpamNotice] = useState(false);
  const mountedAt = useRef(Date.now());
  const lastSubmitAt = useRef(0);

  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const budgetId = useId();
  const ptypeId = useId();
  const callDateId = useId();
  const callTimeId = useId();
  const callTzId = useId();

  const schema = z.object({
    name: z.string().trim().min(2, t("err_name")).max(100, t("err_name_long")),
    email: z.string().trim().email(t("err_email")).max(255),
    subject: z.string().trim().min(2, t("err_subject")).max(150),
    message: z.string().trim().min(10, t("err_msg_short")).max(2000, t("err_msg_long")),
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement)?.value;
    const now = Date.now();
    if (honeypot || now - mountedAt.current < 2500 || now - lastSubmitAt.current < 8000) {
      setSpamNotice(true);
      lastSubmitAt.current = now;
      return;
    }
    lastSubmitAt.current = now;
    setSpamNotice(false);
    setSendError(null);
    const budget = (form.elements.namedItem("budget") as HTMLSelectElement)?.value || "";
    const project_type = (form.elements.namedItem("project_type") as HTMLSelectElement)?.value || "";
    const rawMessage = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    const extras: string[] = [];
    if (project_type) extras.push(`${lang === "ar" ? "نوع المشروع" : "Project type"}: ${project_type}`);
    if (budget) extras.push(`${lang === "ar" ? "الميزانيّة" : "Budget"}: ${budget}`);
    const messageWithExtras = extras.length ? `${rawMessage}\n\n---\n${extras.join("\n")}` : rawMessage;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: messageWithExtras,
      call_date: (form.elements.namedItem("call_date") as HTMLInputElement)?.value || "",
      call_time: (form.elements.namedItem("call_time") as HTMLInputElement)?.value || "",
      call_tz: (form.elements.namedItem("call_tz") as HTMLInputElement)?.value || "",
    };
    const result = schema.safeParse(data);
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      // Focus first invalid field
      const firstKey = Object.keys(fe)[0];
      const idMap: Record<string, string> = { name: nameId, email: emailId, subject: subjectId, message: messageId };
      const el = firstKey && idMap[firstKey] ? document.getElementById(idMap[firstKey]) : null;
      el?.focus();
      return;
    }
    if (data.call_date) {
      const picked = new Date(`${data.call_date}T${data.call_time || "23:59"}`);
      if (!Number.isNaN(picked.getTime()) && picked.getTime() < Date.now()) {
        setErrors({ call_date: t("err_call_date_past") });
        return;
      }
    }
    setErrors({});
    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          from_name: "yrstudio.art",
          ...result.data,
          subject: `[yrstudio.art] ${result.data.subject}`,
          replyto: result.data.email,
          botcheck: (form.elements.namedItem("website") as HTMLInputElement)?.value || "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(String(res.status));
      setSent(true);
      form.reset();
    } catch {
      setSendError(lang === "ar" ? "تعذّر الإرسال، حاول لاحقًا." : "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

  return (
    <form onSubmit={onSubmit} noValidate dir={lang === "ar" ? "rtl" : "ltr"} aria-labelledby="contact-form-title" className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
      <div className="mb-6">
        <h2 id="contact-form-title" className="font-display text-2xl font-bold text-white">{t("form_title")}</h2>
        <p className="mt-1 text-sm text-white/60">{t("form_sub")}</p>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id={nameId} label={t("f_name")} name="name" error={errors.name} autoComplete="name" />
        <Field id={emailId} label={t("f_email")} name="email" type="email" dir="ltr" error={errors.email} autoComplete="email" />
      </div>
      <div className="mt-4">
        <Field id={subjectId} label={t("f_subject")} name="subject" error={errors.subject} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={ptypeId} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_project_type")}</label>
          <select id={ptypeId} name="project_type" defaultValue="" className={`${inputClass} [color-scheme:dark]`}>
            <option value="">{t("f_project_type_placeholder")}</option>
            <option value={t("ptype_identity")}>{t("ptype_identity")}</option>
            <option value={t("ptype_logo")}>{t("ptype_logo")}</option>
            <option value={t("ptype_profile")}>{t("ptype_profile")}</option>
            <option value={t("ptype_social")}>{t("ptype_social")}</option>
            <option value={t("ptype_other")}>{t("ptype_other")}</option>
          </select>
        </div>
        <div>
          <label htmlFor={budgetId} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_budget")}</label>
          <select id={budgetId} name="budget" defaultValue="" className={`${inputClass} [color-scheme:dark]`}>
            <option value="">{t("f_budget_placeholder")}</option>
            <option value={t("budget_under_1k")}>{t("budget_under_1k")}</option>
            <option value={t("budget_1k_3k")}>{t("budget_1k_3k")}</option>
            <option value={t("budget_3k_8k")}>{t("budget_3k_8k")}</option>
            <option value={t("budget_8k_plus")}>{t("budget_8k_plus")}</option>
            <option value={t("budget_unsure")}>{t("budget_unsure")}</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor={messageId} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_message")}</label>
        <textarea
          id={messageId}
          name="message" rows={6} maxLength={2000}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${messageId}-err` : undefined}
          className={inputClass}
          placeholder={t("f_message_placeholder")}
        />
        {errors.message && <p id={`${messageId}-err`} className="mt-1 text-xs text-red-400">{errors.message}</p>}
      </div>
      <details className="group mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 open:pb-6">
        <summary className="flex cursor-pointer list-none items-start gap-2 focus:outline-none">
          <span aria-hidden="true" className="text-lg leading-none">📞</span>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-white">{t("f_call_title")}</h3>
            <p className="mt-1 text-xs text-white/60">{t("f_call_sub")}</p>
          </div>
          <span aria-hidden className="mt-1 text-xs text-white/50 transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor={callDateId} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_call_date")}</label>
            <input id={callDateId} name="call_date" type="date" min={new Date().toISOString().slice(0, 10)} dir="ltr" className={`${inputClass} [color-scheme:dark]`} />
            {errors.call_date && <p className="mt-1 text-xs text-red-400">{errors.call_date}</p>}
          </div>
          <div>
            <label htmlFor={callTimeId} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_call_time")}</label>
            <input id={callTimeId} name="call_time" type="time" dir="ltr" className={`${inputClass} [color-scheme:dark]`} />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor={callTzId} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_call_tz")}</label>
          <input id={callTzId} name="call_tz" type="text" maxLength={120} placeholder={t("f_call_tz_placeholder")} className={inputClass} />
        </div>
      </details>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4" aria-live="polite">
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {sending ? (lang === "ar" ? "جارٍ الإرسال..." : "Sending...") : t("f_send")}
        </button>
        {sent && <span className="text-xs text-accent">{t("f_sent")}</span>}
        {spamNotice && <span className="text-xs text-red-400">{t("f_spam")}</span>}
        {sendError && <span className="text-xs text-red-400" role="alert">{sendError}</span>}
      </div>
    </form>
  );
}

function Field({ id, label, name, type = "text", dir, error, autoComplete }: { id: string; label: string; name: string; type?: string; dir?: "ltr" | "rtl"; error?: string; autoComplete?: string }) {
  const errId = error ? `${id}-err` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-white/60">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        dir={dir}
        maxLength={255}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={errId}
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {error && <p id={errId} className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ContactCard({ label, value, href, arrow }: { label: string; value: string; href: string; arrow: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-accent hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
      <div>
        <div className="text-xs uppercase tracking-widest opacity-60">{label}</div>
        <div className="mt-1 font-display text-lg font-bold" dir="ltr">{value}</div>
      </div>
      <span className="text-xl">{arrow}</span>
    </a>
  );
}
