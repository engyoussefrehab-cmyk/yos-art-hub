/**
 * Registry-driven admin sidebar. Reads modules from `module-registry`,
 * groups them by section, filters by feature flag + permission, and
 * resolves all labels through the admin i18n dictionary so every module
 * gets Arabic + English for free.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink, LogOut, Command, Languages } from "lucide-react";
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
import {
  listModulesBySection,
  type ModuleDefinition,
  type SidebarSection,
} from "@/admin/lib/module-registry";
import { AdminIcon } from "@/admin/shell/icon";
import { A, useAdminLang, type L } from "@/i18n/admin-lang";

const SECTION_LABELS: Record<SidebarSection, L> = {
  content: A.content_group,
  commerce: A.commerce_group,
  design: A.design_group,
  taxonomy: A.taxonomy_group,
  operations: A.ops_group,
  system: A.system_group,
  developer: A.developer_group,
};

function ModuleItem({
  module,
  currentPath,
}: {
  module: ModuleDefinition;
  currentPath: string;
}) {
  const { t } = useAdminLang();
  const active =
    module.route === "/admin"
      ? currentPath === "/admin" || currentPath === "/admin/"
      : currentPath === module.route || currentPath.startsWith(module.route + "/");
  const label = t(module.label);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label}>
        <Link to={module.route} className="flex items-center gap-3">
          <AdminIcon name={module.icon} className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar({
  email,
  onOpenCommandPalette,
}: {
  email?: string | null;
  onOpenCommandPalette?: () => void;
}) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { state } = useSidebar();
  const { lang, setLang, t } = useAdminLang();
  const collapsed = state === "collapsed";
  const sections = listModulesBySection();

  return (
    <Sidebar collapsible="icon" side={lang === "ar" ? "right" : "left"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            YR
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{t(A.cms_title)}</span>
              <span className="text-[10px] text-muted-foreground">
                {t(A.cms_subtitle)}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {(Object.keys(sections) as SidebarSection[]).map((section) => {
          const items = sections[section];
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={section}>
              {!collapsed && (
                <SidebarGroupLabel>{t(SECTION_LABELS[section])}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((m) => (
                    <ModuleItem key={m.key} module={m} currentPath={currentPath} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {onOpenCommandPalette && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onOpenCommandPalette} tooltip={t(A.cmd_button) + " (⌘K)"}>
                <Command className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(A.cmd_button)}</span>
                <span className="ms-auto text-[10px] text-muted-foreground">⌘K</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              tooltip={t(A.language)}
            >
              <Languages className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {lang === "ar" ? "English" : "العربية"}
              </span>
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
            <SidebarMenuButton onClick={() => supabase.auth.signOut()} tooltip={t(A.sign_out)}>
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(A.sign_out)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && email && (
          <div
            className="border-t border-sidebar-border/60 px-3 py-2 text-[11px] text-muted-foreground truncate"
            title={email}
          >
            {email}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
