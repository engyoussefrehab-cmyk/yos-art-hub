import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Briefcase,
  Sparkles,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Inbox,
  Search,
  Settings,
  UserCircle2,
  ShieldCheck,
  ExternalLink,
  LogOut,
  Languages,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { A, useAdminLang } from "@/i18n/admin-lang";

type NavItem = { to: string; label: { ar: string; en: string }; icon: React.ComponentType<{ className?: string }> };

const contentItems: NavItem[] = [
  { to: "/admin", label: A.dashboard, icon: LayoutDashboard },
  { to: "/admin/pages", label: A.pages, icon: FileText },
  { to: "/admin/insights", label: A.insights, icon: Newspaper },
  { to: "/admin/portfolio", label: A.portfolio, icon: Briefcase },
  { to: "/admin/services", label: A.services, icon: Sparkles },
];

const taxonomyItems: NavItem[] = [
  { to: "/admin/categories", label: A.categories, icon: FolderTree },
  { to: "/admin/tags", label: A.tags, icon: Tags },
  { to: "/admin/media", label: A.media, icon: ImageIcon },
];

const opsItems: NavItem[] = [
  { to: "/admin/messages", label: A.messages, icon: Inbox },
  { to: "/admin/seo", label: A.seo, icon: Search },
  { to: "/admin/audit", label: A.audit, icon: ShieldCheck },
];

const settingsItems: NavItem[] = [
  { to: "/admin/settings", label: A.settings, icon: Settings },
  { to: "/admin/profile", label: A.profile, icon: UserCircle2 },
];

function NavGroup({ label, items, current }: { label: string; items: NavItem[]; current: string }) {
  const { state } = useSidebar();
  const { t } = useAdminLang();
  const collapsed = state === "collapsed";
  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active =
              item.to === "/admin"
                ? current === "/admin" || current === "/admin/"
                : current === item.to || current.startsWith(item.to + "/");
            const label = t(item.label);
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={active} tooltip={label}>
                  <Link to={item.to} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar({ email }: { email?: string | null }) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const { lang, setLang, t } = useAdminLang();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" side={lang === "ar" ? "right" : "left"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            YR
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{t(A.cms_subtitle)}</span>
              <span className="text-[10px] text-muted-foreground">Yousef Rehab · CMS</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label={t(A.content_group)} items={contentItems} current={currentPath} />
        <NavGroup label={t(A.taxonomy_group)} items={taxonomyItems} current={currentPath} />
        <NavGroup label={t(A.ops_group)} items={opsItems} current={currentPath} />
        <NavGroup label={t(A.settings_group)} items={settingsItems} current={currentPath} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              tooltip={t(A.language)}
            >
              <Languages className="h-4 w-4 shrink-0" />
              <span className="truncate">{lang === "ar" ? "English" : "العربية"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t(A.view_site)}>
              <Link to="/" className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(A.view_site)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => supabase.auth.signOut()}
              tooltip={t(A.sign_out)}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(A.sign_out)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && email && (
          <div className="border-t border-sidebar-border/60 px-3 py-2 text-[11px] text-muted-foreground truncate" title={email}>
            {email}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
