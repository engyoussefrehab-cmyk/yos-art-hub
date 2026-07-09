import { useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { useLang } from "@/i18n/use-lang";
import type { DictKey } from "@/i18n/dictionary";

export function ContactView() {
  const { t, lang } = useLang();
  return (
    <section className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">{t("contact_kicker")}</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-[1.05]">
              {t("contact_title_a")}<br /> <span className="text-accent">{t("contact_title_b")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">{t("contact_lede")}</p>
            <div className="mt-8 space-y-3">
              <ContactCard label={t("contact_wa_label")} value="+20 103 036 5405" href="https://wa.me/201030365405" arrow={lang === "ar" ? "←" : "→"} />
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

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

function ContactForm() {
  const { t, lang } = useLang();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [spamNotice, setSpamNotice] = useState(false);
  const mountedAt = useRef(Date.now());
  const lastSubmitAt = useRef(0);

  const schema = z.object({
    name: z.string().trim().min(2, t("err_name")).max(100, t("err_name_long")),
    email: z.string().trim().email(t("err_email")).max(255),
    subject: z.string().trim().min(2, t("err_subject")).max(150),
    message: z.string().trim().min(10, t("err_msg_short")).max(2000, t("err_msg_long")),
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
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
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    const result = schema.safeParse(data);
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    const nameLabel = t("mail_name_label");
    const emailLabel = t("mail_email_label");
    const body = `${nameLabel}: ${result.data.name}\n${emailLabel}: ${result.data.email}\n\n${result.data.message}`;
    const mailto = `mailto:info@yrstudio.art?subject=${encodeURIComponent(result.data.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
    form.reset();
  };

  return (
    <form onSubmit={onSubmit} noValidate dir={lang === "ar" ? "rtl" : "ltr"} className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white">{t("form_title")}</h2>
        <p className="mt-1 text-sm text-white/60">{t("form_sub")}</p>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label={t("f_name")} name="name" error={errors.name} />
        <Field label={t("f_email")} name="email" type="email" dir="ltr" error={errors.email} />
      </div>
      <div className="mt-4">
        <Field label={t("f_subject")} name="subject" error={errors.subject} />
      </div>
      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/60">{t("f_message")}</label>
        <textarea
          name="message" rows={6} maxLength={2000}
          className="mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          placeholder={t("f_message_placeholder")}
        />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button type="submit" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">{t("f_send")}</button>
        {sent && <span className="text-xs text-accent">{t("f_sent")}</span>}
        {spamNotice && <span className="text-xs text-red-400">{t("f_spam")}</span>}
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", dir, error }: { label: string; name: string; type?: string; dir?: "ltr" | "rtl"; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/60">{label}</label>
      <input name={name} type={type} dir={dir} maxLength={255}
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40" />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ContactCard({ label, value, href, arrow }: { label: string; value: string; href: string; arrow: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-accent hover:text-primary">
      <div>
        <div className="text-xs uppercase tracking-widest opacity-60">{label}</div>
        <div className="mt-1 font-display text-lg font-bold" dir="ltr">{value}</div>
      </div>
      <span className="text-xl">{arrow}</span>
    </a>
  );
}
