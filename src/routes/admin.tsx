import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { AdminSignInCard, BootstrapAdminCard } from "@/views/admin/AdminAuthCards";
import { AdminReauthGate, REAUTH_KEY } from "@/views/admin/AdminReauthGate";
import { AdminShell } from "@/admin/shell/AdminShell";

function AdminRoot() {
  const auth = useAdminAuth();
  const [reauthed, setReauthed] = useState<boolean>(() =>
    typeof window !== "undefined" && sessionStorage.getItem(REAUTH_KEY) === "1",
  );

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (auth.status === "signed-out") return <AdminSignInCard />;
  if (auth.status === "signed-in-not-admin")
    return <BootstrapAdminCard onDone={() => window.location.reload()} />;

  if (!reauthed) {
    return (
      <AdminReauthGate
        email={auth.session.user.email ?? ""}
        onSuccess={() => setReauthed(true)}
      />
    );
  }

  return <AdminShell email={auth.session.user.email} />;
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Studio CMS — Yousef Rehab" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoot,
});
