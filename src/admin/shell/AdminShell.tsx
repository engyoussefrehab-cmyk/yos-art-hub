/**
 * AdminShell — top-level admin layout.
 *
 * Wraps the entire admin surface in a `dir` container so every child
 * (registry-driven views AND legacy routes) automatically flips between
 * RTL and LTR. Exposes a header language switcher in addition to the
 * sidebar footer control.
 */

import { Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Command as CommandIcon, Languages } from "lucide-react";
import { AdminSidebar } from "@/admin/shell/AdminSidebar";
import { CommandPalette } from "@/admin/shell/CommandPalette";
import { bootstrapAdminModules } from "@/admin/modules/register-all";
import { setPermissions, DEFAULT_RULES } from "@/admin/lib/permissions";
import { A, useAdminLang } from "@/i18n/admin-lang";

bootstrapAdminModules();
setPermissions(DEFAULT_RULES);

export function AdminShell({ email }: { email?: string | null }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { t, lang, setLang, dir } = useAdminLang();

  return (
    <div dir={dir} lang={lang} className="min-h-screen bg-background">
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
                  {t(A.cms_title)}
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
                  <span className="hidden sm:inline">{t(A.cmd_button)}</span>
                  <kbd className="ms-2 rounded border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                  onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                  title={t(A.language)}
                >
                  <Languages className="h-3.5 w-3.5" />
                  <span>{lang === "ar" ? "EN" : "عربي"}</span>
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
