import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل — يوسف رحاب" },
      { name: "description", content: "تواصل مع يوسف رحاب لمشاريع الهوية البصرية والتصميم الإبداعي." },
      { property: "og:title", content: "تواصل — يوسف رحاب" },
      { property: "og:description", content: "متاح لمشاريع الفريلانس والتعاونات." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100, "الاسم طويل جدًا"),
  email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255),
  subject: z.string().trim().min(2, "الموضوع مطلوب").max(150),
  message: z.string().trim().min(10, "الرسالة قصيرة جدًا").max(2000, "الرسالة طويلة جدًا"),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

function ContactPage() {
  return (
    <section className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">تواصل</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-black leading-[1.05]">
              عندك فكرة؟<br /> <span className="text-accent">خلّينا نحوّلها لهوية.</span>
            </h1>
            <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">
              متاح لمشاريع الهوية البصرية والتعاونات الإبداعية في الخليج ومصر والعالم العربي. اختر الوسيلة الأنسب أو أرسل تفاصيل مشروعك عبر النموذج.
            </p>
            <div className="mt-8 space-y-3">
              <ContactCard label="واتساب / اتصال" value="+20 103 036 5405" href="https://wa.me/201030365405" />
              <ContactCard label="البريد الإلكتروني" value="youssefrehab@yrstudio.art" href="mailto:youssefrehab@yrstudio.art" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div><div className="font-display text-3xl font-black">+٨</div><div className="mt-1 text-xs text-white/60">سنوات</div></div>
              <div><div className="font-display text-3xl font-black">+٢٥٠</div><div className="mt-1 text-xs text-white/60">علامة</div></div>
              <div><div className="font-display text-3xl font-black">+٢٠</div><div className="mt-1 text-xs text-white/60">قطاع</div></div>
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

function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [spamNotice, setSpamNotice] = useState(false);
  const mountedAt = useRef(Date.now());
  const lastSubmitAt = useRef(0);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement)?.value;
    const now = Date.now();
    // Bots fill hidden fields, submit instantly, or spam-click
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
    const result = contactSchema.safeParse(data);
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
    const body = `الاسم: ${result.data.name}\nالبريد: ${result.data.email}\n\n${result.data.message}`;
    const mailto = `mailto:youssefrehab@yrstudio.art?subject=${encodeURIComponent(result.data.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
    form.reset();
  };

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white">أرسل تفاصيل مشروعك</h2>
        <p className="mt-1 text-sm text-white/60">سنعود إليك خلال ٢٤ ساعة.</p>
      </div>
      {/* Honeypot — hidden from users, bots often fill it */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        className="hidden" aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="الاسم الكامل" name="name" error={errors.name} />
        <Field label="البريد الإلكتروني" name="email" type="email" dir="ltr" error={errors.email} />
      </div>
      <div className="mt-4">
        <Field label="موضوع المشروع" name="subject" error={errors.subject} />
      </div>
      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/60">تفاصيل المشروع</label>
        <textarea
          name="message"
          rows={6}
          maxLength={2000}
          className="mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          placeholder="احكيلي عن علامتك التجارية، القطاع، والجدول الزمني…"
        />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
        >
          إرسال الرسالة
        </button>
        {sent && <span className="text-xs text-accent">تم فتح بريدك لإكمال الإرسال ✓</span>}
        {spamNotice && <span className="text-xs text-red-400">فضلًا انتظر قليلًا قبل إعادة الإرسال.</span>}
      </div>
    </form>
  );
}

function Field({
  label, name, type = "text", dir, error,
}: { label: string; name: string; type?: string; dir?: "ltr" | "rtl"; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/60">{label}</label>
      <input
        name={name}
        type={type}
        dir={dir}
        maxLength={255}
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function ContactCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-accent hover:text-primary">
      <div>
        <div className="text-xs uppercase tracking-widest opacity-60">{label}</div>
        <div className="mt-1 font-display text-lg font-bold" dir="ltr">{value}</div>
      </div>
      <span className="text-xl">←</span>
    </a>
  );
}
