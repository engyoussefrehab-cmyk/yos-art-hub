/**
 * Widget-based Admin Dashboard.
 *
 * Layout is composed from `widget-registry` plus a fixed row of KPI count
 * widgets driven by module metadata. Users will eventually reorder widgets
 * (persisted to `cms_settings_values` under `dashboard.layout`).
 */

import { Suspense } from "react";
import { CountWidget } from "@/admin/widgets/CountWidget";
import RecentActivityWidget from "@/admin/widgets/RecentActivityWidget";
import { listWidgets } from "@/admin/lib/widget-registry";

export function AdminDashboard() {
  const registered = listWidgets();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of the site. Every module can register its own widgets here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountWidget
          table="portfolio_projects"
          label="Projects"
          icon="Briefcase"
          to="/admin/portfolio"
        />
        <CountWidget
          table="insight_articles"
          label="Articles"
          icon="Newspaper"
          to="/admin/insights"
        />
        <CountWidget
          table="services"
          label="Services"
          icon="Sparkles"
          to="/admin/services"
        />
        <CountWidget
          table="pages"
          label="Pages"
          icon="FileText"
          to="/admin/pages"
        />
        <CountWidget
          table="contact_messages"
          label="Unread Messages"
          icon="Inbox"
          to="/admin/messages"
          filter={{ column: "status", value: "unread" }}
        />
        <CountWidget
          table="media_assets"
          label="Media Files"
          icon="Image"
          to="/admin/media"
        />
        <CountWidget
          table="crm_leads"
          label="Leads"
          icon="Users"
        />
        <CountWidget
          table="cms_events"
          label="Events (30d)"
          icon="Activity"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RecentActivityWidget />
        {registered.map((w) => {
          const Comp = w.component;
          return (
            <Suspense
              key={w.id}
              fallback={<div className="rounded-2xl border p-5 text-sm text-muted-foreground">Loading…</div>}
            >
              <Comp widgetId={w.id} />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}
