import { createFileRoute } from "@tanstack/react-router";

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

function ContactPage() {
  return (
    <section className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">تواصل</span>
            <h1 className="mt-3 font-display text-5xl md:text-7xl font-black leading-[1.05]">
              عندك فكرة؟<br /> <span className="text-accent">خلّينا نحوّلها لهوية.</span>
            </h1>
            <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">
              متاح لمشاريع الهوية البصرية والتعاونات الإبداعية في الخليج ومصر والعالم العربي. أرسل تفاصيل مشروعك عبر الوسيلة الأنسب وسنبدأ رحلة بناء علامتك.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div><div className="font-display text-3xl font-black">+٨</div><div className="mt-1 text-xs text-white/60">سنوات خبرة</div></div>
              <div><div className="font-display text-3xl font-black">+٢٥٠</div><div className="mt-1 text-xs text-white/60">علامة تجارية</div></div>
              <div><div className="font-display text-3xl font-black">+٢٠</div><div className="mt-1 text-xs text-white/60">دولة وقطاع</div></div>
            </div>
          </div>
          <div className="md:col-span-5 space-y-4">
            <ContactCard label="واتساب / اتصال" value="+20 103 036 5405" href="https://wa.me/201030365405" />
            <ContactCard label="البريد الإلكتروني" value="youssefrehab@outlook.com" href="mailto:youssefrehab@outlook.com" />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-widest text-white/60">أوقات الرد</div>
              <div className="mt-2 text-lg">خلال ٢٤ ساعة، أيام الأسبوع.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-accent hover:text-primary">
      <div>
        <div className="text-xs uppercase tracking-widest opacity-60">{label}</div>
        <div className="mt-1 font-display text-xl font-bold" dir="ltr">{value}</div>
      </div>
      <span className="text-2xl">←</span>
    </a>
  );
}
