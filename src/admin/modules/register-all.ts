/**
 * Module bootstrap — imported once by the admin shell. Each module lives
 * in its own folder and self-registers on import. Adding a new module =
 * create the folder + import it here.
 *
 * Modules registered here map to existing legacy routes so nothing breaks
 * while the new registry-driven shell takes over the navigation surface.
 */

import { registerModule } from "@/admin/lib/module-registry";
import { registerCommand } from "@/admin/lib/command-registry";

// Entity registrations — importing these files runs registerEntity().
import "@/admin/entities/project";
import "@/admin/entities/article";
import "@/admin/entities/service";



let bootstrapped = false;

export function bootstrapAdminModules(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  // Content ---------------------------------------------------------------
  registerModule({
    key: "dashboard",
    label: "Dashboard",
    route: "/admin",
    icon: "LayoutDashboard",
    section: "content",
    order: 0,
    permissions: { view: ["admin", "editor", "author", "reviewer"] },
  });
  registerModule({
    key: "pages",
    label: "Pages",
    route: "/admin/pages",
    icon: "FileText",
    section: "content",
    order: 10,
    entityKey: "page",
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "portfolio",
    label: "Projects",
    route: "/admin/portfolio",
    icon: "Briefcase",
    section: "content",
    order: 20,
    entityKey: "portfolio_project",
    permissions: { view: ["admin", "editor", "author"] },
    quickActions: [
      { id: "portfolio.new", label: "New Project", to: "/admin/portfolio/new", icon: "Plus" },
    ],
  });
  registerModule({
    key: "insights",
    label: "Articles",
    route: "/admin/insights",
    icon: "Newspaper",
    section: "content",
    order: 30,
    entityKey: "insight_article",
    permissions: { view: ["admin", "editor", "author"] },
    quickActions: [
      { id: "insights.new", label: "New Article", to: "/admin/insights/new", icon: "Plus" },
    ],
  });
  registerModule({
    key: "services",
    label: "Services",
    route: "/admin/services",
    icon: "Sparkles",
    section: "content",
    order: 40,
    entityKey: "service",
    permissions: { view: ["admin", "editor"] },
    quickActions: [
      { id: "services.new", label: "New Service", to: "/admin/services/new", icon: "Plus" },
    ],
  });

  // Design ----------------------------------------------------------------
  registerModule({
    key: "sections",
    label: "Site Sections",
    route: "/admin/sections",
    icon: "LayoutTemplate",
    section: "design",
    order: 50,
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "menus",
    label: "Navigation",
    route: "/admin/menus",
    icon: "Menu",
    section: "design",
    order: 60,
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "testimonials",
    label: "Testimonials",
    route: "/admin/testimonials",
    icon: "MessageSquareQuote",
    section: "design",
    order: 70,
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "page-seo",
    label: "Page SEO",
    route: "/admin/page-seo",
    icon: "Search",
    section: "design",
    order: 80,
    permissions: { view: ["admin", "editor"] },
  });

  // Taxonomy --------------------------------------------------------------
  registerModule({
    key: "categories",
    label: "Categories",
    route: "/admin/categories",
    icon: "FolderTree",
    section: "taxonomy",
    order: 90,
    entityKey: "project_category",
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "tags",
    label: "Tags",
    route: "/admin/tags",
    icon: "Tags",
    section: "taxonomy",
    order: 100,
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "media",
    label: "Media",
    route: "/admin/media",
    icon: "Image",
    section: "taxonomy",
    order: 110,
    permissions: { view: ["admin", "editor", "author"] },
  });

  // Operations ------------------------------------------------------------
  registerModule({
    key: "messages",
    label: "Messages",
    route: "/admin/messages",
    icon: "Inbox",
    section: "operations",
    order: 120,
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "seo",
    label: "SEO Manager",
    route: "/admin/seo",
    icon: "Compass",
    section: "operations",
    order: 130,
    permissions: { view: ["admin", "editor"] },
  });
  registerModule({
    key: "indexing",
    label: "Indexing",
    route: "/admin/indexing",
    icon: "Globe",
    section: "operations",
    order: 140,
    permissions: { view: ["admin"] },
  });
  registerModule({
    key: "audit",
    label: "Audit Log",
    route: "/admin/audit",
    icon: "ShieldCheck",
    section: "operations",
    order: 150,
    permissions: { view: ["admin"] },
  });

  // System ----------------------------------------------------------------
  registerModule({
    key: "settings",
    label: "Settings",
    route: "/admin/settings",
    icon: "Settings",
    section: "system",
    order: 200,
    permissions: { view: ["admin"] },
  });
  registerModule({
    key: "profile",
    label: "Profile",
    route: "/admin/profile",
    icon: "UserCircle2",
    section: "system",
    order: 210,
    permissions: { view: ["admin", "editor", "author", "reviewer"] },
  });

  // Command palette default commands -------------------------------------
  registerCommand({
    id: "nav.dashboard",
    label: "Go to Dashboard",
    group: "navigate",
    to: "/admin",
    icon: "LayoutDashboard",
    shortcut: "G D",
  });
  registerCommand({
    id: "create.project",
    label: "New Project",
    group: "create",
    to: "/admin/portfolio/new",
    icon: "Plus",
  });
  registerCommand({
    id: "create.article",
    label: "New Article",
    group: "create",
    to: "/admin/insights/new",
    icon: "Plus",
  });
  registerCommand({
    id: "create.service",
    label: "New Service",
    group: "create",
    to: "/admin/services/new",
    icon: "Plus",
  });
  registerCommand({
    id: "open.settings",
    label: "Open Settings",
    group: "settings",
    to: "/admin/settings",
    icon: "Settings",
  });
  registerCommand({
    id: "open.audit",
    label: "Open Audit Log",
    group: "settings",
    to: "/admin/audit",
    icon: "ShieldCheck",
    requires: ["admin"],
  });
  registerCommand({
    id: "open.view-site",
    label: "View Public Site",
    group: "navigate",
    to: "/",
    icon: "ExternalLink",
  });
}
