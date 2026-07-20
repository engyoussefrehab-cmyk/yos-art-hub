/**
 * AdminShell — top-level admin layout.
 *
 * Composes registry-driven sidebar, header (with command-palette trigger
 * and search), and the `<Outlet />` for child routes. Bootstraps module
 * registration once on mount.
 */

import { Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Command as CommandIcon } from "lucide-react";
import { AdminSidebar } from "@/admin/shell/AdminSidebar";
import { CommandPalette } from "@/admin/shell/CommandPalette";
import { bootstrapAdminModules } from "@/admin/modules/register-all";
import { setPermissions, DEFAULT_RULES } from "@/admin/lib/permissions";

// Register entities + modules at module load so registry lookups
// (getEntity, etc.) succeed on the very first render — not only after
// the shell's useEffect has fired.
bootstrapAdminModules();
setPermissions(DEFAULT_RULES);

export function AdminShell({ email }: { email?: string | null }) {
  const [paletteOpen, setPaletteOpen] = useState(false);


  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full">
          <AdminSidebar
            email={email}
            onOpenCommandPalette={() => setPaletteOpen(true)}
          />
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Link to="/admin" className="text-sm font-semibold">
                  Studio CMS
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 text-xs"
                  onClick={() => setPaletteOpen(true)}
                >
                  <CommandIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search or run command…</span>
                  <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px]">
                    ⌘K
                  </kbd>
                </Button>
                {email && (
                  <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[220px]">
                    {email}
                  </span>
                )}
              </div>
            </header>
            <main className="flex-1 px-4 md:px-8 py-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
