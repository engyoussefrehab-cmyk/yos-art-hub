/**
 * Registry-driven admin sidebar. Reads modules from `module-registry`,
 * groups them by section, filters by feature flag + permission.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink, LogOut, Command } from "lucide-react";
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

const SECTION_LABELS: Record<SidebarSection, string> = {
  content: "Content",
  commerce: "Commerce",
  design: "Design",
  taxonomy: "Taxonomy",
  operations: "Operations",
  system: "System",
  developer: "Developer",
};

function ModuleItem({
  module,
  currentPath,
}: {
  module: ModuleDefinition;
  currentPath: string;
}) {
  const active =
    module.route === "/admin"
      ? currentPath === "/admin" || currentPath === "/admin/"
      : currentPath === module.route || currentPath.startsWith(module.route + "/");
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={module.label}>
        <Link to={module.route} className="flex items-center gap-3">
          <AdminIcon name={module.icon} className="h-4 w-4 shrink-0" />
          <span className="truncate">{module.label}</span>
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
  const collapsed = state === "collapsed";
  const sections = listModulesBySection();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            YR
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Studio CMS</span>
              <span className="text-[10px] text-muted-foreground">
                Yousef Rehab · CMS
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
                <SidebarGroupLabel>{SECTION_LABELS[section]}</SidebarGroupLabel>
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
              <SidebarMenuButton onClick={onOpenCommandPalette} tooltip="Command Palette (⌘K)">
                <Command className="h-4 w-4 shrink-0" />
                <span className="truncate">Command Palette</span>
                <span className="ml-auto text-[10px] text-muted-foreground">⌘K</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View Site">
              <Link to="/" className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">View Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => supabase.auth.signOut()} tooltip="Sign Out">
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Sign Out</span>
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
