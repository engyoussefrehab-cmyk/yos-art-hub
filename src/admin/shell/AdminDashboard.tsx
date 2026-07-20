/**
 * Widget-based Admin Dashboard — fully bilingual.
 */

import { Suspense } from "react";
import { CountWidget } from "@/admin/widgets/CountWidget";
import RecentActivityWidget from "@/admin/widgets/RecentActivityWidget";
import { listWidgets } from "@/admin/lib/widget-registry";
import { A, useAdminLang } from "@/i18n/admin-lang";

export function AdminDashboard() {
  const registered = listWidgets();
  const { t } = useAdminLang();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t(A.dashboard)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(A.dashboard_intro)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountWidget table="portfolio_projects" label={t(A.kpi_projects)} icon="Briefcase" to="/admin/cms/project" />
        <CountWidget table="insight_articles" label={t(A.kpi_articles)} icon="Newspaper" to="/admin/cms/article" />
        <CountWidget table="services" label={t(A.kpi_services)} icon="Sparkles" to="/admin/cms/service" />
        <CountWidget table="pages" label={t(A.kpi_pages)} icon="FileText" to="/admin/pages" />
        <CountWidget table="contact_messages" label={t(A.kpi_unread_messages)} icon="Inbox" to="/admin/messages" filter={{ column: "status", value: "unread" }} />
        <CountWidget table="media_assets" label={t(A.kpi_media)} icon="Image" to="/admin/media" />
        <CountWidget table="crm_leads" label={t(A.kpi_leads)} icon="Users" />
        <CountWidget table="cms_events" label={t(A.kpi_events_30d)} icon="Activity" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RecentActivityWidget />
        {registered.map((w) => {
          const Comp = w.component;
          return (
            <Suspense
              key={w.id}
              fallback={<div className="rounded-2xl border p-5 text-sm text-muted-foreground">{t(A.loading)}</div>}
            >
              <Comp widgetId={w.id} />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}
