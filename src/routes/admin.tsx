import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";
import { AdminSignInCard, BootstrapAdminCard } from "@/views/admin/AdminAuthCards";
import { createFileRoute } from "@tanstack/react-router";

function AdminShell() {
  const auth = useAdminAuth();
  const location = useLocation();

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

  // admin
  const signOut = () => supabase.auth.signOut();
  const isInsights = location.pathname.startsWith("/admin/insights");

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-display text-lg font-semibold text-foreground">
              لوحة التحكم
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                to="/admin/insights"
                className={`rounded-full px-3 py-1.5 transition-colors ${isInsights ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-accent"}`}
              >
                المقالات
              </Link>
              <Link
                to="/"
                className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-accent"
              >
                عرض الموقع
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{auth.session.user.email}</span>
            <button onClick={signOut} className="rounded-full border border-border px-3 py-1.5 hover:border-accent hover:text-accent">
              خروج
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
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
