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

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const contentItems: NavItem[] = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/admin/pages", label: "صفحات الموقع", icon: FileText },
  { to: "/admin/insights", label: "المقالات", icon: Newspaper },
  { to: "/admin/portfolio", label: "المشاريع", icon: Briefcase },
  { to: "/admin/services", label: "الخدمات", icon: Sparkles },
];

const taxonomyItems: NavItem[] = [
  { to: "/admin/categories", label: "التصنيفات", icon: FolderTree },
  { to: "/admin/tags", label: "الوسوم", icon: Tags },
  { to: "/admin/media", label: "مكتبة الوسائط", icon: ImageIcon },
];

const opsItems: NavItem[] = [
  { to: "/admin/messages", label: "الرسائل", icon: Inbox },
  { to: "/admin/seo", label: "مدير SEO", icon: Search },
  { to: "/admin/audit", label: "سجلات التدقيق", icon: ShieldCheck },
];

const settingsItems: NavItem[] = [
  { to: "/admin/settings", label: "إعدادات الموقع", icon: Settings },
  { to: "/admin/profile", label: "الملف الشخصي", icon: UserCircle2 },
];

function NavGroup({ label, items, current }: { label: string; items: NavItem[]; current: string }) {
  const { state } = useSidebar();
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
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                  <Link to={item.to} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
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
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            YR
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">لوحة التحكم</span>
              <span className="text-[10px] text-muted-foreground">Yousef Rehab · CMS</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="المحتوى" items={contentItems} current={currentPath} />
        <NavGroup label="التصنيفات والوسائط" items={taxonomyItems} current={currentPath} />
        <NavGroup label="التشغيل" items={opsItems} current={currentPath} />
        <NavGroup label="الإعدادات" items={settingsItems} current={currentPath} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="عرض الموقع">
              <Link to="/" className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">عرض الموقع</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => supabase.auth.signOut()}
              tooltip="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">تسجيل الخروج</span>
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
