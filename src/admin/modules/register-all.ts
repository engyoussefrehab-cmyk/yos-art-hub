/**
 * Module bootstrap — imported once by the admin shell. Each module lives
 * in its own folder and self-registers on import. Adding a new module =
 * create the folder + import it here.
 */

import { registerModule } from "@/admin/lib/module-registry";
import { registerCommand } from "@/admin/lib/command-registry";
import { L, A } from "@/i18n/admin-lang";

// Entity registrations — importing these files runs registerEntity().
import "@/admin/entities/project";
import "@/admin/entities/article";
import "@/admin/entities/service";
import "@/admin/entities/service-tier";
import "@/admin/entities/service-tier-feature";

let bootstrapped = false;

export function bootstrapAdminModules(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  // Content ---------------------------------------------------------------
  registerModule({
    key: "dashboard",
    label: A.dashboard,
    route: "/admin",
    icon: "LayoutDashboard",
    section: "content",
    order: 0,
    permissions: { view: ["admin", "editor", "author", "reviewer"] },
  });
  registerModule({
    key: "pages",
    label: A.pages,
    route: "/admin/pages",
    icon: "FileText",
    section: "content",
    order: 10,
    entityKey: "page",
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "portfolio",
    label: A.portfolio,
    route: "/admin/cms/project",
    icon: "Briefcase",
    section: "content",
    order: 20,
    entityKey: "project",
    permissions: { view: ["admin", "editor", "author"] },
    quickActions: [
      { id: "portfolio.new", label: L("مشروع جديد", "New Project"), to: "/admin/cms/project/new", icon: "Plus" },
    ],
  });
  registerModule({
    key: "insights",
    label: A.insights,
    route: "/admin/cms/article",
    icon: "Newspaper",
    section: "content",
    order: 30,
    entityKey: "article",
    permissions: { view: ["admin", "editor", "author"] },
    quickActions: [
      { id: "insights.new", label: L("مقال جديد", "New Article"), to: "/admin/cms/article/new", icon: "Plus" },
    ],
  });
  registerModule({
    key: "services",
    label: A.services,
    route: "/admin/cms/service",
    icon: "Sparkles",
    section: "content",
    order: 40,
    entityKey: "service",
    permissions: { view: ["admin", "editor"] },
    quickActions: [
      { id: "services.new", label: L("خدمة جديدة", "New Service"), to: "/admin/cms/service/new", icon: "Plus" },
    ],
  });
  registerModule({
    key: "service-tiers",
    label: L("فئات الخدمات", "Service Tiers"),
    route: "/admin/cms/service_tier",
    icon: "Layers",
    section: "content",
    order: 42,
    entityKey: "service_tier",
    permissions: { view: ["admin", "editor"] },
    quickActions: [
      { id: "service-tier.new", label: L("فئة جديدة", "New Tier"), to: "/admin/cms/service_tier/new", icon: "Plus" },
      { id: "service-tier.page", label: L("محتوى صفحة الفئات", "Page copy"), to: "/admin/service-tier-page", icon: "FileText" },
    ],
  });
  registerModule({
    key: "service-tier-features",
    label: L("مقارنة الفئات", "Tier Comparison"),
    route: "/admin/cms/service_tier_feature",
    icon: "ListChecks",
    section: "content",
    order: 44,
    entityKey: "service_tier_feature",
    permissions: { view: ["admin", "editor"] },
    quickActions: [
      { id: "service-tier-feature.new", label: L("صف مقارنة جديد", "New Comparison Row"), to: "/admin/cms/service_tier_feature/new", icon: "Plus" },
    ],
  });
  registerModule({
    key: "service-tier-page",
    label: L("نصوص صفحة الفئات", "Tiers Page Copy"),
    route: "/admin/service-tier-page",
    icon: "FileText",
    section: "content",
    order: 46,
    permissions: { view: ["admin", "editor"] },
  });

  // Design ----------------------------------------------------------------
  registerModule({ key: "sections", label: A.sections, route: "/admin/sections", icon: "LayoutTemplate", section: "design", order: 50, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "menus", label: A.menus, route: "/admin/menus", icon: "Menu", section: "design", order: 60, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "testimonials", label: A.testimonials, route: "/admin/testimonials", icon: "MessageSquareQuote", section: "design", order: 70, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "clients", label: L("أبرز العملاء", "Selected Clients"), route: "/admin/clients", icon: "Building2", section: "design", order: 75, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "page-seo", label: A.page_seo, route: "/admin/page-seo", icon: "Search", section: "design", order: 80, permissions: { view: ["admin", "editor"] } });

  // Taxonomy --------------------------------------------------------------
  registerModule({ key: "categories", label: A.categories, route: "/admin/categories", icon: "FolderTree", section: "taxonomy", order: 90, entityKey: "project_category", permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "tags", label: A.tags, route: "/admin/tags", icon: "Tags", section: "taxonomy", order: 100, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "media", label: A.media, route: "/admin/media", icon: "Image", section: "taxonomy", order: 110, permissions: { view: ["admin", "editor", "author"] } });

  // Operations ------------------------------------------------------------
  registerModule({ key: "messages", label: A.messages, route: "/admin/messages", icon: "Inbox", section: "operations", order: 120, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "seo", label: A.seo, route: "/admin/seo", icon: "Compass", section: "operations", order: 130, permissions: { view: ["admin", "editor"] } });
  registerModule({ key: "indexing", label: A.indexing, route: "/admin/indexing", icon: "Globe", section: "operations", order: 140, permissions: { view: ["admin"] } });
  registerModule({ key: "audit", label: A.audit, route: "/admin/audit", icon: "ShieldCheck", section: "operations", order: 150, permissions: { view: ["admin"] } });

  // System ----------------------------------------------------------------
  registerModule({ key: "settings", label: A.settings, route: "/admin/settings", icon: "Settings", section: "system", order: 200, permissions: { view: ["admin"] } });
  registerModule({ key: "profile", label: A.profile, route: "/admin/profile", icon: "UserCircle2", section: "system", order: 210, permissions: { view: ["admin", "editor", "author", "reviewer"] } });

  // Command palette default commands -------------------------------------
  registerCommand({ id: "nav.dashboard", label: L("الذهاب إلى الرئيسية", "Go to Dashboard"), group: "navigate", to: "/admin", icon: "LayoutDashboard", shortcut: "G D" });
  registerCommand({ id: "create.project", label: L("مشروع جديد", "New Project"), group: "create", to: "/admin/cms/project/new", icon: "Plus" });
  registerCommand({ id: "create.article", label: L("مقال جديد", "New Article"), group: "create", to: "/admin/cms/article/new", icon: "Plus" });
  registerCommand({ id: "create.service", label: L("خدمة جديدة", "New Service"), group: "create", to: "/admin/cms/service/new", icon: "Plus" });
  registerCommand({ id: "open.settings", label: L("فتح الإعدادات", "Open Settings"), group: "settings", to: "/admin/settings", icon: "Settings" });
  registerCommand({ id: "open.audit", label: L("فتح سجل التدقيق", "Open Audit Log"), group: "settings", to: "/admin/audit", icon: "ShieldCheck", requires: ["admin"] });
  registerCommand({ id: "open.view-site", label: L("عرض الموقع العام", "View Public Site"), group: "navigate", to: "/", icon: "ExternalLink" });
}
