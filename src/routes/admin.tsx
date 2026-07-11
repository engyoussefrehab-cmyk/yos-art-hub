import { Link, Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useAdminAuth } from "@/lib/admin-auth";
import { AdminSignInCard, BootstrapAdminCard } from "@/views/admin/AdminAuthCards";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

function AdminShell() {
  const auth = useAdminAuth();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground" dir="rtl">
        جاري التحميل…
      </div>
    );
  }
  if (auth.status === "signed-out") return <AdminSignInCard />;
  if (auth.status === "signed-in-not-admin")
    return <BootstrapAdminCard onDone={() => window.location.reload()} />;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full">
          <AdminSidebar email={auth.session.user.email} />
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Link to="/admin" className="text-sm font-semibold">
                  لوحة التحكم
                </Link>
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[45%]">
                {auth.session.user.email}
              </div>
            </header>
            <main className="flex-1 px-4 md:px-8 py-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة التحكم | يوسف رحاب" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminShell,
});
