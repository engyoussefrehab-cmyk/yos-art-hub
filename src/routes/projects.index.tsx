import { createFileRoute, Link } from "@tanstack/react-router";
import { categories } from "@/lib/portfolio-data";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "المشاريع — يوسف رحاب" },
      { name: "description", content: "مشاريع مختارة عبر أربعة تخصصات: الهوية البصرية، الشعارات، ملفات الشركات، والسوشيال ميديا." },
      { property: "og:title", content: "المشاريع — يوسف رحاب" },
      { property: "og:description", content: "استعرض التخصصات والأعمال المختارة." },
    ],
  }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">أعمال مختارة</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-black leading-tight">التخصصات</h1>
        <p className="mt-5 text-lg text-muted-foreground">اختر التخصص الذي تودّ استعراضه — كل قسم يحتوي على أعمال مختارة وتفاصيل كل مشروع.</p>
      </header>
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            to="/projects/$category"
            params={{ category: c.slug }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-cream transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img src={c.cover} alt={c.label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">٠{i + 1}</div>
                <div className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">{c.count}+ عمل</div>
              </div>
              <h2 className="mt-3 font-display text-3xl font-black">{c.label}</h2>
              <p className="mt-2 text-muted-foreground">{c.desc}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                استعرض القسم <span aria-hidden>←</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
