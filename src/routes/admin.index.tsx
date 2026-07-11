import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Newspaper,
  Briefcase,
  Sparkles,
  Inbox,
  FileText,
  Image as ImageIcon,
  Plus,
  ArrowLeft,
} from "lucide-react";

type Stats = {
  articles: number;
  articlesPublished: number;
  articlesDraft: number;
  projects: number;
  services: number;
  pages: number;
  messagesUnread: number;
  media: number;
};

const initial: Stats = {
  articles: 0,
  articlesPublished: 0,
  articlesDraft: 0,
  projects: 0,
  services: 0,
  pages: 0,
  messagesUnread: 0,
  media: 0,
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowLeft className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      {hint && <div className="mt-2 text-[11px] text-muted-foreground/80">{hint}</div>}
    </Link>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm hover:border-primary hover:text-primary"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

function AdminHome() {
  const [stats, setStats] = useState<Stats>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const [articles, projects, services, pages, messages, media] = await Promise.all([
        supabase.from("insight_articles").select("status", { count: "exact", head: false }),
        supabase.from("portfolio_projects").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("pages").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread"),
        supabase.from("media_assets").select("id", { count: "exact", head: true }),
      ]);
      if (cancel) return;
      const rows = (articles.data ?? []) as { status: string }[];
      const published = rows.filter((r) => r.status === "published").length;
      const draft = rows.filter((r) => r.status === "draft").length;
      setStats({
        articles: articles.count ?? rows.length,
        articlesPublished: published,
        articlesDraft: draft,
        projects: projects.count ?? 0,
        services: services.count ?? 0,
        pages: pages.count ?? 0,
        messagesUnread: messages.count ?? 0,
        media: media.count ?? 0,
      });
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">أهلاً بك</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            نظرة سريعة على محتوى الموقع. كل شيء قابل للتعديل من هذه اللوحة دون لمس الكود.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAction to="/admin/insights/new" label="مقال جديد" />
          <QuickAction to="/admin/portfolio" label="مشروع جديد" />
          <QuickAction to="/admin/services" label="خدمة جديدة" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Newspaper}
          label="إجمالي المقالات"
          value={loading ? 0 : stats.articles}
          hint={`${stats.articlesPublished} منشور · ${stats.articlesDraft} مسودة`}
          href="/admin/insights"
        />
        <StatCard
          icon={Briefcase}
          label="مشاريع البرتفوليو"
          value={loading ? 0 : stats.projects}
          href="/admin/portfolio"
        />
        <StatCard
          icon={Sparkles}
          label="الخدمات"
          value={loading ? 0 : stats.services}
          href="/admin/services"
        />
        <StatCard
          icon={FileText}
          label="الصفحات"
          value={loading ? 0 : stats.pages}
          href="/admin/pages"
        />
        <StatCard
          icon={Inbox}
          label="رسائل غير مقروءة"
          value={loading ? 0 : stats.messagesUnread}
          href="/admin/messages"
        />
        <StatCard
          icon={ImageIcon}
          label="ملفات في مكتبة الوسائط"
          value={loading ? 0 : stats.media}
          href="/admin/media"
        />
      </div>

      <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-6 text-sm text-muted-foreground">
        <div className="mb-1 font-medium text-foreground">المرحلة القادمة</div>
        هذه الواجهة تعرض حالياً الإحصائيات الأساسية. ستُضاف قوائم النشاط الحديث،
        الأنشطة المجدولة، ولوحات AI في المرحلة التالية.
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});
